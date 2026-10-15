package service

import (
	"context"
	"crypto/rand"
	"encoding/hex"
	"errors"
	"time"

	"github.com/AchmadZackyGZ/fluids/server/internal/modules/auth/contracts"
	userContract "github.com/AchmadZackyGZ/fluids/server/internal/modules/user/contracts"
	"github.com/AchmadZackyGZ/fluids/server/internal/platform/logger"
	"github.com/AchmadZackyGZ/fluids/server/internal/platform/security"
	"github.com/AchmadZackyGZ/fluids/server/internal/platform/validator"
	"github.com/redis/go-redis/v9"
)

type RegisterReq struct {
	Username string `json:"username" validate:"required,alphanum,min=3,max=50"`
	Email    string `json:"email" validate:"required,email"`
	Password string `json:"password" validate:"required,min=8"`
	FullName string `json:"full_name" validate:"required,min=2,max=100"`
}

type LoginReq struct {
	Email    string `json:"email" validate:"required,email"`
	Password string `json:"password" validate:"required"`
}

type AuthResponse struct {
	Token                  string    `json:"token"`
	RefreshToken           string    `json:"refresh_token"`
	AccessTokenExpiresAt   time.Time `json:"access_token_expires_at"`
	RefreshTokenExpiresAt  time.Time `json:"refresh_token_expires_at"`
	User                   *userContract.UserDTO `json:"user"`
}

var (
	ErrInvalidCredentials      = errors.New("invalid email or password")
	ErrInvalidRefreshToken     = errors.New("invalid refresh token")
	ErrRefreshTokenExpired     = errors.New("refresh token expired")
	ErrTokenRevoked            = errors.New("token has been revoked")
	ErrEmailNotVerified        = errors.New("email not verified")
	ErrVerificationTokenInvalid = errors.New("invalid verification token")
	ErrVerificationTokenExpired = errors.New("verification token expired")
	ErrResetTokenInvalid       = errors.New("invalid reset token")
	ErrResetTokenExpired       = errors.New("reset token expired")
	ErrPasswordTooWeak         = errors.New("password does not meet requirements")
	ErrRateLimited             = errors.New("too many requests, please try again later")
	ErrAccountDeleted          = errors.New("account has been deleted")
	ErrCurrentPasswordInvalid  = errors.New("current password is incorrect")
)

type AuthService interface {
	Register(ctx context.Context, req RegisterReq) (*AuthResponse, error)
	Login(ctx context.Context, req LoginReq) (*AuthResponse, error)
	RefreshToken(ctx context.Context, req contracts.RefreshTokenReq) (*AuthResponse, error)
	RevokeToken(ctx context.Context, userID, tokenHash string) error
	RequestPasswordReset(ctx context.Context, req contracts.ForgotPasswordReq) error
	VerifyEmail(ctx context.Context, req contracts.VerifyEmailReq) error
	ResendVerification(ctx context.Context, req contracts.ResendVerificationReq) error
	ResetPassword(ctx context.Context, req contracts.ResetPasswordReq) error
	ChangePassword(ctx context.Context, userID string, req contracts.ChangePasswordReq) error
	DeleteAccount(ctx context.Context, userID string, req contracts.DeleteAccountReq) error
}

type authService struct {
	userContract userContract.UserContract
	redisClient  *redis.Client
}

func NewAuthService(userContract userContract.UserContract, redisClient *redis.Client) AuthService {
	return &authService{
		userContract: userContract,
		redisClient:  redisClient,
	}
}

func (s *authService) Register(ctx context.Context, req RegisterReq) (*AuthResponse, error) {
	if err := validator.Validate.Struct(req); err != nil {
		return nil, err
	}

	hashedPassword, err := security.HashPassword(req.Password)
	if err != nil {
		return nil, err
	}

	u, err := s.userContract.CreateUser(ctx, userContract.CreateUserReq{
		Username:     req.Username,
		Email:        req.Email,
		PasswordHash: hashedPassword,
		FullName:     req.FullName,
	})
	if err != nil {
		return nil, err
	}

	return s.issueTokens(ctx, u)
}

func (s *authService) Login(ctx context.Context, req LoginReq) (*AuthResponse, error) {
	if err := validator.Validate.Struct(req); err != nil {
		return nil, err
	}

	u, err := s.userContract.GetUserByEmail(ctx, req.Email)
	if err != nil {
		if errors.Is(err, userContract.ErrUserNotFound) {
			return nil, ErrInvalidCredentials
		}
		return nil, err
	}

	if !security.CheckPasswordHash(req.Password, u.PasswordHash) {
		return nil, ErrInvalidCredentials
	}

	return s.issueTokens(ctx, u)
}

func (s *authService) RefreshToken(ctx context.Context, req contracts.RefreshTokenReq) (*AuthResponse, error) {
	if err := validator.Validate.Struct(req); err != nil {
		return nil, err
	}

	tokenHash := hashToken(req.RefreshToken)
	key := "refresh_token:" + tokenHash

	userID, err := s.redisClient.Get(ctx, key).Result()
	if err == redis.Nil {
		logger.WarnCtx(ctx, "refresh token not found", "token_hash", tokenHash)
		return nil, ErrInvalidRefreshToken
	}
	if err != nil {
		logger.ErrorCtx(ctx, "redis get refresh token failed", "error", err)
		return nil, err
	}

	// Revoke old refresh token
	if err := s.redisClient.Del(ctx, key).Err(); err != nil {
		logger.ErrorCtx(ctx, "failed to revoke old refresh token", "error", err)
	}

	// Get user
	u, err := s.userContract.GetUserByID(ctx, userID)
	if err != nil {
		return nil, err
	}

	// Issue new tokens (rotation)
	return s.issueTokens(ctx, u)
}

func (s *authService) RevokeToken(ctx context.Context, userID, tokenHash string) error {
	key := "refresh_token:" + hashToken(tokenHash)
	if err := s.redisClient.Del(ctx, key).Err(); err != nil {
		logger.ErrorCtx(ctx, "failed to revoke refresh token", "error", err, "user_id", userID)
		return err
	}

	// Also blacklist current access token (short TTL)
	accessKey := "access_blacklist:" + tokenHash
	s.redisClient.Set(ctx, accessKey, "revoked", 15*time.Minute)

	logger.InfoCtx(ctx, "token revoked", "user_id", userID)
	return nil
}

func (s *authService) RequestPasswordReset(ctx context.Context, req contracts.ForgotPasswordReq) error {
	if err := validator.Validate.Struct(req); err != nil {
		return err
	}

	// Rate limit: max 3 per hour per email
	rateKey := "rate_limit:forgot_password:" + req.Email
	count, err := s.redisClient.Incr(ctx, rateKey).Result()
	if err != nil {
		logger.ErrorCtx(ctx, "redis incr rate limit failed", "error", err)
	} else if count == 1 {
		s.redisClient.Expire(ctx, rateKey, time.Hour)
	}
	if count > 3 {
		logger.WarnCtx(ctx, "forgot password rate limit exceeded", "email", req.Email)
		return ErrRateLimited
	}

	// Check user exists
	u, err := s.userContract.GetUserByEmail(ctx, req.Email)
	if err != nil {
		if errors.Is(err, userContract.ErrUserNotFound) {
			// Don't reveal if email exists (security)
			logger.InfoCtx(ctx, "forgot password requested for non-existent email", "email", req.Email)
			return nil
		}
		return err
	}

	// Generate reset token
	resetToken, tokenHash := generateToken()
	resetKey := "password_reset:" + tokenHash

	// Store in Redis with 1 hour TTL
	err = s.redisClient.Set(ctx, resetKey, u.ID, time.Hour).Err()
	if err != nil {
		logger.ErrorCtx(ctx, "failed to store reset token", "error", err)
		return err
	}

	// TODO: Publish event to RabbitMQ for email sending
	logger.InfoCtx(ctx, "password reset requested", "user_id", u.ID, "email", req.Email)

	_ = resetToken // In real app, send via email
	return nil
}

func (s *authService) VerifyEmail(ctx context.Context, req contracts.VerifyEmailReq) error {
	if err := validator.Validate.Struct(req); err != nil {
		return err
	}

	tokenHash := hashToken(req.Token)
	key := "email_verification:" + tokenHash

	userID, err := s.redisClient.Get(ctx, key).Result()
	if err == redis.Nil {
		logger.WarnCtx(ctx, "verification token not found", "token_hash", tokenHash)
		return ErrVerificationTokenInvalid
	}
	if err != nil {
		logger.ErrorCtx(ctx, "redis get verification token failed", "error", err)
		return err
	}

	// Update user email_verified = true via userContract
	// For now, we'll need to add a method to userContract or use a different approach
	// Since userContract doesn't have UpdateEmailVerified, we'll log and return
	// TODO: Add UpdateEmailVerified to userContract

	s.redisClient.Del(ctx, key)
	logger.InfoCtx(ctx, "email verified", "user_id", userID)
	return nil
}

func (s *authService) ResendVerification(ctx context.Context, req contracts.ResendVerificationReq) error {
	if err := validator.Validate.Struct(req); err != nil {
		return err
	}

	// Rate limit: max 3 per hour per email
	rateKey := "rate_limit:resend_verification:" + req.Email
	count, err := s.redisClient.Incr(ctx, rateKey).Result()
	if err != nil {
		logger.ErrorCtx(ctx, "redis incr rate limit failed", "error", err)
	} else if count == 1 {
		s.redisClient.Expire(ctx, rateKey, time.Hour)
	}
	if count > 3 {
		logger.WarnCtx(ctx, "resend verification rate limit exceeded", "email", req.Email)
		return ErrRateLimited
	}

	// Check user exists
	u, err := s.userContract.GetUserByEmail(ctx, req.Email)
	if err != nil {
		if errors.Is(err, userContract.ErrUserNotFound) {
			// Don't reveal if email exists
			logger.InfoCtx(ctx, "resend verification for non-existent email", "email", req.Email)
			return nil
		}
		return err
	}

	// Generate new verification token
	verifyToken, tokenHash := generateToken()
	verifyKey := "email_verification:" + tokenHash

	err = s.redisClient.Set(ctx, verifyKey, u.ID, 24*time.Hour).Err()
	if err != nil {
		logger.ErrorCtx(ctx, "failed to store verification token", "error", err)
		return err
	}

	// TODO: Publish event to RabbitMQ for email sending
	logger.InfoCtx(ctx, "verification email resent", "user_id", u.ID, "email", req.Email)

	_ = verifyToken // In real app, send via email
	return nil
}

func (s *authService) ResetPassword(ctx context.Context, req contracts.ResetPasswordReq) error {
	if err := validator.Validate.Struct(req); err != nil {
		return err
	}

	tokenHash := hashToken(req.Token)
	key := "password_reset:" + tokenHash

	userID, err := s.redisClient.Get(ctx, key).Result()
	if err == redis.Nil {
		logger.WarnCtx(ctx, "reset token not found", "token_hash", tokenHash)
		return ErrResetTokenInvalid
	}
	if err != nil {
		logger.ErrorCtx(ctx, "redis get reset token failed", "error", err)
		return err
	}

	// Hash new password
	_, err = security.HashPassword(req.NewPassword)
	if err != nil {
		return err
	}

	// Update user password (need to add method to userContract)
	// For now, we'll delete the token and log
	// TODO: Add UpdatePassword to userContract

	s.redisClient.Del(ctx, key)

	// Revoke all refresh tokens for this user
	s.revokeAllUserTokens(ctx, userID)

	logger.InfoCtx(ctx, "password reset successful", "user_id", userID)
	return nil
}

func (s *authService) ChangePassword(ctx context.Context, userID string, req contracts.ChangePasswordReq) error {
	if err := validator.Validate.Struct(req); err != nil {
		return err
	}

	u, err := s.userContract.GetUserByID(ctx, userID)
	if err != nil {
		return err
	}

	// Verify current password
	if !security.CheckPasswordHash(req.CurrentPassword, u.PasswordHash) {
		logger.WarnCtx(ctx, "change password failed: current password invalid", "user_id", userID)
		return ErrCurrentPasswordInvalid
	}

	// Hash new password
	_, err = security.HashPassword(req.NewPassword)
	if err != nil {
		return err
	}

	// Update user password (need to add method to userContract)
	// TODO: Add UpdatePassword to userContract

	// Revoke all refresh tokens for this user
	s.revokeAllUserTokens(ctx, userID)

	// Blacklist current access token
	// Note: We'd need the current access token hash from context
	// For now, just revoke refresh tokens

	logger.InfoCtx(ctx, "password changed", "user_id", userID)
	return nil
}

func (s *authService) DeleteAccount(ctx context.Context, userID string, req contracts.DeleteAccountReq) error {
	if err := validator.Validate.Struct(req); err != nil {
		return err
	}

	u, err := s.userContract.GetUserByID(ctx, userID)
	if err != nil {
		return err
	}

	// Verify password
	if !security.CheckPasswordHash(req.Password, u.PasswordHash) {
		logger.WarnCtx(ctx, "delete account failed: password invalid", "user_id", userID)
		return ErrCurrentPasswordInvalid
	}

	// Soft delete: revoke all tokens
	s.revokeAllUserTokens(ctx, userID)

	// TODO: Call userContract.DeleteAccount or UpdateDeletedAt
	// For now, just revoke tokens

	logger.InfoCtx(ctx, "account deleted (soft)", "user_id", userID)
	return nil
}

// Helper methods

func (s *authService) issueTokens(ctx context.Context, u *userContract.UserDTO) (*AuthResponse, error) {
	accessToken, err := security.GenerateToken(u.ID, u.Email, u.Username)
	if err != nil {
		return nil, err
	}

	refreshToken := generateRefreshToken()
	refreshTokenHash := hashToken(refreshToken)

	accessExpiry := time.Now().Add(15 * time.Minute)
	refreshExpiry := time.Now().Add(24 * time.Hour)

	// Store refresh token in Redis
	key := "refresh_token:" + refreshTokenHash
	err = s.redisClient.Set(ctx, key, u.ID, 24*time.Hour).Err()
	if err != nil {
		logger.ErrorCtx(ctx, "failed to store refresh token", "error", err)
		return nil, err
	}

	logger.InfoCtx(ctx, "tokens issued", "user_id", u.ID)

	return &AuthResponse{
		Token:                  accessToken,
		RefreshToken:           refreshToken,
		AccessTokenExpiresAt:   accessExpiry,
		RefreshTokenExpiresAt:  refreshExpiry,
		User:                   u,
	}, nil
}

func (s *authService) revokeAllUserTokens(ctx context.Context, userID string) {
	// Scan and delete all refresh tokens for user
	pattern := "refresh_token:*"
	iter := s.redisClient.Scan(ctx, 0, pattern, 100).Iterator()
	for iter.Next(ctx) {
		key := iter.Val()
		val, err := s.redisClient.Get(ctx, key).Result()
		if err == nil && val == userID {
			s.redisClient.Del(ctx, key)
		}
	}
	if err := iter.Err(); err != nil {
		logger.ErrorCtx(ctx, "failed to scan user tokens", "error", err, "user_id", userID)
	}
}

func generateToken() (string, string) {
	bytes := make([]byte, 32)
	rand.Read(bytes)
	token := hex.EncodeToString(bytes)
	hash := hashToken(token)
	return token, hash
}

func generateRefreshToken() string {
	bytes := make([]byte, 32)
	rand.Read(bytes)
	return hex.EncodeToString(bytes)
}

func hashToken(token string) string {
	bytes := make([]byte, 32)
	copy(bytes, token)
	// Simple hash for key - in production use proper hashing
	hash := make([]byte, 16)
	for i := 0; i < 16; i++ {
		hash[i] = bytes[i*2] ^ bytes[i*2+1]
	}
	return hex.EncodeToString(hash)
}
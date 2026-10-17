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

// ============================================================
// ATURAN LOGGING DI SERVICE (lihat AGENTS.md bagian Logging)
//
//   - INFO  : event bisnis yang BERHASIL ("password changed", "email verified")
//   - WARN  : hal mencurigakan tapi sudah tertangani ("rate limit exceeded",
//             "token tidak ditemukan", gagal bersih-bersih yang tidak fatal)
//   - ERROR : HANYA kegagalan sistem yang TIDAK dikembalikan ke caller
//             (mis. cleanup di fungsi void) — karena tidak ada jalur lain
//             yang bisa melaporkannya
//
//   ❌ JANGAN pakai logger.ErrorCtx untuk error yang di-return.
//      Handler yang akan mencatatnya SEKALI. Kalau di sini juga dicatat,
//      satu kegagalan jadi dua baris log (double-logging).
// ============================================================

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
	Token                 string                `json:"token"`
	RefreshToken          string                `json:"refresh_token"`
	AccessTokenExpiresAt  time.Time             `json:"access_token_expires_at"`
	RefreshTokenExpiresAt time.Time             `json:"refresh_token_expires_at"`
	User                  *userContract.UserDTO `json:"user"`
}

var (
	ErrInvalidCredentials       = errors.New("invalid email or password")
	ErrInvalidRefreshToken      = errors.New("invalid refresh token")
	ErrRefreshTokenExpired      = errors.New("refresh token expired")
	ErrTokenRevoked             = errors.New("token has been revoked")
	ErrEmailNotVerified         = errors.New("email not verified")
	ErrVerificationTokenInvalid = errors.New("invalid verification token")
	ErrVerificationTokenExpired = errors.New("verification token expired")
	ErrResetTokenInvalid        = errors.New("invalid reset token")
	ErrResetTokenExpired        = errors.New("reset token expired")
	ErrPasswordTooWeak          = errors.New("password does not meet requirements")
	ErrRateLimited              = errors.New("too many requests, please try again later")
	ErrAccountDeleted           = errors.New("account has been deleted")
	ErrCurrentPasswordInvalid   = errors.New("current password is incorrect")
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
			// Jangan bocorkan apakah email terdaftar (security).
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

	tokenHash := security.HashToken(req.RefreshToken)
	key := "refresh_token:" + tokenHash

	userID, err := s.redisClient.Get(ctx, key).Result()
	if err == redis.Nil {
		// Token tidak ada = kemungkinan sudah dipakai/kedaluwarsa. Ini kondisi
		// normal dari sisi sistem -> WARN, bukan ERROR.
		logger.WarnCtx(ctx, "refresh token not found", "token_hash", tokenHash)
		return nil, ErrInvalidRefreshToken
	}
	if err != nil {
		return nil, err // handler yang mencatat
	}

	// Rotasi: token lama dihapus. Kalau gagal, tidak fatal — token lama akan
	// kedaluwarsa sendiri dalam 24 jam, dan user tetap dapat token baru.
	if err := s.redisClient.Del(ctx, key).Err(); err != nil {
		logger.WarnCtx(ctx, "failed to revoke old refresh token", "error", err, "user_id", userID)
	} else {
		s.redisClient.SRem(ctx, tokenSetKey(userID), tokenHash)
	}

	u, err := s.userContract.GetUserByID(ctx, userID)
	if err != nil {
		return nil, err
	}

	return s.issueTokens(ctx, u)
}

func (s *authService) RevokeToken(ctx context.Context, userID, tokenHash string) error {
	// tokenHash SUDAH berupa hash dari handler (security.HashToken).
	// Versi sebelumnya menghash ULANG di sini, sehingga key yang dihapus
	// tidak pernah cocok -> logout tidak benar-benar mencabut token.
	key := "refresh_token:" + tokenHash

	if err := s.redisClient.Del(ctx, key).Err(); err != nil {
		return err
	}

	// Bersihkan juga dari index per-user supaya tidak jadi sampah.
	s.redisClient.SRem(ctx, tokenSetKey(userID), tokenHash)

	// Siapkan blacklist access token (TTL pendek). Belum ditegakkan karena
	// access token belum membawa jti — kandidat perbaikan lanjutan.
	s.redisClient.Set(ctx, "access_blacklist:"+tokenHash, "revoked", 15*time.Minute)

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
		// Rate limit gagal dihitung bukan alasan menggagalkan request user.
		logger.WarnCtx(ctx, "redis incr rate limit failed", "error", err)
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
	if err := s.redisClient.Set(ctx, resetKey, u.ID, time.Hour).Err(); err != nil {
		return err
	}

	// DEV ONLY — memudahkan tes manual sebelum email worker ada (Step F).
	// Aman karena level DEBUG tidak tampil pada LOG_LEVEL default (info).
	// HAPUS blok ini begitu RabbitMQ + email worker aktif.
	logger.DebugCtx(ctx, "dev token", "user_id", u.ID, "raw_token", resetToken)

	// TODO(step-f): kirim email reset lewat RabbitMQ.
	// platform/messaging belum ada — dikerjakan di Step F.
	logger.InfoCtx(ctx, "password reset requested", "user_id", u.ID, "email", req.Email)

	return nil
}

func (s *authService) VerifyEmail(ctx context.Context, req contracts.VerifyEmailReq) error {
	if err := validator.Validate.Struct(req); err != nil {
		return err
	}

	tokenHash := security.HashToken(req.Token)
	key := "email_verification:" + tokenHash

	userID, err := s.redisClient.Get(ctx, key).Result()
	if err == redis.Nil {
		logger.WarnCtx(ctx, "verification token not found", "token_hash", tokenHash)
		return ErrVerificationTokenInvalid
	}
	if err != nil {
		return err
	}

	// 1. Update DULU di database. Kalau ini gagal, token JANGAN dihapus
	//    supaya user masih bisa mencoba lagi dengan token yang sama.
	if err := s.userContract.UpdateEmailVerified(ctx, userID, true); err != nil {
		return err
	}

	// 2. Baru hapus token (sekali pakai). Gagal di sini tidak fatal.
	if err := s.redisClient.Del(ctx, key).Err(); err != nil {
		logger.WarnCtx(ctx, "failed to delete verification token", "error", err, "user_id", userID)
	}

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
		logger.WarnCtx(ctx, "redis incr rate limit failed", "error", err)
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

	if err := s.redisClient.Set(ctx, verifyKey, u.ID, 24*time.Hour).Err(); err != nil {
		return err
	}

	// DEV ONLY — memudahkan tes manual sebelum email worker ada (Step F).
	// Aman karena level DEBUG tidak tampil pada LOG_LEVEL default (info).
	// HAPUS blok ini begitu RabbitMQ + email worker aktif.
	logger.DebugCtx(ctx, "dev token", "user_id", u.ID, "raw_token", verifyToken)

	// TODO(step-f): kirim ulang email verifikasi lewat RabbitMQ.
	// platform/messaging belum ada — dikerjakan di Step F.
	logger.InfoCtx(ctx, "verification email resent", "user_id", u.ID, "email", req.Email)

	return nil
}

func (s *authService) ResetPassword(ctx context.Context, req contracts.ResetPasswordReq) error {
	if err := validator.Validate.Struct(req); err != nil {
		return err
	}

	tokenHash := security.HashToken(req.Token)
	key := "password_reset:" + tokenHash

	userID, err := s.redisClient.Get(ctx, key).Result()
	if err == redis.Nil {
		logger.WarnCtx(ctx, "reset token not found", "token_hash", tokenHash)
		return ErrResetTokenInvalid
	}
	if err != nil {
		return err
	}

	// 1. Hash password baru — hasilnya HARUS dipakai.
	newHash, err := security.HashPassword(req.NewPassword)
	if err != nil {
		return err
	}

	// 2. Simpan ke database.
	if err := s.userContract.UpdatePassword(ctx, userID, newHash); err != nil {
		return err
	}

	// 3. Password sudah berubah -> token reset hangus.
	if err := s.redisClient.Del(ctx, key).Err(); err != nil {
		logger.WarnCtx(ctx, "failed to delete reset token", "error", err, "user_id", userID)
	}

	// 4. Semua sesi lama harus mati.
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

	// 1. Hash password baru.
	newHash, err := security.HashPassword(req.NewPassword)
	if err != nil {
		return err
	}

	// 2. Simpan ke database.
	if err := s.userContract.UpdatePassword(ctx, userID, newHash); err != nil {
		return err
	}

	// 3. Semua sesi lama harus mati — termasuk sesi di device lain.
	s.revokeAllUserTokens(ctx, userID)

	// Catatan: access token yang sedang aktif masih berlaku sampai 15 menit.
	// Blacklist access token butuh token aslinya dari request context.

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

	// 1. Soft delete dulu di database.
	if err := s.userContract.DeleteAccount(ctx, userID); err != nil {
		return err
	}

	// 2. Baru cabut semua sesi.
	s.revokeAllUserTokens(ctx, userID)

	logger.InfoCtx(ctx, "account soft-deleted", "user_id", userID)
	return nil
}

// ============================================================
// Helper
// ============================================================

func (s *authService) issueTokens(ctx context.Context, u *userContract.UserDTO) (*AuthResponse, error) {
	accessToken, err := security.GenerateToken(u.ID, u.Email, u.Username)
	if err != nil {
		return nil, err
	}

	refreshToken := generateRefreshToken()
	refreshTokenHash := security.HashToken(refreshToken)

	accessExpiry := time.Now().Add(15 * time.Minute)
	refreshExpiry := time.Now().Add(24 * time.Hour)

	// 1. Simpan refresh token: refresh_token:<hash> -> userID
	key := "refresh_token:" + refreshTokenHash
	if err := s.redisClient.Set(ctx, key, u.ID, 24*time.Hour).Err(); err != nil {
		return nil, err
	}

	// 2. Catat hash-nya di index per-user. Dengan ini revokeAllUserTokens
	//    tidak perlu SCAN seluruh keyspace (O(N)) — cukup O(k), k = jumlah
	//    token milik user tersebut.
	setKey := tokenSetKey(u.ID)
	if err := s.redisClient.SAdd(ctx, setKey, refreshTokenHash).Err(); err != nil {
		return nil, err
	}
	s.redisClient.Expire(ctx, setKey, 24*time.Hour)

	logger.DebugCtx(ctx, "tokens issued", "user_id", u.ID)

	return &AuthResponse{
		Token:                 accessToken,
		RefreshToken:          refreshToken,
		AccessTokenExpiresAt:  accessExpiry,
		RefreshTokenExpiresAt: refreshExpiry,
		User:                  u,
	}, nil
}

// tokenSetKey = Redis SET berisi hash refresh token milik satu user.
func tokenSetKey(userID string) string {
	return "user_refresh_tokens:" + userID
}

// revokeAllUserTokens mencabut SEMUA sesi milik satu user.
//
// Versi sebelumnya memakai SCAN "refresh_token:*" lalu GET setiap key untuk
// membandingkan nilainya dengan userID. Itu O(N) terhadap SELURUH keyspace
// Redis: makin banyak user aktif, makin lambat logout/ganti-password semua
// orang. Sekarang cukup baca index per-user.
func (s *authService) revokeAllUserTokens(ctx context.Context, userID string) {
	setKey := tokenSetKey(userID)

	hashes, err := s.redisClient.SMembers(ctx, setKey).Result()
	if err != nil {
		// Fungsi ini tidak mengembalikan error, jadi tidak ada jalur lain yang
		// bisa melaporkan kegagalan ini -> ERROR di sini sah.
		logger.ErrorCtx(ctx, "failed to read user token index", "error", err, "user_id", userID)
		return
	}

	if len(hashes) == 0 {
		return
	}

	keys := make([]string, 0, len(hashes)+1)
	for _, h := range hashes {
		keys = append(keys, "refresh_token:"+h)
	}
	keys = append(keys, setKey)

	if err := s.redisClient.Del(ctx, keys...).Err(); err != nil {
		logger.ErrorCtx(ctx, "failed to revoke user tokens", "error", err, "user_id", userID)
		return
	}

	logger.InfoCtx(ctx, "all user sessions revoked", "user_id", userID, "count", len(hashes))
}

func generateToken() (string, string) {
	bytes := make([]byte, 32)
	rand.Read(bytes)
	token := hex.EncodeToString(bytes)
	hash := security.HashToken(token)
	return token, hash
}

func generateRefreshToken() string {
	bytes := make([]byte, 32)
	rand.Read(bytes)
	return hex.EncodeToString(bytes)
}

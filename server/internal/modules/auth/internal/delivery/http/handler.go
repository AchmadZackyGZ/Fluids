package http

import (
	"encoding/hex"
	"errors"
	"net/http"

	"github.com/AchmadZackyGZ/fluids/server/internal/modules/auth/contracts"
	"github.com/AchmadZackyGZ/fluids/server/internal/modules/auth/internal/service"
	userContract "github.com/AchmadZackyGZ/fluids/server/internal/modules/user/contracts"
	"github.com/AchmadZackyGZ/fluids/server/internal/platform/logger"
	"github.com/AchmadZackyGZ/fluids/server/internal/platform/validator"
	validatorpkg "github.com/go-playground/validator/v10"
	"github.com/labstack/echo/v4"
)

type AuthHandler struct {
	svc service.AuthService
}

func NewAuthHandler(svc service.AuthService) *AuthHandler {
	return &AuthHandler{svc: svc}
}

// POST /api/v1/auth/register
func (h *AuthHandler) Register(c echo.Context) error {
	var req service.RegisterReq
	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "invalid request body"})
	}

	ctx := c.Request().Context()
	logger.InfoCtx(ctx, "register attempt", logger.SanitizeArgs("email", req.Email, "password", req.Password)...)

	user, err := h.svc.Register(ctx, req)
	if err != nil {
		logger.ErrorCtx(ctx, "register failed", logger.SanitizeArgs("error", err, "email", req.Email)...)
		return h.mapError(c, err)
	}

	logger.InfoCtx(ctx, "user registered", "user_id", user.User.ID, "email", user.User.Email)
	return c.JSON(http.StatusCreated, user)
}

// POST /api/v1/auth/login
func (h *AuthHandler) Login(c echo.Context) error {
	var req service.LoginReq
	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "invalid request body"})
	}

	ctx := c.Request().Context()
	logger.InfoCtx(ctx, "login attempt", logger.SanitizeArgs("email", req.Email, "password", req.Password)...)

	res, err := h.svc.Login(ctx, req)
	if err != nil {
		logger.ErrorCtx(ctx, "login failed", logger.SanitizeArgs("error", err, "email", req.Email)...)
		return h.mapError(c, err)
	}

	logger.InfoCtx(ctx, "login success", "email", req.Email)
	return c.JSON(http.StatusOK, map[string]interface{}{
		"status": "success",
		"data":   res,
	})
}

// POST /api/v1/auth/refresh
func (h *AuthHandler) RefreshToken(c echo.Context) error {
	var req contracts.RefreshTokenReq
	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "invalid request body"})
	}

	ctx := c.Request().Context()
	logger.InfoCtx(ctx, "refresh token attempt")

	res, err := h.svc.RefreshToken(ctx, req)
	if err != nil {
		logger.ErrorCtx(ctx, "refresh token failed", "error", err)
		return h.mapError(c, err)
	}

	logger.InfoCtx(ctx, "refresh token success")
	return c.JSON(http.StatusOK, map[string]interface{}{
		"status": "success",
		"data":   res,
	})
}

// POST /api/v1/auth/logout
func (h *AuthHandler) Logout(c echo.Context) error {
	userID := c.Get("user_id").(string)

	// Get refresh token from cookie or body
	var req struct {
		RefreshToken string `json:"refresh_token"`
	}
	if err := c.Bind(&req); err != nil {
		// Try to get from cookie
		cookie, err := c.Cookie("refresh_token")
		if err == nil {
			req.RefreshToken = cookie.Value
		}
	}

	ctx := c.Request().Context()
	logger.InfoCtx(ctx, "logout attempt", "user_id", userID)

	if req.RefreshToken != "" {
		tokenHash := hashToken(req.RefreshToken)
		if err := h.svc.RevokeToken(ctx, userID, tokenHash); err != nil {
			logger.ErrorCtx(ctx, "logout failed", "error", err, "user_id", userID)
			return h.mapError(c, err)
		}
	}

	// Clear cookies
	c.SetCookie(&http.Cookie{
		Name:     "refresh_token",
		Value:    "",
		Path:     "/",
		MaxAge:   -1,
		HttpOnly: true,
		Secure:   true,
		SameSite: http.SameSiteLaxMode,
	})

	logger.InfoCtx(ctx, "logout success", "user_id", userID)
	return c.JSON(http.StatusOK, map[string]string{"status": "success", "message": "logged out"})
}

// POST /api/v1/auth/forgot-password
func (h *AuthHandler) ForgotPassword(c echo.Context) error {
	var req contracts.ForgotPasswordReq
	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "invalid request body"})
	}

	ctx := c.Request().Context()
	logger.InfoCtx(ctx, "forgot password attempt", "email", req.Email)

	if err := h.svc.RequestPasswordReset(ctx, req); err != nil {
		logger.ErrorCtx(ctx, "forgot password failed", "error", err, "email", req.Email)
		return h.mapError(c, err)
	}

	logger.InfoCtx(ctx, "forgot password success", "email", req.Email)
	return c.JSON(http.StatusOK, map[string]string{"status": "success", "message": "if email exists, reset link sent"})
}

// POST /api/v1/auth/verify-email
func (h *AuthHandler) VerifyEmail(c echo.Context) error {
	var req contracts.VerifyEmailReq
	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "invalid request body"})
	}

	ctx := c.Request().Context()
	logger.InfoCtx(ctx, "verify email attempt", "token", req.Token[:8]+"...")

	if err := h.svc.VerifyEmail(ctx, req); err != nil {
		logger.ErrorCtx(ctx, "verify email failed", "error", err)
		return h.mapError(c, err)
	}

	logger.InfoCtx(ctx, "verify email success")
	return c.JSON(http.StatusOK, map[string]string{"status": "success", "message": "email verified"})
}

// POST /api/v1/auth/resend-verification
func (h *AuthHandler) ResendVerification(c echo.Context) error {
	var req contracts.ResendVerificationReq
	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "invalid request body"})
	}

	ctx := c.Request().Context()
	logger.InfoCtx(ctx, "resend verification attempt", "email", req.Email)

	if err := h.svc.ResendVerification(ctx, req); err != nil {
		logger.ErrorCtx(ctx, "resend verification failed", "error", err, "email", req.Email)
		return h.mapError(c, err)
	}

	logger.InfoCtx(ctx, "resend verification success", "email", req.Email)
	return c.JSON(http.StatusOK, map[string]string{"status": "success", "message": "if email exists, verification sent"})
}

// POST /api/v1/auth/reset-password
func (h *AuthHandler) ResetPassword(c echo.Context) error {
	var req contracts.ResetPasswordReq
	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "invalid request body"})
	}

	ctx := c.Request().Context()
	logger.InfoCtx(ctx, "reset password attempt", logger.SanitizeArgs("token", req.Token[:8]+"...", "new_password", req.NewPassword)...)

	if err := h.svc.ResetPassword(ctx, req); err != nil {
		logger.ErrorCtx(ctx, "reset password failed", "error", err)
		return h.mapError(c, err)
	}

	logger.InfoCtx(ctx, "reset password success")
	return c.JSON(http.StatusOK, map[string]string{"status": "success", "message": "password reset"})
}

// PATCH /api/v1/auth/change-password
func (h *AuthHandler) ChangePassword(c echo.Context) error {
	userID := c.Get("user_id").(string)

	var req contracts.ChangePasswordReq
	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "invalid request body"})
	}

	ctx := c.Request().Context()
	logger.InfoCtx(ctx, "change password attempt", logger.SanitizeArgs("user_id", userID, "current_password", req.CurrentPassword, "new_password", req.NewPassword)...)

	if err := h.svc.ChangePassword(ctx, userID, req); err != nil {
		logger.ErrorCtx(ctx, "change password failed", "error", err, "user_id", userID)
		return h.mapError(c, err)
	}

	logger.InfoCtx(ctx, "change password success", "user_id", userID)
	return c.JSON(http.StatusOK, map[string]string{"status": "success", "message": "password changed"})
}

// DELETE /api/v1/auth/account
func (h *AuthHandler) DeleteAccount(c echo.Context) error {
	userID := c.Get("user_id").(string)

	var req contracts.DeleteAccountReq
	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "invalid request body"})
	}

	ctx := c.Request().Context()
	logger.InfoCtx(ctx, "delete account attempt", logger.SanitizeArgs("user_id", userID, "password", req.Password)...)

	if err := h.svc.DeleteAccount(ctx, userID, req); err != nil {
		logger.ErrorCtx(ctx, "delete account failed", "error", err, "user_id", userID)
		return h.mapError(c, err)
	}

	logger.InfoCtx(ctx, "delete account success", "user_id", userID)
	return c.JSON(http.StatusOK, map[string]string{"status": "success", "message": "account deleted"})
}

// Helper function for token hashing (must match service)
func hashToken(token string) string {
	// Simple hash for key - must match service implementation
	bytes := make([]byte, 32)
	copy(bytes, token)
	hash := make([]byte, 16)
	for i := 0; i < 16; i++ {
		hash[i] = bytes[i*2] ^ bytes[i*2+1]
	}
	return hex.EncodeToString(hash)
}

// handleAuthError memetakan error domain dan validasi menjadi HTTP Status Code yang presisi
func (h *AuthHandler) mapError(c echo.Context, err error) error {
	var verrs validatorpkg.ValidationErrors
	if errors.As(err, &verrs) {
		return c.JSON(http.StatusUnprocessableEntity, map[string]interface{}{
			"error":  "validation failed",
			"fields": validator.ValidationErrors(err),
		})
	}

	switch {
	case errors.Is(err, userContract.ErrEmailAlreadyExists):
		return c.JSON(http.StatusConflict, map[string]string{"error": "email already registered"})
	case errors.Is(err, userContract.ErrUsernameAlreadyExists):
		return c.JSON(http.StatusConflict, map[string]string{"error": "username already taken"})
	case errors.Is(err, userContract.ErrUserNotFound):
		return c.JSON(http.StatusNotFound, map[string]string{"error": "user not found"})
	case errors.Is(err, service.ErrInvalidCredentials):
		return c.JSON(http.StatusUnauthorized, map[string]string{"error": "invalid email or password"})
	case errors.Is(err, service.ErrInvalidRefreshToken):
		return c.JSON(http.StatusUnauthorized, map[string]string{"error": "invalid refresh token"})
	case errors.Is(err, service.ErrRefreshTokenExpired):
		return c.JSON(http.StatusUnauthorized, map[string]string{"error": "refresh token expired"})
	case errors.Is(err, service.ErrTokenRevoked):
		return c.JSON(http.StatusUnauthorized, map[string]string{"error": "token revoked"})
	case errors.Is(err, service.ErrEmailNotVerified):
		return c.JSON(http.StatusForbidden, map[string]string{"error": "email not verified"})
	case errors.Is(err, service.ErrVerificationTokenInvalid):
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "invalid verification token"})
	case errors.Is(err, service.ErrVerificationTokenExpired):
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "verification token expired"})
	case errors.Is(err, service.ErrResetTokenInvalid):
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "invalid reset token"})
	case errors.Is(err, service.ErrResetTokenExpired):
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "reset token expired"})
	case errors.Is(err, service.ErrPasswordTooWeak):
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "password too weak"})
	case errors.Is(err, service.ErrRateLimited):
		return c.JSON(http.StatusTooManyRequests, map[string]string{"error": "rate limited"})
	case errors.Is(err, service.ErrAccountDeleted):
		return c.JSON(http.StatusGone, map[string]string{"error": "account deleted"})
	case errors.Is(err, service.ErrCurrentPasswordInvalid):
		return c.JSON(http.StatusUnauthorized, map[string]string{"error": "current password invalid"})
	default:
		ctx := c.Request().Context()
		logger.ErrorCtx(ctx, "auth error", "error", err)
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "internal server error"})
	}
}
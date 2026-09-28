package http

import (
	"errors"
	"net/http"

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
		return c.JSON(http.StatusConflict, map[string]string{
			"error": "email already registered",
		})
	case errors.Is(err, userContract.ErrUsernameAlreadyExists):
		return c.JSON(http.StatusConflict, map[string]string{
			"error": "username already taken",
		})
	case errors.Is(err, userContract.ErrUserNotFound):
		return c.JSON(http.StatusNotFound, map[string]string{
			"error": "user not found",
		})
	case errors.Is(err, service.ErrInvalidCredentials):
		return c.JSON(http.StatusUnauthorized, map[string]string{
			"error": "invalid email or password",
		})
	default:
		ctx := c.Request().Context()
		logger.ErrorCtx(ctx, "auth error", "error", err)
		return c.JSON(http.StatusInternalServerError, map[string]string{
			"error": "internal server error",
		})
	}
}
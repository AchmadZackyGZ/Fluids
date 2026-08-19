package http

import (
	"errors"
	"net/http"

	"github.com/AchmadZackyGZ/fluids/server/internal/modules/auth/internal/service"
	userContract "github.com/AchmadZackyGZ/fluids/server/internal/modules/user/contracts"
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

	res, err := h.svc.Register(c.Request().Context(), req)
	if err != nil {
		return handleAuthError(c, err)
	}

	return c.JSON(http.StatusCreated, map[string]interface{}{
		"status": "success",
		"data":   res,
	})
}

// POST /api/v1/auth/login
func (h *AuthHandler) Login(c echo.Context) error {
	var req service.LoginReq
	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "invalid request body"})
	}

	res, err := h.svc.Login(c.Request().Context(), req)
	if err != nil {
		return handleAuthError(c, err)
	}

	return c.JSON(http.StatusOK, map[string]interface{}{
		"status": "success",
		"data":   res,
	})
}

// handleAuthError memetakan error domain dan validasi menjadi HTTP Status Code yang presisi
func handleAuthError(c echo.Context, err error) error {
	// Tangani Error Validasi Input (Status 422)
	var verrs validatorpkg.ValidationErrors
	if errors.As(err, &verrs) {
		return c.JSON(http.StatusUnprocessableEntity, map[string]interface{}{
			"error":  "validation failed",
			"fields": validator.ValidationErrors(err),
		})
	}

	// 2. Tangani Sentinel Errors Domain
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
		// Catat error aslinya ke terminal log untuk developer debugging
		c.Logger().Error(err)
		return c.JSON(http.StatusInternalServerError, map[string]string{
			"error": "internal server error",
		})
	}
}
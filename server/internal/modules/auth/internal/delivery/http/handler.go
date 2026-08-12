package http

import (
	"net/http"

	"github.com/AchmadZackyGZ/fluids/server/internal/modules/auth/internal/service"
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
		return c.JSON(http.StatusBadRequest, map[string]string{"error": err.Error()})
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
		return c.JSON(http.StatusUnauthorized, map[string]string{"error": err.Error()})
	}

	return c.JSON(http.StatusOK, map[string]interface{}{
		"status": "success",
		"data":   res,
	})
}
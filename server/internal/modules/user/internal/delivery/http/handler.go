package http

import (
	"errors"
	"net/http"

	"github.com/AchmadZackyGZ/fluids/server/internal/modules/user/contracts"
	"github.com/AchmadZackyGZ/fluids/server/internal/modules/user/internal/service"
	"github.com/AchmadZackyGZ/fluids/server/internal/platform/logger"
	"github.com/labstack/echo/v4"
)

type UserHandler struct {
	svc service.UserService
}

func NewUserHandler(svc service.UserService) *UserHandler {
	return &UserHandler{svc: svc}
}

func (h *UserHandler) GetMe(c echo.Context) error {
	userID, ok := c.Get("user_id").(string)
	if !ok || userID == "" {
		return c.JSON(http.StatusUnauthorized, map[string]string{"error": "unauthorized"})
	}

	ctx := c.Request().Context()
	logger.InfoCtx(ctx, "get me attempt", "user_id", userID)

	user, err := h.svc.GetUserByID(ctx, userID)
	if err != nil {
		if errors.Is(err, contracts.ErrUserNotFound) {
			logger.ErrorCtx(ctx, "get me failed: user not found", "error", err, "user_id", userID)
			return c.JSON(http.StatusNotFound, map[string]string{
				"error": "user not found",
			})
		}
		logger.ErrorCtx(ctx, "get me failed", "error", err, "user_id", userID)
		return c.JSON(http.StatusInternalServerError, map[string]string{
			"error": "internal server error",
		})
	}

	logger.InfoCtx(ctx, "get me success", "user_id", userID)
	return c.JSON(http.StatusOK, map[string]interface{}{
		"status": "success",
		"data":   user,
	})
}
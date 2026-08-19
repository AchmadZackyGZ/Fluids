package auth

import (
	"github.com/AchmadZackyGZ/fluids/server/internal/modules/auth/internal/delivery/http"
	"github.com/AchmadZackyGZ/fluids/server/internal/modules/auth/internal/service"
	"github.com/labstack/echo/v4"
	"go.uber.org/fx"
)

func RegisterAuthRoutes(e *echo.Echo, handler *http.AuthHandler) {
	g := e.Group("/api/v1/auth")
	g.POST("/register", handler.Register)
	g.POST("/login", handler.Login)
}

var Module = fx.Options(
	fx.Provide(service.NewAuthService),
	fx.Provide(http.NewAuthHandler),
	fx.Invoke(RegisterAuthRoutes),
)
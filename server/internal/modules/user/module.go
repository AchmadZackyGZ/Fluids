package user

import (
	"github.com/AchmadZackyGZ/fluids/server/internal/modules/user/internal/delivery/http"
	"github.com/AchmadZackyGZ/fluids/server/internal/modules/user/internal/repository"
	"github.com/AchmadZackyGZ/fluids/server/internal/modules/user/internal/service"
	"github.com/AchmadZackyGZ/fluids/server/internal/platform/security"
	"github.com/labstack/echo/v4"
	"go.uber.org/fx"
)

func RegisterUserRoutes(e *echo.Echo, handler *http.UserHandler) {
	g := e.Group("/api/v1/users")
	g.Use(security.JWTMiddleWare)
	g.GET("/me", handler.GetMe)
}

var Module = fx.Options(
	fx.Provide(repository.NewUserRepository),
	fx.Provide(service.NewUserService),
	fx.Provide(http.NewUserHandler),
	fx.Invoke(RegisterUserRoutes),
)
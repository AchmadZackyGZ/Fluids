package auth

import (
	"github.com/AchmadZackyGZ/fluids/server/internal/modules/auth/internal/delivery/http"
	"github.com/AchmadZackyGZ/fluids/server/internal/modules/auth/internal/service"
	"github.com/AchmadZackyGZ/fluids/server/internal/platform/security"
	"github.com/labstack/echo/v4"
	"go.uber.org/fx"
)

func RegisterAuthRoutes(e *echo.Echo, handler *http.AuthHandler) {
	public := e.Group("/api/v1/auth")
	public.POST("/register", handler.Register)
	public.POST("/login", handler.Login)
	public.POST("/refresh", handler.RefreshToken)
	public.POST("/forgot-password", handler.ForgotPassword)
	public.POST("/verify-email", handler.VerifyEmail)
	public.POST("/resend-verification", handler.ResendVerification)
	public.POST("/reset-password", handler.ResetPassword)

	protected := e.Group("/api/v1/auth")
	protected.Use(security.JWTMiddleWare)
	protected.POST("/logout", handler.Logout)
	protected.PATCH("/change-password", handler.ChangePassword)
	protected.DELETE("/account", handler.DeleteAccount)
}

var Module = fx.Options(
	fx.Provide(service.NewAuthService),
	fx.Provide(http.NewAuthHandler),
	fx.Invoke(RegisterAuthRoutes),
)
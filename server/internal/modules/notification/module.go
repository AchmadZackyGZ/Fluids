package notification

import (
	"github.com/AchmadZackyGZ/fluids/server/internal/modules/notification/internal/delivery/http"
	"github.com/AchmadZackyGZ/fluids/server/internal/modules/notification/internal/repository"
	"github.com/AchmadZackyGZ/fluids/server/internal/modules/notification/internal/service"
	"github.com/AchmadZackyGZ/fluids/server/internal/platform/security"
	"github.com/labstack/echo/v4"
	"go.uber.org/fx"
)

func RegisterNotificationRoutes(e *echo.Echo, handler *http.NotificationHandler) {
	// Kunci seluruh route notifikasi dengan JWT Middleware (Instagram-Style Wajib Login)
	g := e.Group("/api/v1/notifications")
	g.Use(security.JWTMiddleWare)

	g.GET("", handler.GetNotifications)
	g.GET("/unread-count", handler.GetUnreadCount)
	g.PATCH("/read/:id", handler.MarkAsRead)
	g.POST("/read-all", handler.MarkAllAsRead)
}

var Module = fx.Options(
	fx.Provide(repository.NewNotificationRepository),
	fx.Provide(service.NewNotificationService),
	fx.Provide(http.NewNotificationHandler),
	fx.Invoke(RegisterNotificationRoutes),
)
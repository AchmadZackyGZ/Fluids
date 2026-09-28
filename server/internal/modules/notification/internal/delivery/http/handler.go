package http

import (
	"errors"
	"net/http"
	"strconv"

	"github.com/AchmadZackyGZ/fluids/server/internal/modules/notification/contracts"
	"github.com/AchmadZackyGZ/fluids/server/internal/modules/notification/internal/service"
	"github.com/AchmadZackyGZ/fluids/server/internal/platform/logger"
	"github.com/labstack/echo/v4"
)

type NotificationHandler struct {
	svc service.NotificationService
}

func NewNotificationHandler(svc service.NotificationService) *NotificationHandler {
	return &NotificationHandler{svc: svc}
}

// GET /api/v1/notifications
// Mengambil daftar notifikasi dengan filter kategori (?category=follow|like|comment|all) & pagination (?limit, ?offset)
func (h *NotificationHandler) GetNotifications(c echo.Context) error {
	userID, ok := c.Get("user_id").(string)
	if !ok || userID == "" {
		return c.JSON(http.StatusUnauthorized, map[string]string{"error": "unauthorized access"})
	}

	category := c.QueryParam("category")
	limit, _ := strconv.Atoi(c.QueryParam("limit"))
	offset, _ := strconv.Atoi(c.QueryParam("offset"))

	ctx := c.Request().Context()
	logger.InfoCtx(ctx, "get notifications attempt", "user_id", userID, "category", category, "limit", limit, "offset", offset)

	notifications, err := h.svc.GetNotifications(ctx, userID, category, int32(limit), int32(offset))
	if err != nil {
		logger.ErrorCtx(ctx, "get notifications failed", "error", err, "user_id", userID)
		return h.handleNotificationError(c, err)
	}

	logger.InfoCtx(ctx, "get notifications success", "user_id", userID, "count", len(notifications))
	return c.JSON(http.StatusOK, map[string]interface{}{
		"status": "success",
		"data":   notifications,
	})
}

// GET /api/v1/notifications/unread-count
// Mengambil total notifikasi yang belum dibaca untuk badge lonceng di navbar (👤 2)
func (h *NotificationHandler) GetUnreadCount(c echo.Context) error {
	userID, ok := c.Get("user_id").(string)
	if !ok || userID == "" {
		return c.JSON(http.StatusUnauthorized, map[string]string{"error": "unauthorized access"})
	}

	ctx := c.Request().Context()
	logger.InfoCtx(ctx, "get unread count attempt", "user_id", userID)

	unreadCount, err := h.svc.GetUnreadCount(ctx, userID)
	if err != nil {
		logger.ErrorCtx(ctx, "get unread count failed", "error", err, "user_id", userID)
		return h.handleNotificationError(c, err)
	}

	logger.InfoCtx(ctx, "get unread count success", "user_id", userID, "unread_count", unreadCount)
	return c.JSON(http.StatusOK, map[string]interface{}{
		"status": "success",
		"data":   unreadCount,
	})
}

// PATCH /api/v1/notifications/read/:id
// Menandai 1 notifikasi spesifik sebagai sudah dibaca saat di-klik oleh user
func (h *NotificationHandler) MarkAsRead(c echo.Context) error {
	userID, ok := c.Get("user_id").(string)
	if !ok || userID == "" {
		return c.JSON(http.StatusUnauthorized, map[string]string{"error": "unauthorized access"})
	}

	notificationID := c.Param("id")

	ctx := c.Request().Context()
	logger.InfoCtx(ctx, "mark as read attempt", "user_id", userID, "notification_id", notificationID)

	if err := h.svc.MarkAsRead(ctx, userID, notificationID); err != nil {
		logger.ErrorCtx(ctx, "mark as read failed", "error", err, "user_id", userID, "notification_id", notificationID)
		return h.handleNotificationError(c, err)
	}

	logger.InfoCtx(ctx, "mark as read success", "user_id", userID, "notification_id", notificationID)
	return c.JSON(http.StatusOK, map[string]string{
		"status":  "success",
		"message": "notification marked as read",
	})
}

// POST /api/v1/notifications/read-all
// Menandai SEMUA notifikasi milik user menjadi sudah dibaca
func (h *NotificationHandler) MarkAllAsRead(c echo.Context) error {
	userID, ok := c.Get("user_id").(string)
	if !ok || userID == "" {
		return c.JSON(http.StatusUnauthorized, map[string]string{"error": "unauthorized access"})
	}

	ctx := c.Request().Context()
	logger.InfoCtx(ctx, "mark all as read attempt", "user_id", userID)

	if err := h.svc.MarkAllAsRead(ctx, userID); err != nil {
		logger.ErrorCtx(ctx, "mark all as read failed", "error", err, "user_id", userID)
		return h.handleNotificationError(c, err)
	}

	logger.InfoCtx(ctx, "mark all as read success", "user_id", userID)
	return c.JSON(http.StatusOK, map[string]string{
		"status":  "success",
		"message": "all notifications marked as read",
	})
}

// handleNotificationError memetakan sentinel domain error menjadi HTTP status code yang presisi
func (h *NotificationHandler) handleNotificationError(c echo.Context, err error) error {
	switch {
	case errors.Is(err, contracts.ErrNotificationNotFound):
		return c.JSON(http.StatusNotFound, map[string]string{"error": "notification not found"})
	case errors.Is(err, contracts.ErrUnauthorizedAccess):
		return c.JSON(http.StatusForbidden, map[string]string{"error": "forbidden access to notification"})
	default:
		ctx := c.Request().Context()
		logger.ErrorCtx(ctx, "notification error", "error", err)
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "internal server error"})
	}
}
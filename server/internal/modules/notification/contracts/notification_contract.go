package contracts

import (
	"context"
	"time"
)

type NotificationDTO struct {
	ID		             string            `json:"id"`
	ActorUsername        string            `json:"actor_username"`
	ActorAvatarUrl	  	 string            `json:"actor_avatar_url"`
	EntityType		   	 string            `json:"entity_type"`
	EntityID		     string            `json:"entity_id"`
	Caption			 	 string            `json:"caption"`
	ReadStatus		     bool              `json:"read"`
	CreatedAt		     time.Time         `json:"created_at"`
}

type UnreadCountDTO struct {
	UnreadCount int64 `json:"count"`
}

type NotificationContract interface {
	GetNotifications(ctx context.Context, userID string, category string, limit, offset int32) ([]NotificationDTO, error)
	GetUnreadCount(ctx context.Context, userID string) (*UnreadCountDTO, error)
	MarkAsRead(ctx context.Context, userID, notificationID string) error
	MarkAllAsRead(ctx context.Context, userID string) error
}
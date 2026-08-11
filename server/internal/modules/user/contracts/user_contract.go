package contracts

import (
	"context"
	"time"
)

type UserDTO struct {
	ID        string    `json:"id"`
	Username  string    `json:"username"`
	Email     string    `json:"email"`
	FullName  string    `json:"full_name"`
	Bio       string    `json:"bio"`
	AvatarURL string    `json:"avatar_url"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

type UserContract interface {
	GetUserByID(ctx context.Context, id string) (*UserDTO, error)
}
package contracts

import (
	"context"
	"time"
)

type UserDTO struct {
	ID            string    `json:"id"`
	Username      string    `json:"username"`
	Email         string    `json:"email"`
	PasswordHash  string    `json:"-"`
	FullName      string    `json:"full_name"`
	Bio           string    `json:"bio"`
	AvatarURL     string    `json:"avatar_url"`
	EmailVerified bool      `json:"email_verified"`
	CreatedAt     time.Time `json:"created_at"`
	UpdatedAt     time.Time `json:"updated_at"`
}

type CreateUserReq struct {
	Username     string `json:"username"`
	Email        string `json:"email"`
	PasswordHash string `json:"password_hash"`
	FullName     string `json:"full_name"`
}

// UserContract = satu-satunya pintu akses modul lain ke modul user.
//
// 3 method pertama dipakai auth untuk register & login.
// 3 method terakhir DITAMBAHKAN agar auth bisa menyelesaikan alur
// verifikasi email, ganti password, dan hapus akun (soft delete).
type UserContract interface {
	CreateUser(ctx context.Context, req CreateUserReq) (*UserDTO, error)
	GetUserByEmail(ctx context.Context, email string) (*UserDTO, error)
	GetUserByID(ctx context.Context, id string) (*UserDTO, error)

	UpdatePassword(ctx context.Context, userID, passwordHash string) error
	UpdateEmailVerified(ctx context.Context, userID string, verified bool) error
	DeleteAccount(ctx context.Context, userID string) error
}

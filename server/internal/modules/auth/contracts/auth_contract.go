package contracts

import (
	"context"
	"time"
)

// ===== DTOs =====

type AuthResponse struct {
	Token         string    `json:"token"`
	RefreshToken  string    `json:"refresh_token"`
	AccessTokenExpiresAt  time.Time `json:"access_token_expires_at"`
	RefreshTokenExpiresAt time.Time `json:"refresh_token_expires_at"`
	User          *UserDTO  `json:"user"`
}

type UserDTO struct {
	ID           string    `json:"id"`
	Username     string    `json:"username"`
	Email        string    `json:"email"`
	FullName     string    `json:"full_name"`
	Bio          string    `json:"bio"`
	AvatarURL    string    `json:"avatar_url"`
	EmailVerified bool      `json:"email_verified"`
	CreatedAt    time.Time `json:"created_at"`
	UpdatedAt    time.Time `json:"updated_at"`
}

// Request/Response DTOs

type RegisterReq struct {
	Username string `json:"username" validate:"required,alphanum,min=3,max=50"`
	Email    string `json:"email" validate:"required,email"`
	Password string `json:"password" validate:"required,min=8"`
	FullName string `json:"full_name" validate:"required,min=2,max=100"`
}

type LoginReq struct {
	Email    string `json:"email" validate:"required,email"`
	Password string `json:"password" validate:"required"`
}

type RefreshTokenReq struct {
	RefreshToken string `json:"refresh_token" validate:"required"`
}

type ForgotPasswordReq struct {
	Email string `json:"email" validate:"required,email"`
}

type VerifyEmailReq struct {
	Token string `json:"token" validate:"required"`
}

type ResendVerificationReq struct {
	Email string `json:"email" validate:"required,email"`
}

type ResetPasswordReq struct {
	Token       string `json:"token" validate:"required"`
	NewPassword string `json:"new_password" validate:"required,min=8"`
}

type ChangePasswordReq struct {
	CurrentPassword string `json:"current_password" validate:"required"`
	NewPassword     string `json:"new_password" validate:"required,min=8"`
}

type DeleteAccountReq struct {
	Password string `json:"password" validate:"required"`
}

// ===== Contract Interface =====

type AuthContract interface {
	// Register mendaftarkan user baru, mengembalikan AuthResponse (token + user)
	Register(ctx context.Context, req RegisterReq) (*AuthResponse, error)

	// Login autentikasi user, mengembalikan AuthResponse
	Login(ctx context.Context, req LoginReq) (*AuthResponse, error)

	// RefreshToken memperbarui access token menggunakan refresh token
	// Rotasi refresh token: token lama dicabut, token baru diterbitkan
	RefreshToken(ctx context.Context, req RefreshTokenReq) (*AuthResponse, error)

	// RevokeToken mencabut refresh token (logout)
	RevokeToken(ctx context.Context, userID, tokenHash string) error

	// RequestPasswordReset meminta reset password (kirim email dengan token)
	RequestPasswordReset(ctx context.Context, req ForgotPasswordReq) error

	// VerifyEmail memverifikasi email user dengan token
	VerifyEmail(ctx context.Context, req VerifyEmailReq) error

	// ResendVerification mengirim ulang email verifikasi
	ResendVerification(ctx context.Context, req ResendVerificationReq) error

	// ResetPassword mengubah password dengan token reset
	ResetPassword(ctx context.Context, req ResetPasswordReq) error

	// ChangePassword ganti password (butuh password lama)
	ChangePassword(ctx context.Context, userID string, req ChangePasswordReq) error

	// DeleteAccount hapus akun (soft delete)
	DeleteAccount(ctx context.Context, userID string, req DeleteAccountReq) error
}
package service

import (
	"context"
	"errors"

	userContract "github.com/AchmadZackyGZ/fluids/server/internal/modules/user/contracts"
	"github.com/AchmadZackyGZ/fluids/server/internal/platform/security"
	"github.com/AchmadZackyGZ/fluids/server/internal/platform/validator"
)

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

type AuthResponse struct {
	Token string                `json:"token"`
	User  *userContract.UserDTO `json:"user"`
}

// Sentinel Error khusus Auth Service (Login Gagal)
var ErrInvalidCredentials = errors.New("invalid email or password")

type AuthService interface {
	Register(ctx context.Context, req RegisterReq) (*AuthResponse, error)
	Login(ctx context.Context, req LoginReq) (*AuthResponse, error)
}

type authService struct {
	userContract userContract.UserContract
}

func NewAuthService(userContract userContract.UserContract) AuthService {
	return &authService{userContract: userContract}
}

func (s *authService) Register(ctx context.Context, req RegisterReq) (*AuthResponse, error) {
	// if req.Email == "" || req.Password == "" || req.Username == "" || req.FullName == "" {
	// 	return nil, errors.New("all fields are required")
	// }
	// ini kode awalnya tanpa validator handle error

	// Validasi struct input (dikembalikan mentah jika gagal, handler yang akan mengurai)versi menggunakan validator lebih clean code
	if err := validator.Validate.Struct(req); err != nil {
		return nil, err
	}

	hashedPassword, err := security.HashPassword(req.Password)
	if err != nil {
		return nil, err
	}

	u, err := s.userContract.CreateUser(ctx, userContract.CreateUserReq{
		Username:     req.Username,
		Email:        req.Email,
		PasswordHash: hashedPassword,
		FullName:     req.FullName,
	})
	if err != nil {
		// Diteruskan apa adanya (misal ErrEmailAlreadyExists / ErrUsernameAlreadyExists)
		return nil, err
	}

	token, err := security.GenerateToken(u.ID, u.Email, u.Username)
	if err != nil {
		return nil, err
	}

	return &AuthResponse{
		Token: token,
		User:  u,
	}, nil
}

func (s *authService) Login(ctx context.Context, req LoginReq) (*AuthResponse, error) {
	// Validasi struct input
	if err := validator.Validate.Struct(req); err != nil {
		return nil, err
	}

	u, err := s.userContract.GetUserByEmail(ctx, req.Email)
	if err != nil {
		if errors.Is(err, userContract.ErrUserNotFound) {
			// Samarkan error menjadi ErrInvalidCredentials (OWASP Standard)
			return nil, ErrInvalidCredentials
		}
		return nil, err
	}

	if !security.CheckPasswordHash(req.Password, u.PasswordHash) {
		return nil, ErrInvalidCredentials
	}

	token, err := security.GenerateToken(u.ID, u.Email, u.Username)
	if err != nil {
		return nil, err
	}

	return &AuthResponse{
		Token: token,
		User:  u,
	}, nil
}


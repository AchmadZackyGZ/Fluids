package service

import (
	"context"
	"errors"

	userContract "github.com/AchmadZackyGZ/fluids/server/internal/modules/user/contracts"
	"github.com/AchmadZackyGZ/fluids/server/internal/platform/security"
)

type RegisterReq struct {
	Username string `json:"username"`
	Email    string `json:"email"`
	Password string `json:"password"`
	FullName string `json:"full_name"`
}

type LoginReq struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

type AuthResponse struct {
	Token string                `json:"token"`
	User  *userContract.UserDTO `json:"user"`
}

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
	if req.Email == "" || req.Password == "" || req.Username == "" || req.FullName == "" {
		return nil, errors.New("all fields are required")
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
	if req.Email == "" || req.Password == "" {
		return nil, errors.New("email and password are required")
	}

	u, err := s.userContract.GetUserByEmail(ctx, req.Email)
	if err != nil {
		return nil, errors.New("invalid email or password")
	}

	if !security.CheckPasswordHash(req.Password, u.PasswordHash) {
		return nil, errors.New("invalid email or password")
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


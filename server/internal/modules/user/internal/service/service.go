package service

import (
	"context"
	"errors"

	"github.com/AchmadZackyGZ/fluids/server/internal/modules/user/contracts"
	"github.com/AchmadZackyGZ/fluids/server/internal/modules/user/internal/repository"
	"github.com/AchmadZackyGZ/fluids/server/internal/modules/user/internal/repository/gen"
	"github.com/google/uuid"
)

type UserService interface {
	contracts.UserContract
	// GetProfileByID(ctx context.Context, userID string) (*contracts.UserDTO, error)
}

type userService struct {
	repo repository.UserRepository
}

func NewUserService(repo repository.UserRepository) UserService {
	return &userService{repo: repo}
}

func (s *userService) CreateUser(ctx context.Context, req contracts.CreateUserReq) (*contracts.UserDTO, error) {
	u, err := s.repo.CreateUser(ctx, gen.CreateUserParams{
		Username:     req.Username,
		Email:        req.Email,
		PasswordHash: req.PasswordHash,
		FullName:     req.FullName,
	})
	if err != nil {
		return nil, err
	}

	return &contracts.UserDTO{
		ID:        u.ID.String(),
		Username:  u.Username,
		Email:     u.Email,
		FullName:  u.FullName,
		Bio:       u.Bio,
		AvatarURL: u.AvatarUrl,
		CreatedAt: u.CreatedAt.Time,
		UpdatedAt: u.UpdatedAt.Time,
	}, nil
}

func (s *userService) GetUserByEmail(ctx context.Context, email string) (*contracts.UserDTO, error) {
	u, err := s.repo.GetUserByEmail(ctx, email)
	if err != nil {
		return nil, err
	}

	return &contracts.UserDTO{
		ID:           u.ID.String(),
		Username:     u.Username,
		Email:        u.Email,
		PasswordHash: u.PasswordHash,
		FullName:     u.FullName,
		Bio:          u.Bio,
		AvatarURL:    u.AvatarUrl,
		CreatedAt:    u.CreatedAt.Time,
		UpdatedAt:    u.UpdatedAt.Time,
	}, nil
}

func (s *userService) GetUserByID(ctx context.Context, idStr string) (*contracts.UserDTO, error) {
	uid, err := uuid.Parse(idStr)
	if err != nil {
		return nil, errors.New("invalid user id format")
	}

	u, err := s.repo.GetUserByID(ctx, uid)
	if err != nil {
		return nil, err
	}

	return &contracts.UserDTO{
		ID:        u.ID.String(),
		Username:  u.Username,
		Email:     u.Email,
		FullName:  u.FullName,
		Bio:       u.Bio,
		AvatarURL: u.AvatarUrl,
		CreatedAt: u.CreatedAt.Time,
		UpdatedAt: u.UpdatedAt.Time,
	}, nil
}
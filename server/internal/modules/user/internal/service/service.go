package service

import (
	"context"
	"errors"

	"github.com/AchmadZackyGZ/fluids/server/internal/modules/user/contracts"
	"github.com/AchmadZackyGZ/fluids/server/internal/modules/user/internal/repository"
	"github.com/google/uuid"
)

type UserService interface {
	contracts.UserContract
	GetProfileByID(ctx context.Context, userID string) (*contracts.UserDTO, error)
}

type userService struct {
	repo repository.UserRepository
}

func NewUserService(repo repository.UserRepository) UserService {
	return &userService{repo: repo}
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

func (s *userService) GetProfileByID(ctx context.Context, userID string) (*contracts.UserDTO, error) {
	return s.GetUserByID(ctx, userID)
}
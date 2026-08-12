package repository

import (
	"context"

	"github.com/AchmadZackyGZ/fluids/server/internal/modules/user/internal/repository/gen"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgtype"
	"github.com/jackc/pgx/v5/pgxpool"
)

type UserRepository interface {
	CreateUser(ctx context.Context, arg gen.CreateUserParams) (gen.CreateUserRow, error)
	GetUserByEmail(ctx context.Context, email string) (gen.User, error)
	GetUserByID(ctx context.Context, id uuid.UUID) (gen.GetUserByIDRow, error)
	GetUserByUsername(ctx context.Context, username string) (gen.GetUserByUsernameRow, error)
}

type postgresRepository struct {
	q *gen.Queries
}

func NewUserRepository(pool *pgxpool.Pool) UserRepository {
	return &postgresRepository{
		q: gen.New(pool),
	}
}

func (r *postgresRepository) CreateUser(ctx context.Context, arg gen.CreateUserParams) (gen.CreateUserRow, error) {
	return r.q.CreateUser(ctx, arg)
}

func (r *postgresRepository) GetUserByEmail(ctx context.Context, email string) (gen.User, error) {
	return r.q.GetUserByEmail(ctx, email)
}

func (r *postgresRepository) GetUserByID(ctx context.Context, id uuid.UUID) (gen.GetUserByIDRow, error) {
	return r.q.GetUserByID(ctx, pgtype.UUID{Bytes: id, Valid: true})
}

func (r *postgresRepository) GetUserByUsername(ctx context.Context, username string) (gen.GetUserByUsernameRow, error) {
	return r.q.GetUserByUsername(ctx, username)
}
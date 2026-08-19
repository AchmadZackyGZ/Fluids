package repository

import (
	"context"
	"errors"

	"github.com/AchmadZackyGZ/fluids/server/internal/modules/user/contracts"
	"github.com/AchmadZackyGZ/fluids/server/internal/modules/user/internal/repository/gen"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgconn"
	"github.com/jackc/pgx/v5/pgtype"
	"github.com/jackc/pgx/v5/pgxpool"
)

// mapPgError menerjemahkan error mentah dari Postgres menjadi error domain contracts
func mapPgError(err error) error {
	if err == nil {
		return nil
	}
	// 1. Kasus: SELECT query tidak menemukan data sama sekali
	if errors.Is(err, pgx.ErrNoRows) {
		return contracts.ErrUserNotFound
	}
	// 2. Kasus: Unique constraint dilanggar (Error code 23505 di Postgres = unique_violation)
	var pgErr *pgconn.PgError
	if errors.As(err, &pgErr) && pgErr.Code == "23505" {
		switch pgErr.ConstraintName {
		case "users_email_key":
			return contracts.ErrEmailAlreadyExists
		case "users_username_key":
			return contracts.ErrUsernameAlreadyExists
		}
	}
	// Error lainnya (koneksi putus, timeout, dll) diteruskan apa adanya
	return err
}

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
	row, err := r.q.CreateUser(ctx, arg)
	if err != nil {
		return gen.CreateUserRow{}, mapPgError(err)
	}
	return row, nil
}

func (r *postgresRepository) GetUserByEmail(ctx context.Context, email string) (gen.User, error) {
	u, err := r.q.GetUserByEmail(ctx, email)
	if err != nil {
		return gen.User{}, mapPgError(err)
	}
	return u, nil
}

func (r *postgresRepository) GetUserByID(ctx context.Context, id uuid.UUID) (gen.GetUserByIDRow, error) {
	u, err := r.q.GetUserByID(ctx, pgtype.UUID{Bytes: id, Valid: true})
	if err != nil {
		return gen.GetUserByIDRow{}, mapPgError(err)
	}
	return u, nil
}

func (r *postgresRepository) GetUserByUsername(ctx context.Context, username string) (gen.GetUserByUsernameRow, error) {
	u, err := r.q.GetUserByUsername(ctx, username)
	if err != nil {
		return gen.GetUserByUsernameRow{}, mapPgError(err)
	}
	return u, nil
}
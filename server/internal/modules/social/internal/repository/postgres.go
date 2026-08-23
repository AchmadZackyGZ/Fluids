package repository

import (
	"context"
	"errors"

	"github.com/AchmadZackyGZ/fluids/server/internal/modules/social/contracts"
	"github.com/AchmadZackyGZ/fluids/server/internal/modules/social/internal/repository/gen"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgconn"
	"github.com/jackc/pgx/v5/pgtype"
	"github.com/jackc/pgx/v5/pgxpool"
)

// mapPgError menerjemahkan error mentah dari Postgres ke error domain
func mapPgError(err error) error {
	if err == nil {
		return nil
	}
	if errors.Is(err, pgx.ErrNoRows) {
		return contracts.ErrTargetUserNotFound
	}
	var pgErr *pgconn.PgError
	if errors.As(err, &pgErr) {
		switch pgErr.Code {
		case "23503": // foreign_key_violation -> user atau post tidak ada
			return contracts.ErrTargetUserNotFound
		case "23514": // check_violation -> chk_no_self_follow
			return contracts.ErrSelfFollowNotAllowed
		}
	}
	return err
}

type SocialRepository interface {
	FollowUser(ctx context.Context, followerID, followingID uuid.UUID) error
	UnfollowUser(ctx context.Context, followerID, followingID uuid.UUID) error
	IsFollowing(ctx context.Context, followerID, followingID uuid.UUID) (bool, error)
	GetFollowers(ctx context.Context, arg gen.GetFollowersParams) ([]gen.GetFollowersRow, error)
	GetFollowing(ctx context.Context, arg gen.GetFollowingParams) ([]gen.GetFollowingRow, error)
	CountFollowers(ctx context.Context, userID uuid.UUID) (int64, error)
	CountFollowing(ctx context.Context, userID uuid.UUID) (int64, error)
	CreateBookmark(ctx context.Context, userID, postID uuid.UUID) error
	DeleteBookmark(ctx context.Context, userID, postID uuid.UUID) error
	IsBookmarked(ctx context.Context, userID, postID uuid.UUID) (bool, error)
	ListBookmarks(ctx context.Context, arg gen.ListBookmarksParams) ([]gen.ListBookmarksRow, error)
	UpdateGithubUsername(ctx context.Context, id uuid.UUID, githubUsername string) (gen.UpdateGithubUsernameRow, error)
	GetGithubUsername(ctx context.Context, username string) (gen.GetGithubUsernameRow, error)
}

type postgresRepository struct {
	q *gen.Queries
}

func NewSocialRepository(pool *pgxpool.Pool) SocialRepository {
	return &postgresRepository{
		q: gen.New(pool),
	}
}

func (r *postgresRepository) FollowUser(ctx context.Context, followerID, followingID uuid.UUID) error {
	return mapPgError(r.q.FollowUser(ctx, gen.FollowUserParams{
		FollowerID:  pgtype.UUID{Bytes: followerID, Valid: true},
		FollowingID: pgtype.UUID{Bytes: followingID, Valid: true},
	}))
}

func (r *postgresRepository) UnfollowUser(ctx context.Context, followerID, followingID uuid.UUID) error {
	return mapPgError(r.q.UnfollowUser(ctx, gen.UnfollowUserParams{
		FollowerID:  pgtype.UUID{Bytes: followerID, Valid: true},
		FollowingID: pgtype.UUID{Bytes: followingID, Valid: true},
	}))
}

func (r *postgresRepository) IsFollowing(ctx context.Context, followerID, followingID uuid.UUID) (bool, error) {
	b, err := r.q.IsFollowing(ctx, gen.IsFollowingParams{
		FollowerID:  pgtype.UUID{Bytes: followerID, Valid: true},
		FollowingID: pgtype.UUID{Bytes: followingID, Valid: true},
	})
	if err != nil {
		return false, mapPgError(err)
	}
	return b, nil
}

func (r *postgresRepository) GetFollowers(ctx context.Context, arg gen.GetFollowersParams) ([]gen.GetFollowersRow, error) {
	items, err := r.q.GetFollowers(ctx, arg)
	if err != nil {
		return nil, mapPgError(err)
	}
	return items, nil
}

func (r *postgresRepository) GetFollowing(ctx context.Context, arg gen.GetFollowingParams) ([]gen.GetFollowingRow, error) {
	items, err := r.q.GetFollowing(ctx, arg)
	if err != nil {
		return nil, mapPgError(err)
	}
	return items, nil
}

func (r *postgresRepository) CountFollowers(ctx context.Context, userID uuid.UUID) (int64, error) {
	c, err := r.q.CountFollowers(ctx, pgtype.UUID{Bytes: userID, Valid: true})
	if err != nil {
		return 0, mapPgError(err)
	}
	return c, nil
}

func (r *postgresRepository) CountFollowing(ctx context.Context, userID uuid.UUID) (int64, error) {
	c, err := r.q.CountFollowing(ctx, pgtype.UUID{Bytes: userID, Valid: true})
	if err != nil {
		return 0, mapPgError(err)
	}
	return c, nil
}

func (r *postgresRepository) CreateBookmark(ctx context.Context, userID, postID uuid.UUID) error {
	return mapPgError(r.q.CreateBookmark(ctx, gen.CreateBookmarkParams{
		UserID: pgtype.UUID{Bytes: userID, Valid: true},
		PostID: pgtype.UUID{Bytes: postID, Valid: true},
	}))
}

func (r *postgresRepository) DeleteBookmark(ctx context.Context, userID, postID uuid.UUID) error {
	return mapPgError(r.q.DeleteBookmark(ctx, gen.DeleteBookmarkParams{
		UserID: pgtype.UUID{Bytes: userID, Valid: true},
		PostID: pgtype.UUID{Bytes: postID, Valid: true},
	}))
}

func (r *postgresRepository) IsBookmarked(ctx context.Context, userID, postID uuid.UUID) (bool, error) {
	b, err := r.q.IsBookmarked(ctx, gen.IsBookmarkedParams{
		UserID: pgtype.UUID{Bytes: userID, Valid: true},
		PostID: pgtype.UUID{Bytes: postID, Valid: true},
	})
	if err != nil {
		return false, mapPgError(err)
	}
	return b, nil
}

func (r *postgresRepository) ListBookmarks(ctx context.Context, arg gen.ListBookmarksParams) ([]gen.ListBookmarksRow, error) {
	items, err := r.q.ListBookmarks(ctx, arg)
	if err != nil {
		return nil, mapPgError(err)
	}
	return items, nil
}

func (r *postgresRepository) UpdateGithubUsername(ctx context.Context, id uuid.UUID, githubUsername string) (gen.UpdateGithubUsernameRow, error) {
	row, err := r.q.UpdateGithubUsername(ctx, gen.UpdateGithubUsernameParams{
		ID:             pgtype.UUID{Bytes: id, Valid: true},
		GithubUsername: githubUsername,
	})
	if err != nil {
		return gen.UpdateGithubUsernameRow{}, mapPgError(err)
	}
	return row, nil
}

func (r *postgresRepository) GetGithubUsername(ctx context.Context, username string) (gen.GetGithubUsernameRow, error) {
	row, err := r.q.GetGithubUsername(ctx, username)
	if err != nil {
		return gen.GetGithubUsernameRow{}, mapPgError(err)
	}
	return row, nil
}
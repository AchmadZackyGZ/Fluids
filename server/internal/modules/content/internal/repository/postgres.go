package repository

import (
	"context"
	"errors"

	"github.com/AchmadZackyGZ/fluids/server/internal/modules/content/contracts"
	"github.com/AchmadZackyGZ/fluids/server/internal/modules/content/internal/repository/gen"
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
	if errors.Is(err, pgx.ErrNoRows) {
		return contracts.ErrPostNotFound
	}
	var pgErr *pgconn.PgError
	if errors.As(err, &pgErr) {
		switch pgErr.Code {
		case "23503": // foreign_key_violation -> author_id tidak ada di tabel users
			return contracts.ErrAuthorNotFound
		case "23514": // check_violation -> post_type/media_type di luar daftar yang diizinkan
			return contracts.ErrInvalidPostType
		}
	}
	return err
}

type ContentRepository interface {
	CreatePost(ctx context.Context, arg gen.CreatePostParams) (gen.Post, error)
	CreatePostWithAttachments(ctx context.Context, post gen.CreatePostParams, snippet *gen.CreatePostCodeSnippetParams, media []gen.CreatePostMediaParams) (gen.Post, *gen.PostCodeSnippet, []gen.PostMedium, error)
	GetPostByID(ctx context.Context, id uuid.UUID) (gen.Post, error)
	ListCodeSnippetsByPostID(ctx context.Context, postID uuid.UUID) ([]gen.PostCodeSnippet, error)
	ListMediaByPostID(ctx context.Context, postID uuid.UUID) ([]gen.PostMedium, error)
	ListFeed(ctx context.Context, arg gen.ListFeedParams) ([]gen.Post, error)
	UpdatePostCaption(ctx context.Context, id uuid.UUID, caption string) (gen.Post, error)
	DeletePost(ctx context.Context, id uuid.UUID) error
	IncrementLikesCount(ctx context.Context, id uuid.UUID) error
	DecrementLikesCount(ctx context.Context, id uuid.UUID) error
	IncrementCommentsCount(ctx context.Context, id uuid.UUID) error
	IncrementSharesCount(ctx context.Context, id uuid.UUID) error
}

type postgresRepository struct {
	q    *gen.Queries
	pool *pgxpool.Pool
}

func NewContentRepository(pool *pgxpool.Pool) ContentRepository {
	return &postgresRepository{
		q:    gen.New(pool),
		pool: pool,
	}
}

func (r *postgresRepository) CreatePost(ctx context.Context, arg gen.CreatePostParams) (gen.Post, error) {
	p, err := r.q.CreatePost(ctx, arg)
	if err != nil {
		return gen.Post{}, mapPgError(err)
	}
	return p, nil
}

// CreatePostWithAttachments membuat post + (opsional) snippet + (opsional) media
// dalam satu transaksi atomic. Perlu akses pool langsung (bukan cuma q),
// karena gen.Queries bawaan SQLC tidak expose method transaksi selain WithTx.
func (r *postgresRepository) CreatePostWithAttachments(
	ctx context.Context,
	post gen.CreatePostParams,
	snippet *gen.CreatePostCodeSnippetParams,
	media []gen.CreatePostMediaParams,
) (gen.Post, *gen.PostCodeSnippet, []gen.PostMedium, error) {
	tx, err := r.pool.Begin(ctx)
	if err != nil {
		return gen.Post{}, nil, nil, err
	}
	defer tx.Rollback(ctx) // no-op kalau sudah Commit di bawah

	qtx := r.q.WithTx(tx)

	createdPost, err := qtx.CreatePost(ctx, post)
	if err != nil {
		return gen.Post{}, nil, nil, mapPgError(err)
	}

	var createdSnippet *gen.PostCodeSnippet
	if snippet != nil {
		snippet.PostID = createdPost.ID
		s, err := qtx.CreatePostCodeSnippet(ctx, *snippet)
		if err != nil {
			return gen.Post{}, nil, nil, mapPgError(err)
		}
		createdSnippet = &s
	}

	var createdMedia []gen.PostMedium
	for _, m := range media {
		m.PostID = createdPost.ID
		med, err := qtx.CreatePostMedia(ctx, m)
		if err != nil {
			return gen.Post{}, nil, nil, mapPgError(err)
		}
		createdMedia = append(createdMedia, med)
	}

	if err := tx.Commit(ctx); err != nil {
		return gen.Post{}, nil, nil, err
	}
	return createdPost, createdSnippet, createdMedia, nil
}

func (r *postgresRepository) GetPostByID(ctx context.Context, id uuid.UUID) (gen.Post, error) {
	p, err := r.q.GetPostByID(ctx, pgtype.UUID{Bytes: id, Valid: true})
	if err != nil {
		return gen.Post{}, mapPgError(err)
	}
	return p, nil
}

func (r *postgresRepository) ListCodeSnippetsByPostID(ctx context.Context, postID uuid.UUID) ([]gen.PostCodeSnippet, error) {
	items, err := r.q.ListCodeSnippetsByPostID(ctx, pgtype.UUID{Bytes: postID, Valid: true})
	if err != nil {
		return nil, mapPgError(err)
	}
	return items, nil
}

func (r *postgresRepository) ListMediaByPostID(ctx context.Context, postID uuid.UUID) ([]gen.PostMedium, error) {
	items, err := r.q.ListMediaByPostID(ctx, pgtype.UUID{Bytes: postID, Valid: true})
	if err != nil {
		return nil, mapPgError(err)
	}
	return items, nil
}

func (r *postgresRepository) ListFeed(ctx context.Context, arg gen.ListFeedParams) ([]gen.Post, error) {
	items, err := r.q.ListFeed(ctx, arg)
	if err != nil {
		return nil, mapPgError(err)
	}
	return items, nil
}

func (r *postgresRepository) UpdatePostCaption(ctx context.Context, id uuid.UUID, caption string) (gen.Post, error) {
	p, err := r.q.UpdatePostCaption(ctx, gen.UpdatePostCaptionParams{
		ID:      pgtype.UUID{Bytes: id, Valid: true},
		Caption: caption,
	})
	if err != nil {
		return gen.Post{}, mapPgError(err)
	}
	return p, nil
}

func (r *postgresRepository) DeletePost(ctx context.Context, id uuid.UUID) error {
	return mapPgError(r.q.DeletePost(ctx, pgtype.UUID{Bytes: id, Valid: true}))
}

func (r *postgresRepository) IncrementLikesCount(ctx context.Context, id uuid.UUID) error {
	return mapPgError(r.q.IncrementLikesCount(ctx, pgtype.UUID{Bytes: id, Valid: true}))
}

func (r *postgresRepository) DecrementLikesCount(ctx context.Context, id uuid.UUID) error {
	return mapPgError(r.q.DecrementLikesCount(ctx, pgtype.UUID{Bytes: id, Valid: true}))
}

func (r *postgresRepository) IncrementCommentsCount(ctx context.Context, id uuid.UUID) error {
	return mapPgError(r.q.IncrementCommentsCount(ctx, pgtype.UUID{Bytes: id, Valid: true}))
}

func (r *postgresRepository) IncrementSharesCount(ctx context.Context, id uuid.UUID) error {
	return mapPgError(r.q.IncrementSharesCount(ctx, pgtype.UUID{Bytes: id, Valid: true}))
}
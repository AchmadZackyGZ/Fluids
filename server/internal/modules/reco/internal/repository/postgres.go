package repository

import (
	"context"

	"github.com/AchmadZackyGZ/fluids/server/internal/modules/reco/internal/repository/gen"
	"github.com/pgvector/pgvector-go"
)

type RecoRepository interface {
	GetTopRecommendedPosts(ctx context.Context, vector pgvector.Vector, limit int32) ([]gen.GetTopRecommendedPostsRow, error)
	UpsertUserEmbedding(ctx context.Context, arg gen.UpsertUserEmbeddingParams) error
}

type postgresRepository struct {
	q *gen.Queries
}

func NewRecoRepository(q *gen.Queries) RecoRepository {
	return &postgresRepository{q: q}
}

func (r *postgresRepository) GetTopRecommendedPosts(ctx context.Context, vector pgvector.Vector, limit int32) ([]gen.GetTopRecommendedPostsRow, error) {
	return r.q.GetTopRecommendedPosts(ctx, gen.GetTopRecommendedPostsParams{
		Embedding: vector,
		Limit:     limit,
	})
}

func (r *postgresRepository) UpsertUserEmbedding(ctx context.Context, arg gen.UpsertUserEmbeddingParams) error {
	return r.q.UpsertUserEmbedding(ctx, arg)
}
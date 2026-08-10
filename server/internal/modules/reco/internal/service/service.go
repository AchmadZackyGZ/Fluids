package service

import (
	"context"

	"github.com/AchmadZackyGZ/fluids/server/internal/modules/reco/internal/repository"
	"github.com/AchmadZackyGZ/fluids/server/internal/modules/reco/internal/repository/gen"
	"github.com/pgvector/pgvector-go"
)

type RecoService interface {
	GetExploreFeed(ctx context.Context, userVector []float32, limit int32) ([]gen.GetTopRecommendedPostsRow, error)
}

type recoService struct {
	repo repository.RecoRepository
}

func NewRecoService(repo repository.RecoRepository) RecoService {
	return &recoService{repo: repo}
}

func (s *recoService) GetExploreFeed(ctx context.Context, userVector []float32, limit int32) ([]gen.GetTopRecommendedPostsRow, error) {
	// Ubah slice []float32 menjadi format pgvector.Vector
	vector := pgvector.NewVector(userVector)

	// Panggil Repository untuk melakukan Cosine Similarity Search
	return s.repo.GetTopRecommendedPosts(ctx, vector, limit)
}
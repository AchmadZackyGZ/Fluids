package service

import (
	"context"
	"errors"
	"time"

	"github.com/AchmadZackyGZ/fluids/server/internal/modules/content/contracts"
	"github.com/AchmadZackyGZ/fluids/server/internal/modules/content/internal/repository"
	"github.com/AchmadZackyGZ/fluids/server/internal/modules/content/internal/repository/gen"
	"github.com/AchmadZackyGZ/fluids/server/internal/platform/validator"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgtype"
)

type ContentService interface {
	contracts.ContentContract
}

type contentService struct {
	repo repository.ContentRepository
}

func NewContentService(repo repository.ContentRepository) ContentService {
	return &contentService{repo: repo}
}

func toPostDTO(p gen.Post) contracts.PostDTO {
	return contracts.PostDTO{
		ID:            p.ID.String(),
		AuthorID:      p.AuthorID.String(),
		PostType:      p.PostType,
		Caption:       p.Caption,
		LikesCount:    p.LikesCount,
		CommentsCount: p.CommentsCount,
		SharesCount:   p.SharesCount,
		CreatedAt:     p.CreatedAt.Time,
		UpdatedAt:     p.UpdatedAt.Time,
	}
}

func toSnippetDTO(s gen.PostCodeSnippet) contracts.CodeSnippetDTO {
	return contracts.CodeSnippetDTO{
		ID:          s.ID.String(),
		Language:    s.Language,
		FileName:    s.FileName,
		CodeContent: s.CodeContent,
		CreatedAt:   s.CreatedAt.Time,
	}
}

func toMediaDTO(m gen.PostMedium) contracts.MediaDTO {
	return contracts.MediaDTO{
		ID:           m.ID.String(),
		MediaURL:     m.MediaUrl,
		MediaType:    m.MediaType,
		DisplayOrder: m.DisplayOrder,
		CreatedAt:    m.CreatedAt.Time,
	}
}

func (s *contentService) CreatePost(ctx context.Context, req contracts.CreatePostReq) (*contracts.PostDTO, error) {
	// Validasi input struct sebelum proses database
	if err := validator.Validate.Struct(req); err != nil {
		return nil, err
	}
	
	authorID, err := uuid.Parse(req.AuthorID)
	if err != nil {
		return nil, errors.New("invalid author id format")
	}

	postParams := gen.CreatePostParams{
		AuthorID: pgtype.UUID{Bytes: authorID, Valid: true},
		PostType: req.PostType,
		Caption:  req.Caption,
	}

	var snippetParams *gen.CreatePostCodeSnippetParams
	if req.CodeSnippet != nil {
		snippetParams = &gen.CreatePostCodeSnippetParams{
			Language:    req.CodeSnippet.Language,
			FileName:    req.CodeSnippet.FileName,
			CodeContent: req.CodeSnippet.CodeContent,
		}
	}

	mediaParams := make([]gen.CreatePostMediaParams, 0, len(req.Media))
	for _, m := range req.Media {
		mediaParams = append(mediaParams, gen.CreatePostMediaParams{
			MediaUrl:     m.MediaURL,
			MediaType:    m.MediaType,
			DisplayOrder: m.DisplayOrder,
		})
	}

	post, snippet, media, err := s.repo.CreatePostWithAttachments(ctx, postParams, snippetParams, mediaParams)
	if err != nil {
		return nil, err
	}

	dto := toPostDTO(post)
	if snippet != nil {
		sd := toSnippetDTO(*snippet)
		dto.CodeSnippet = &sd
	}
	for _, m := range media {
		dto.Media = append(dto.Media, toMediaDTO(m))
	}
	return &dto, nil
}

func (s *contentService) GetPostByID(ctx context.Context, idStr string) (*contracts.PostDTO, error) {
	id, err := uuid.Parse(idStr)
	if err != nil {
		return nil, errors.New("invalid post id format")
	}

	p, err := s.repo.GetPostByID(ctx, id)
	if err != nil {
		return nil, err
	}
	dto := toPostDTO(p)

	snippets, err := s.repo.ListCodeSnippetsByPostID(ctx, id)
	if err != nil {
		return nil, err
	}
	if len(snippets) > 0 {
		sd := toSnippetDTO(snippets[0])
		dto.CodeSnippet = &sd
	}

	mediaItems, err := s.repo.ListMediaByPostID(ctx, id)
	if err != nil {
		return nil, err
	}
	for _, m := range mediaItems {
		dto.Media = append(dto.Media, toMediaDTO(m))
	}

	return &dto, nil
}

func (s *contentService) ListFeed(ctx context.Context, req contracts.ListFeedReq) ([]contracts.PostDTO, error) {
	limit := req.Limit
	if limit <= 0 {
		limit = 20
	}
	before := req.Before
	if before.IsZero() {
		before = time.Now()
	}
	var postType pgtype.Text
	if req.PostType != "" {
		postType = pgtype.Text{String: req.PostType, Valid: true}
	}
	posts, err := s.repo.ListFeed(ctx, gen.ListFeedParams{
		CreatedAt: pgtype.Timestamptz{Time: before, Valid: true},
		Limit:     limit,
		PostType:  postType,
	})
	if err != nil {
		return nil, err
	}
	dtos := make([]contracts.PostDTO, 0, len(posts))
	for _, p := range posts {
		dto := toPostDTO(p)
		postUUID := uuid.UUID(p.ID.Bytes)
		// 1. Ambil snippet kode jika ada
		snippets, err := s.repo.ListCodeSnippetsByPostID(ctx, postUUID)
		if err == nil && len(snippets) > 0 {
			sd := toSnippetDTO(snippets[0])
			dto.CodeSnippet = &sd
		}
		// 2. Ambil media gambar/video jika ada
		mediaItems, err := s.repo.ListMediaByPostID(ctx, postUUID)
		if err == nil {
			for _, m := range mediaItems {
				dto.Media = append(dto.Media, toMediaDTO(m))
			}
		}
		dtos = append(dtos, dto)
	}
	return dtos, nil
}

func (s *contentService) UpdatePostCaption(ctx context.Context, req contracts.UpdatePostCaptionReq) (*contracts.PostDTO, error) {
	id, err := uuid.Parse(req.PostID)
	if err != nil {
		return nil, errors.New("invalid post id format")
	}

	p, err := s.repo.UpdatePostCaption(ctx, id, req.Caption)
	if err != nil {
		return nil, err
	}
	dto := toPostDTO(p)
	return &dto, nil
}

func (s *contentService) DeletePost(ctx context.Context, idStr string) error {
	id, err := uuid.Parse(idStr)
	if err != nil {
		return errors.New("invalid post id format")
	}
	return s.repo.DeletePost(ctx, id)
}

func (s *contentService) LikePost(ctx context.Context, idStr string) error {
	id, err := uuid.Parse(idStr)
	if err != nil {
		return errors.New("invalid post id format")
	}
	return s.repo.IncrementLikesCount(ctx, id)
}

func (s *contentService) UnlikePost(ctx context.Context, idStr string) error {
	id, err := uuid.Parse(idStr)
	if err != nil {
		return errors.New("invalid post id format")
	}
	return s.repo.DecrementLikesCount(ctx, id)
}

func (s *contentService) CommentOnPost(ctx context.Context, idStr string) error {
	id, err := uuid.Parse(idStr)
	if err != nil {
		return errors.New("invalid post id format")
	}
	return s.repo.IncrementCommentsCount(ctx, id)
}

func (s *contentService) SharePost(ctx context.Context, idStr string) error {
	id, err := uuid.Parse(idStr)
	if err != nil {
		return errors.New("invalid post id format")
	}
	return s.repo.IncrementSharesCount(ctx, id)
}
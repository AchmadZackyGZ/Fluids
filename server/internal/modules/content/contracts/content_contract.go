package contracts

import (
	"context"
	"time"
)

type PostDTO struct {
	ID            string          `json:"id"`
	AuthorID      string          `json:"author_id"`
	PostType      string          `json:"post_type"`
	Caption       string          `json:"caption"`
	LikesCount    int32           `json:"likes_count"`
	CommentsCount int32           `json:"comments_count"`
	SharesCount   int32           `json:"shares_count"`
	CreatedAt     time.Time       `json:"created_at"`
	UpdatedAt     time.Time       `json:"updated_at"`
	CodeSnippet   *CodeSnippetDTO `json:"code_snippet,omitempty"`
	Media         []MediaDTO      `json:"media,omitempty"`
}

type CodeSnippetDTO struct {
	ID          string    `json:"id"`
	Language    string    `json:"language"`
	FileName    string    `json:"file_name"`
	CodeContent string    `json:"code_content"`
	CreatedAt   time.Time `json:"created_at"`
}

type MediaDTO struct {
	ID           string    `json:"id"`
	MediaURL     string    `json:"media_url"`
	MediaType    string    `json:"media_type"`
	DisplayOrder int16     `json:"display_order"`
	CreatedAt    time.Time `json:"created_at"`
}

type CreateSnippetReq struct {
	Language    string `json:"language"`
	FileName    string `json:"file_name"`
	CodeContent string `json:"code_content"`
}

type CreateMediaReq struct {
	MediaURL     string `json:"media_url"`
	MediaType    string `json:"media_type"`
	DisplayOrder int16  `json:"display_order"`
}

type CreatePostReq struct {
	AuthorID    string            `json:"author_id"`
	PostType    string            `json:"post_type" validate:"required,oneof=dev_curhat project_showcase bug_hunting rfc snippets battlestation career"`
	Caption     string            `json:"caption" validate:"required,max=3000"`
	CodeSnippet *CreateSnippetReq `json:"code_snippet,omitempty"`
	Media       []CreateMediaReq  `json:"media,omitempty"`
}

type ListFeedReq struct {
	Before   time.Time `query:"before" json:"before"`
	Limit    int32     `query:"limit" json:"limit"`
	PostType string    `query:"post_type" json:"post_type"`
}

type UpdatePostCaptionReq struct {
	PostID  string `json:"post_id"`
	Caption string `json:"caption"`
}

type ContentContract interface {
	CreatePost(ctx context.Context, req CreatePostReq) (*PostDTO, error)
	GetPostByID(ctx context.Context, id string) (*PostDTO, error)
	ListFeed(ctx context.Context, req ListFeedReq) ([]PostDTO, error)
	UpdatePostCaption(ctx context.Context, req UpdatePostCaptionReq) (*PostDTO, error)
	DeletePost(ctx context.Context, id string) error
	LikePost(ctx context.Context, id string) error
	UnlikePost(ctx context.Context, id string) error
	CommentOnPost(ctx context.Context, id string) error
	SharePost(ctx context.Context, id string) error
}
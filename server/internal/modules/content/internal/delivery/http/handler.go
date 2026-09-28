package http

import (
	"errors"
	"net/http"

	"github.com/AchmadZackyGZ/fluids/server/internal/modules/content/contracts"
	"github.com/AchmadZackyGZ/fluids/server/internal/modules/content/internal/service"
	"github.com/AchmadZackyGZ/fluids/server/internal/platform/logger"
	"github.com/AchmadZackyGZ/fluids/server/internal/platform/validator"
	validatorpkg "github.com/go-playground/validator/v10"
	"github.com/labstack/echo/v4"
)

type ContentHandler struct {
	svc service.ContentService
}

func NewContentHandler(svc service.ContentService) *ContentHandler {
	return &ContentHandler{svc: svc}
}

// POST /api/v1/content/posts
func (h *ContentHandler) CreatePost(c echo.Context) error {
	var req contracts.CreatePostReq
	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "invalid request body"})
	}

	// author_id TIDAK boleh dipercaya dari body request (celah impersonation).
	// Selalu ambil dari JWT claims yang sudah divalidasi JWTMiddleWare.
	req.AuthorID = c.Get("user_id").(string)

	ctx := c.Request().Context()
	logger.InfoCtx(ctx, "create post attempt", "author_id", req.AuthorID)

	post, err := h.svc.CreatePost(ctx, req)
	if err != nil {
		logger.ErrorCtx(ctx, "create post failed", "error", err, "author_id", req.AuthorID)
		return h.handleContentError(c, err)
	}

	logger.InfoCtx(ctx, "create post success", "post_id", post.ID, "author_id", req.AuthorID)
	return c.JSON(http.StatusCreated, map[string]interface{}{
		"status": "success",
		"data":   post,
	})
}

// GET /api/v1/content/feed
func (h *ContentHandler) ListFeed(c echo.Context) error {
	var req contracts.ListFeedReq
	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "invalid query params"})
	}

	ctx := c.Request().Context()
	userID := c.Get("user_id").(string)
	logger.InfoCtx(ctx, "list feed attempt", "user_id", userID, "limit", req.Limit, "before", req.Before, "post_type", req.PostType)

	posts, err := h.svc.ListFeed(ctx, req)
	if err != nil {
		logger.ErrorCtx(ctx, "list feed failed", "error", err, "user_id", userID)
		return h.handleContentError(c, err)
	}

	logger.InfoCtx(ctx, "list feed success", "user_id", userID, "count", len(posts))
	return c.JSON(http.StatusOK, map[string]interface{}{
		"status": "success",
		"data":   posts,
	})
}

// GET /api/v1/content/posts/:id
func (h *ContentHandler) GetPostByID(c echo.Context) error {
	id := c.Param("id")

	ctx := c.Request().Context()
	logger.InfoCtx(ctx, "get post by id attempt", "post_id", id)

	post, err := h.svc.GetPostByID(ctx, id)
	if err != nil {
		logger.ErrorCtx(ctx, "get post by id failed", "error", err, "post_id", id)
		return h.handleContentError(c, err)
	}

	logger.InfoCtx(ctx, "get post by id success", "post_id", id)
	return c.JSON(http.StatusOK, map[string]interface{}{
		"status": "success",
		"data":   post,
	})
}

// PATCH /api/v1/content/posts/:id
func (h *ContentHandler) UpdatePostCaption(c echo.Context) error {
	id := c.Param("id")

	var body struct {
		Caption string `json:"caption"`
	}
	if err := c.Bind(&body); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "invalid request body"})
	}

	ctx := c.Request().Context()
	userID := c.Get("user_id").(string)
	logger.InfoCtx(ctx, "update post caption attempt", "post_id", id, "user_id", userID)

	post, err := h.svc.UpdatePostCaption(ctx, contracts.UpdatePostCaptionReq{
		PostID:  id,
		Caption: body.Caption,
	})
	if err != nil {
		logger.ErrorCtx(ctx, "update post caption failed", "error", err, "post_id", id, "user_id", userID)
		return h.handleContentError(c, err)
	}

	logger.InfoCtx(ctx, "update post caption success", "post_id", id, "user_id", userID)
	return c.JSON(http.StatusOK, map[string]interface{}{
		"status": "success",
		"data":   post,
	})
}

// DELETE /api/v1/content/posts/:id
func (h *ContentHandler) DeletePost(c echo.Context) error {
	id := c.Param("id")
	userID := c.Get("user_id").(string)

	ctx := c.Request().Context()
	logger.InfoCtx(ctx, "delete post attempt", "post_id", id, "user_id", userID)

	// Cek dulu post ini punya siapa, sebelum diizinkan hapus
	post, err := h.svc.GetPostByID(ctx, id)
	if err != nil {
		logger.ErrorCtx(ctx, "delete post failed: get post error", "error", err, "post_id", id)
		return h.handleContentError(c, err)
	}

	if post.AuthorID != userID {
		logger.ErrorCtx(ctx, "delete post failed: unauthorized", "post_id", id, "user_id", userID, "author_id", post.AuthorID)
		return c.JSON(http.StatusForbidden, map[string]string{
			"error": "you are not allowed to delete this post",
		})
	}

	if err := h.svc.DeletePost(ctx, id); err != nil {
		logger.ErrorCtx(ctx, "delete post failed", "error", err, "post_id", id)
		return h.handleContentError(c, err)
	}

	logger.InfoCtx(ctx, "delete post success", "post_id", id, "user_id", userID)
	return c.JSON(http.StatusOK, map[string]string{"status": "success"})
}

// POST /api/v1/content/posts/:id/like
func (h *ContentHandler) LikePost(c echo.Context) error {
	id := c.Param("id")
	userID := c.Get("user_id").(string)

	ctx := c.Request().Context()
	logger.InfoCtx(ctx, "like post attempt", "post_id", id, "user_id", userID)

	if err := h.svc.LikePost(ctx, id); err != nil {
		logger.ErrorCtx(ctx, "like post failed", "error", err, "post_id", id, "user_id", userID)
		return h.handleContentError(c, err)
	}

	logger.InfoCtx(ctx, "like post success", "post_id", id, "user_id", userID)
	return c.JSON(http.StatusOK, map[string]string{"status": "success"})
}

// DELETE /api/v1/content/posts/:id/like
func (h *ContentHandler) UnlikePost(c echo.Context) error {
	id := c.Param("id")
	userID := c.Get("user_id").(string)

	ctx := c.Request().Context()
	logger.InfoCtx(ctx, "unlike post attempt", "post_id", id, "user_id", userID)

	if err := h.svc.UnlikePost(ctx, id); err != nil {
		logger.ErrorCtx(ctx, "unlike post failed", "error", err, "post_id", id, "user_id", userID)
		return h.handleContentError(c, err)
	}

	logger.InfoCtx(ctx, "unlike post success", "post_id", id, "user_id", userID)
	return c.JSON(http.StatusOK, map[string]string{"status": "success"})
}

// POST /api/v1/content/posts/:id/comment
func (h *ContentHandler) CommentOnPost(c echo.Context) error {
	id := c.Param("id")
	userID := c.Get("user_id").(string)

	ctx := c.Request().Context()
	logger.InfoCtx(ctx, "comment on post attempt", "post_id", id, "user_id", userID)

	if err := h.svc.CommentOnPost(ctx, id); err != nil {
		logger.ErrorCtx(ctx, "comment on post failed", "error", err, "post_id", id, "user_id", userID)
		return h.handleContentError(c, err)
	}

	logger.InfoCtx(ctx, "comment on post success", "post_id", id, "user_id", userID)
	return c.JSON(http.StatusOK, map[string]string{"status": "success"})
}

// POST /api/v1/content/posts/:id/share
func (h *ContentHandler) SharePost(c echo.Context) error {
	id := c.Param("id")
	userID := c.Get("user_id").(string)

	ctx := c.Request().Context()
	logger.InfoCtx(ctx, "share post attempt", "post_id", id, "user_id", userID)

	if err := h.svc.SharePost(ctx, id); err != nil {
		logger.ErrorCtx(ctx, "share post failed", "error", err, "post_id", id, "user_id", userID)
		return h.handleContentError(c, err)
	}

	logger.InfoCtx(ctx, "share post success", "post_id", id, "user_id", userID)
	return c.JSON(http.StatusOK, map[string]string{"status": "success"})
}

// handleContentError memetakan sentinel error domain menjadi HTTP status code yang presisi
func (h *ContentHandler) handleContentError(c echo.Context, err error) error {
	// Tangani error validasi input
	var verrs validatorpkg.ValidationErrors
	if errors.As(err, &verrs) {
		return c.JSON(http.StatusUnprocessableEntity, map[string]interface{}{
			"error":  "validation failed",
			"fields": validator.ValidationErrors(err),
		})
	}
	switch {
	case errors.Is(err, contracts.ErrPostNotFound):
		return c.JSON(http.StatusNotFound, map[string]string{"error": "post not found"})
	case errors.Is(err, contracts.ErrAuthorNotFound):
		return c.JSON(http.StatusNotFound, map[string]string{"error": "author not found"})
	case errors.Is(err, contracts.ErrInvalidPostType):
		return c.JSON(http.StatusUnprocessableEntity, map[string]string{"error": "invalid post type"})
	default:
		ctx := c.Request().Context()
		logger.ErrorCtx(ctx, "content error", "error", err)
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "internal server error"})
	}
}
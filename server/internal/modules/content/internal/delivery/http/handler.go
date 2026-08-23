package http

import (
	"errors"
	"net/http"

	"github.com/AchmadZackyGZ/fluids/server/internal/modules/content/contracts"
	"github.com/AchmadZackyGZ/fluids/server/internal/modules/content/internal/service"
	"github.com/labstack/echo/v4"

	"github.com/AchmadZackyGZ/fluids/server/internal/platform/validator"
	validatorpkg "github.com/go-playground/validator/v10"
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

	post, err := h.svc.CreatePost(c.Request().Context(), req)
	if err != nil {
		return handleContentError(c, err)
	}

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

	posts, err := h.svc.ListFeed(c.Request().Context(), req)
	if err != nil {
		return handleContentError(c, err)
	}

	return c.JSON(http.StatusOK, map[string]interface{}{
		"status": "success",
		"data":   posts,
	})
}

// GET /api/v1/content/posts/:id
func (h *ContentHandler) GetPostByID(c echo.Context) error {
	id := c.Param("id")

	post, err := h.svc.GetPostByID(c.Request().Context(), id)
	if err != nil {
		return handleContentError(c, err)
	}

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

	post, err := h.svc.UpdatePostCaption(c.Request().Context(), contracts.UpdatePostCaptionReq{
		PostID:  id,
		Caption: body.Caption,
	})
	if err != nil {
		return handleContentError(c, err)
	}

	return c.JSON(http.StatusOK, map[string]interface{}{
		"status": "success",
		"data":   post,
	})
}

// DELETE /api/v1/content/posts/:id
func (h *ContentHandler) DeletePost(c echo.Context) error {
	id := c.Param("id")
	userID := c.Get("user_id").(string)

	// Cek dulu post ini punya siapa, sebelum diizinkan hapus
	post, err := h.svc.GetPostByID(c.Request().Context(), id)
	if err != nil {
		return handleContentError(c, err)
	}

	if post.AuthorID != userID {
		return c.JSON(http.StatusForbidden, map[string]string{
			"error": "you are not allowed to delete this post",
		})
	}

	if err := h.svc.DeletePost(c.Request().Context(), id); err != nil {
		return handleContentError(c, err)
	}

	return c.JSON(http.StatusOK, map[string]string{"status": "success"})
}

// POST /api/v1/content/posts/:id/like
func (h *ContentHandler) LikePost(c echo.Context) error {
	id := c.Param("id")
	if err := h.svc.LikePost(c.Request().Context(), id); err != nil {
		return handleContentError(c, err)
	}
	return c.JSON(http.StatusOK, map[string]string{"status": "success"})
}

// DELETE /api/v1/content/posts/:id/like
func (h *ContentHandler) UnlikePost(c echo.Context) error {
	id := c.Param("id")
	if err := h.svc.UnlikePost(c.Request().Context(), id); err != nil {
		return handleContentError(c, err)
	}
	return c.JSON(http.StatusOK, map[string]string{"status": "success"})
}

// POST /api/v1/content/posts/:id/comment
func (h *ContentHandler) CommentOnPost(c echo.Context) error {
	id := c.Param("id")
	if err := h.svc.CommentOnPost(c.Request().Context(), id); err != nil {
		return handleContentError(c, err)
	}
	return c.JSON(http.StatusOK, map[string]string{"status": "success"})
}

// POST /api/v1/content/posts/:id/share
func (h *ContentHandler) SharePost(c echo.Context) error {
	id := c.Param("id")
	if err := h.svc.SharePost(c.Request().Context(), id); err != nil {
		return handleContentError(c, err)
	}
	return c.JSON(http.StatusOK, map[string]string{"status": "success"})
}

// handleContentError memetakan sentinel error domain menjadi HTTP status code yang presisi
func handleContentError(c echo.Context, err error) error {
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
		c.Logger().Error(err)
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "internal server error"})
	}
}
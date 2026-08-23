package http

import (
	"errors"
	"net/http"
	"strconv"

	"github.com/AchmadZackyGZ/fluids/server/internal/modules/social/contracts"
	"github.com/AchmadZackyGZ/fluids/server/internal/modules/social/internal/service"
	"github.com/labstack/echo/v4"
)

type SocialHandler struct {
	svc service.SocialService
}

func NewSocialHandler(svc service.SocialService) *SocialHandler {
	return &SocialHandler{svc: svc}
}

// POST /api/v1/social/follow/:id
func (h *SocialHandler) FollowUser(c echo.Context) error {
	currentUserID, ok := c.Get("user_id").(string)
	if !ok || currentUserID == "" {
		return c.JSON(http.StatusUnauthorized, map[string]string{"error": "unauthorized access"})
	}
	targetUserID := c.Param("id")

	if err := h.svc.FollowUser(c.Request().Context(), currentUserID, targetUserID); err != nil {
		return handleSocialError(c, err)
	}

	return c.JSON(http.StatusOK, map[string]string{
		"status":  "success",
		"message": "user followed successfully",
	})
}

// DELETE /api/v1/social/follow/:id
func (h *SocialHandler) UnfollowUser(c echo.Context) error {
	currentUserID, ok := c.Get("user_id").(string)
	if !ok || currentUserID == "" {
		return c.JSON(http.StatusUnauthorized, map[string]string{"error": "unauthorized access"})
	}
	targetUserID := c.Param("id")

	if err := h.svc.UnfollowUser(c.Request().Context(), currentUserID, targetUserID); err != nil {
		return handleSocialError(c, err)
	}

	return c.JSON(http.StatusOK, map[string]string{
		"status":  "success",
		"message": "user unfollowed successfully",
	})
}

// GET /api/v1/social/is-following/:id
func (h *SocialHandler) IsFollowing(c echo.Context) error {
	userID, ok := c.Get("user_id").(string)

	if !ok || userID == "" {
    	return c.JSON(http.StatusUnauthorized, map[string]string{"error": "unauthorized access"})
	}
	targetUserID := c.Param("id")

	isFollowing, err := h.svc.IsFollowing(c.Request().Context(), userID, targetUserID)
	if err != nil {
		return handleSocialError(c, err)
	}

	return c.JSON(http.StatusOK, map[string]interface{}{
		"status":       "success",
		"is_following": isFollowing,
	})
}

// GET /api/v1/social/users/:id/followers
func (h *SocialHandler) GetFollowers(c echo.Context) error {
	userID := c.Param("id")
	limit, _ := strconv.Atoi(c.QueryParam("limit"))
	offset, _ := strconv.Atoi(c.QueryParam("offset"))

	followers, err := h.svc.GetFollowers(c.Request().Context(), userID, int32(limit), int32(offset))
	if err != nil {
		return handleSocialError(c, err)
	}

	return c.JSON(http.StatusOK, map[string]interface{}{
		"status": "success",
		"data":   followers,
	})
}

// GET /api/v1/social/users/:id/following
func (h *SocialHandler) GetFollowing(c echo.Context) error {
	userID := c.Param("id")
	limit, _ := strconv.Atoi(c.QueryParam("limit"))
	offset, _ := strconv.Atoi(c.QueryParam("offset"))

	following, err := h.svc.GetFollowing(c.Request().Context(), userID, int32(limit), int32(offset))
	if err != nil {
		return handleSocialError(c, err)
	}

	return c.JSON(http.StatusOK, map[string]interface{}{
		"status": "success",
		"data":   following,
	})
}

// GET /api/v1/social/users/:id/stats
func (h *SocialHandler) GetSocialStats(c echo.Context) error {
	userID := c.Param("id")

	stats, err := h.svc.GetSocialStats(c.Request().Context(), userID)
	if err != nil {
		return handleSocialError(c, err)
	}

	return c.JSON(http.StatusOK, map[string]interface{}{
		"status": "success",
		"data":   stats,
	})
}

// POST /api/v1/social/bookmarks/:post_id
func (h *SocialHandler) BookmarkPost(c echo.Context) error {
	userID, ok := c.Get("user_id").(string)
	if !ok || userID == "" {
		return c.JSON(http.StatusUnauthorized, map[string]string{"error": "unauthorized access"})
	}
	postID := c.Param("post_id")

	if err := h.svc.BookmarkPost(c.Request().Context(), userID, postID); err != nil {
		return handleSocialError(c, err)
	}

	return c.JSON(http.StatusOK, map[string]string{
		"status":  "success",
		"message": "post bookmarked",
	})
}

// DELETE /api/v1/social/bookmarks/:post_id
func (h *SocialHandler) UnbookmarkPost(c echo.Context) error {
	userID, ok := c.Get("user_id").(string)
	if !ok || userID == "" {
		return c.JSON(http.StatusUnauthorized, map[string]string{"error": "unauthorized access"})
	}
	postID := c.Param("post_id")

	if err := h.svc.UnbookmarkPost(c.Request().Context(), userID, postID); err != nil {
		return handleSocialError(c, err)
	}

	return c.JSON(http.StatusOK, map[string]string{
		"status":  "success",
		"message": "post unbookmarked",
	})
}

// GET /api/v1/social/bookmarks
func (h *SocialHandler) ListBookmarks(c echo.Context) error {
	userID, ok := c.Get("user_id").(string)
	if !ok || userID == "" {
		return c.JSON(http.StatusUnauthorized, map[string]string{"error": "unauthorized access"})
	}
	limit, _ := strconv.Atoi(c.QueryParam("limit"))
	offset, _ := strconv.Atoi(c.QueryParam("offset"))

	bookmarks, err := h.svc.ListBookmarks(c.Request().Context(), userID, int32(limit), int32(offset))
	if err != nil {
		return handleSocialError(c, err)
	}

	return c.JSON(http.StatusOK, map[string]interface{}{
		"status": "success",
		"data":   bookmarks,
	})
}

// POST /api/v1/social/github/link
func (h *SocialHandler) LinkGithub(c echo.Context) error {
	userID, ok := c.Get("user_id").(string)
	if !ok || userID == "" {
		return c.JSON(http.StatusUnauthorized, map[string]string{"error": "unauthorized access"})
	}

	var body struct {
		GithubUsername string `json:"github_username"`
	}
	if err := c.Bind(&body); err != nil || body.GithubUsername == "" {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "github_username is required"})
	}

	if err := h.svc.LinkGithub(c.Request().Context(), userID, body.GithubUsername); err != nil {
		return handleSocialError(c, err)
	}

	return c.JSON(http.StatusOK, map[string]string{
		"status":  "success",
		"message": "github account linked successfully",
	})
}

// GET /api/v1/social/github/:username/activity (Live / Cached Heatmap 365 Days)
func (h *SocialHandler) GetGithubActivity(c echo.Context) error {
	username := c.Param("username")

	activity, err := h.svc.GetGithubActivity(c.Request().Context(), username)
	if err != nil {
		return handleSocialError(c, err)
	}

	return c.JSON(http.StatusOK, map[string]interface{}{
		"status": "success",
		"data":   activity,
	})
}

// handleSocialError memetakan sentinel error domain menjadi HTTP Status Code yang presisi
func handleSocialError(c echo.Context, err error) error {
	switch {
	case errors.Is(err, contracts.ErrTargetUserNotFound):
		return c.JSON(http.StatusNotFound, map[string]string{"error": "user not found"})
	case errors.Is(err, contracts.ErrSelfFollowNotAllowed):
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "cannot follow yourself"})
	case errors.Is(err, contracts.ErrPostNotFound):
		return c.JSON(http.StatusNotFound, map[string]string{"error": "post not found"})
	case errors.Is(err, contracts.ErrGithubUserNotFound):
		return c.JSON(http.StatusNotFound, map[string]string{"error": "github user not found"})
	default:
		c.Logger().Error(err)
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "internal server error"})
	}
}
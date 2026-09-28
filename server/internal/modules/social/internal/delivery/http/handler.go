package http

import (
	"errors"
	"net/http"
	"strconv"

	"github.com/AchmadZackyGZ/fluids/server/internal/modules/social/contracts"
	"github.com/AchmadZackyGZ/fluids/server/internal/modules/social/internal/service"
	"github.com/AchmadZackyGZ/fluids/server/internal/platform/logger"
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

	ctx := c.Request().Context()
	logger.InfoCtx(ctx, "follow user attempt", "current_user_id", currentUserID, "target_user_id", targetUserID)

	if err := h.svc.FollowUser(ctx, currentUserID, targetUserID); err != nil {
		logger.ErrorCtx(ctx, "follow user failed", "error", err, "current_user_id", currentUserID, "target_user_id", targetUserID)
		return h.handleSocialError(c, err)
	}

	logger.InfoCtx(ctx, "follow user success", "current_user_id", currentUserID, "target_user_id", targetUserID)
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

	ctx := c.Request().Context()
	logger.InfoCtx(ctx, "unfollow user attempt", "current_user_id", currentUserID, "target_user_id", targetUserID)

	if err := h.svc.UnfollowUser(ctx, currentUserID, targetUserID); err != nil {
		logger.ErrorCtx(ctx, "unfollow user failed", "error", err, "current_user_id", currentUserID, "target_user_id", targetUserID)
		return h.handleSocialError(c, err)
	}

	logger.InfoCtx(ctx, "unfollow user success", "current_user_id", currentUserID, "target_user_id", targetUserID)
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

	ctx := c.Request().Context()
	logger.InfoCtx(ctx, "is following attempt", "user_id", userID, "target_user_id", targetUserID)

	isFollowing, err := h.svc.IsFollowing(ctx, userID, targetUserID)
	if err != nil {
		logger.ErrorCtx(ctx, "is following failed", "error", err, "user_id", userID, "target_user_id", targetUserID)
		return h.handleSocialError(c, err)
	}

	logger.InfoCtx(ctx, "is following success", "user_id", userID, "target_user_id", targetUserID, "is_following", isFollowing)
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

	ctx := c.Request().Context()
	logger.InfoCtx(ctx, "get followers attempt", "user_id", userID, "limit", limit, "offset", offset)

	followers, err := h.svc.GetFollowers(ctx, userID, int32(limit), int32(offset))
	if err != nil {
		logger.ErrorCtx(ctx, "get followers failed", "error", err, "user_id", userID)
		return h.handleSocialError(c, err)
	}

	logger.InfoCtx(ctx, "get followers success", "user_id", userID, "count", len(followers))
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

	ctx := c.Request().Context()
	logger.InfoCtx(ctx, "get following attempt", "user_id", userID, "limit", limit, "offset", offset)

	following, err := h.svc.GetFollowing(ctx, userID, int32(limit), int32(offset))
	if err != nil {
		logger.ErrorCtx(ctx, "get following failed", "error", err, "user_id", userID)
		return h.handleSocialError(c, err)
	}

	logger.InfoCtx(ctx, "get following success", "user_id", userID, "count", len(following))
	return c.JSON(http.StatusOK, map[string]interface{}{
		"status": "success",
		"data":   following,
	})
}

// GET /api/v1/social/users/:id/stats
func (h *SocialHandler) GetSocialStats(c echo.Context) error {
	userID := c.Param("id")

	ctx := c.Request().Context()
	logger.InfoCtx(ctx, "get social stats attempt", "user_id", userID)

	stats, err := h.svc.GetSocialStats(ctx, userID)
	if err != nil {
		logger.ErrorCtx(ctx, "get social stats failed", "error", err, "user_id", userID)
		return h.handleSocialError(c, err)
	}

	logger.InfoCtx(ctx, "get social stats success", "user_id", userID)
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

	ctx := c.Request().Context()
	logger.InfoCtx(ctx, "bookmark post attempt", "user_id", userID, "post_id", postID)

	if err := h.svc.BookmarkPost(ctx, userID, postID); err != nil {
		logger.ErrorCtx(ctx, "bookmark post failed", "error", err, "user_id", userID, "post_id", postID)
		return h.handleSocialError(c, err)
	}

	logger.InfoCtx(ctx, "bookmark post success", "user_id", userID, "post_id", postID)
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

	ctx := c.Request().Context()
	logger.InfoCtx(ctx, "unbookmark post attempt", "user_id", userID, "post_id", postID)

	if err := h.svc.UnbookmarkPost(ctx, userID, postID); err != nil {
		logger.ErrorCtx(ctx, "unbookmark post failed", "error", err, "user_id", userID, "post_id", postID)
		return h.handleSocialError(c, err)
	}

	logger.InfoCtx(ctx, "unbookmark post success", "user_id", userID, "post_id", postID)
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

	ctx := c.Request().Context()
	logger.InfoCtx(ctx, "list bookmarks attempt", "user_id", userID, "limit", limit, "offset", offset)

	bookmarks, err := h.svc.ListBookmarks(ctx, userID, int32(limit), int32(offset))
	if err != nil {
		logger.ErrorCtx(ctx, "list bookmarks failed", "error", err, "user_id", userID)
		return h.handleSocialError(c, err)
	}

	logger.InfoCtx(ctx, "list bookmarks success", "user_id", userID, "count", len(bookmarks))
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

	ctx := c.Request().Context()
	logger.InfoCtx(ctx, "link github attempt", "user_id", userID, "github_username", body.GithubUsername)

	if err := h.svc.LinkGithub(ctx, userID, body.GithubUsername); err != nil {
		logger.ErrorCtx(ctx, "link github failed", "error", err, "user_id", userID, "github_username", body.GithubUsername)
		return h.handleSocialError(c, err)
	}

	logger.InfoCtx(ctx, "link github success", "user_id", userID, "github_username", body.GithubUsername)
	return c.JSON(http.StatusOK, map[string]string{
		"status":  "success",
		"message": "github account linked successfully",
	})
}

// GET /api/v1/social/github/:username/activity (Live / Cached Heatmap 365 Days)
func (h *SocialHandler) GetGithubActivity(c echo.Context) error {
	username := c.Param("username")

	ctx := c.Request().Context()
	logger.InfoCtx(ctx, "get github activity attempt", "username", username)

	activity, err := h.svc.GetGithubActivity(ctx, username)
	if err != nil {
		logger.ErrorCtx(ctx, "get github activity failed", "error", err, "username", username)
		return h.handleSocialError(c, err)
	}

	logger.InfoCtx(ctx, "get github activity success", "username", username)
	return c.JSON(http.StatusOK, map[string]interface{}{
		"status": "success",
		"data":   activity,
	})
}

// handleSocialError memetakan sentinel error domain menjadi HTTP Status Code yang presisi
func (h *SocialHandler) handleSocialError(c echo.Context, err error) error {
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
		ctx := c.Request().Context()
		logger.ErrorCtx(ctx, "social error", "error", err)
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "internal server error"})
	}
}
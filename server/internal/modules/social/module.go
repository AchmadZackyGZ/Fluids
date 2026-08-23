package social

import (
	"github.com/AchmadZackyGZ/fluids/server/internal/modules/social/internal/delivery/http"
	"github.com/AchmadZackyGZ/fluids/server/internal/modules/social/internal/repository"
	"github.com/AchmadZackyGZ/fluids/server/internal/modules/social/internal/service"
	"github.com/AchmadZackyGZ/fluids/server/internal/platform/redisx"
	"github.com/AchmadZackyGZ/fluids/server/internal/platform/security"
	"github.com/labstack/echo/v4"
	"go.uber.org/fx"
)

func RegisterSocialRoutes(e *echo.Echo, handler *http.SocialHandler) {
	// Buat group route /api/v1/social dan KUNCI SEMUA dengan JWT Middleware
	g := e.Group("/api/v1/social")
	g.Use(security.JWTMiddleWare) // 👈 SEMUA WAJIB LOGIN (Token JWT 24h)

	// 1. Social Graph & Follow System
	g.POST("/follow/:id", handler.FollowUser)
	g.DELETE("/follow/:id", handler.UnfollowUser)
	g.GET("/is-following/:id", handler.IsFollowing)
	g.GET("/users/:id/followers", handler.GetFollowers)
	g.GET("/users/:id/following", handler.GetFollowing)
	g.GET("/users/:id/stats", handler.GetSocialStats)

	// 2. Bookmarks / Saved Posts
	g.POST("/bookmarks/:post_id", handler.BookmarkPost)
	g.DELETE("/bookmarks/:post_id", handler.UnbookmarkPost)
	g.GET("/bookmarks", handler.ListBookmarks)

	// 3. GitHub Profile & Live Heatmap Sync
	g.POST("/github/link", handler.LinkGithub)
	g.GET("/github/:username/activity", handler.GetGithubActivity)
}

var Module = fx.Options(
	fx.Provide(redisx.NewRedisClient),
	fx.Provide(repository.NewSocialRepository),
	fx.Provide(service.NewSocialService),
	fx.Provide(http.NewSocialHandler),
	fx.Invoke(RegisterSocialRoutes),
)
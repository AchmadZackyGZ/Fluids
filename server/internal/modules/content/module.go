package content

import (
	"github.com/AchmadZackyGZ/fluids/server/internal/modules/content/internal/delivery/http"
	"github.com/AchmadZackyGZ/fluids/server/internal/modules/content/internal/repository"
	"github.com/AchmadZackyGZ/fluids/server/internal/modules/content/internal/service"
	"github.com/AchmadZackyGZ/fluids/server/internal/platform/security"
	"github.com/labstack/echo/v4"
	"go.uber.org/fx"
)

func RegisterContentRoutes(e *echo.Echo, handler *http.ContentHandler) {
	g := e.Group("/api/v1/content")
	g.Use(security.JWTMiddleWare)

	g.GET("/feed", handler.ListFeed)
	g.POST("/posts", handler.CreatePost)
	g.GET("/posts/:id", handler.GetPostByID)
	g.PATCH("/posts/:id", handler.UpdatePostCaption)
	g.DELETE("/posts/:id", handler.DeletePost)
	g.POST("/posts/:id/like", handler.LikePost)
	g.DELETE("/posts/:id/like", handler.UnlikePost)
	g.POST("/posts/:id/comment", handler.CommentOnPost)
	g.POST("/posts/:id/share", handler.SharePost)
}

var Module = fx.Options(
	fx.Provide(repository.NewContentRepository),
	fx.Provide(service.NewContentService),
	fx.Provide(http.NewContentHandler),
	fx.Invoke(RegisterContentRoutes),
)
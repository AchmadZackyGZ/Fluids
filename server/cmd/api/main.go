package main

import (
	"context"
	"net/http"

	"github.com/labstack/echo/v4"
	"go.uber.org/fx"

	"github.com/AchmadZackyGZ/fluids/server/internal/modules/auth"
	"github.com/AchmadZackyGZ/fluids/server/internal/modules/content"
	"github.com/AchmadZackyGZ/fluids/server/internal/modules/reco"
	"github.com/AchmadZackyGZ/fluids/server/internal/modules/social"
	"github.com/AchmadZackyGZ/fluids/server/internal/modules/user"
	"github.com/AchmadZackyGZ/fluids/server/internal/platform/database"
)

// NewEchoServer membuat instance Echo HTTP Server dan mendaftarkan route global
func NewEchoServer() *echo.Echo {
	e := echo.New()

	// Endpoint Health Check Global
	e.GET("/health", func(c echo.Context) error {
		return c.JSON(http.StatusOK, map[string]string{
			"status": "UP",
			"app":    "Fluids Backend API Server",
		})
	})

	return e
}

func main() {
	app := fx.New(
		// 1. Provide Connection Pool Database PostgreSQL (*pgxpool.Pool)
		fx.Provide(database.NewPostgresPool),

		// 2. Provide Echo HTTP Server Instance
		fx.Provide(NewEchoServer),

		// 3. Register Modul-Modul Aplikasi
		reco.Module,
		user.Module,
		auth.Module,
		content.Module,
		social.Module,

		// 4. Lifecycle Hook: Menyalakan & Mematikan Server secara Graceful
		fx.Invoke(func(lc fx.Lifecycle, e *echo.Echo) {
			lc.Append(fx.Hook{
				OnStart: func(ctx context.Context) error {
					go func() {
						if err := e.Start(":8080"); err != nil && err != http.ErrServerClosed {
							e.Logger.Fatal("shutting down the server")
						}
					}()
					return nil
				},
				OnStop: func(ctx context.Context) error {
					return e.Shutdown(ctx)
				},
			})
		}),
	)

	app.Run()
}
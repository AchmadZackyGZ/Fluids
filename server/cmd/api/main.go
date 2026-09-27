package main

import (
	"context"
	"log/slog"
	"net/http"
	"os"

	"github.com/joho/godotenv"
	"github.com/labstack/echo/v4"
	"go.uber.org/fx"

	"github.com/AchmadZackyGZ/fluids/server/internal/modules/auth"
	"github.com/AchmadZackyGZ/fluids/server/internal/modules/content"
	"github.com/AchmadZackyGZ/fluids/server/internal/modules/notification"
	"github.com/AchmadZackyGZ/fluids/server/internal/modules/reco"
	"github.com/AchmadZackyGZ/fluids/server/internal/modules/social"
	"github.com/AchmadZackyGZ/fluids/server/internal/modules/user"
	"github.com/AchmadZackyGZ/fluids/server/internal/platform/database"
	"github.com/AchmadZackyGZ/fluids/server/internal/platform/logger"
)

// NewEchoServer membuat instance Echo HTTP Server dan mendaftarkan route global
func NewEchoServer() *echo.Echo {
	e := echo.New()

	e.Use(logger.RequestIDMiddleware())
	e.Use(logger.LoggingMiddleware())

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
	_ = godotenv.Load()

	logLevel := parseLogLevel(os.Getenv("LOG_LEVEL"))
	logger.Init(logLevel, os.Stdout)

	logger.Info("starting Fluids API server",
		"version", "1.0.0",
		"environment", getEnv("APP_ENV", "development"),
	)

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
		notification.Module,
		social.Module,

		// 4. Lifecycle Hook: Menyalakan & Mematikan Server secara Graceful
		fx.Invoke(func(lc fx.Lifecycle, e *echo.Echo) {
			lc.Append(fx.Hook{
				OnStart: func(ctx context.Context) error {
					go func() {
						if err := e.Start(":8080"); err != nil && err != http.ErrServerClosed {
							logger.ErrorCtx(ctx, "server shutdown", "error", err)
							os.Exit(1)
						}
					}()
					logger.Info("HTTP server started", "port", 8080)
					return nil
				},
				OnStop: func(ctx context.Context) error {
					logger.Info("shutting down HTTP server")
					return e.Shutdown(ctx)
				},
			})
		}),
	)

	app.Run()
}

func parseLogLevel(level string) slog.Level {
	switch level {
	case "debug":
		return slog.LevelDebug
	case "warn":
		return slog.LevelWarn
	case "error":
		return slog.LevelError
	default:
		return slog.LevelInfo
	}
}

func getEnv(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return fallback
}
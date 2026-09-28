package logger

import (
	"time"

	"github.com/labstack/echo/v4"
)

func RequestIDMiddleware() echo.MiddlewareFunc {
	return func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c echo.Context) error {
			ctx := c.Request().Context()

			requestID := c.Request().Header.Get("X-Request-ID")
			if requestID == "" {
				requestID = NewRequestID()
			}
			ctx = WithRequestID(ctx, requestID)
			c.Response().Header().Set("X-Request-ID", requestID)

			traceID := c.Request().Header.Get("X-Trace-ID")
			if traceID == "" {
				traceID = NewRequestID()
			}
			ctx = WithTraceID(ctx, traceID)
			c.Response().Header().Set("X-Trace-ID", traceID)

			c.SetRequest(c.Request().WithContext(ctx))

			return next(c)
		}
	}
}

func UserIDMiddleware() echo.MiddlewareFunc {
	return func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c echo.Context) error {
			ctx := c.Request().Context()

			if userID := c.Get("user_id"); userID != nil {
				if uid, ok := userID.(string); ok && uid != "" {
					ctx = WithUserID(ctx, uid)
					c.SetRequest(c.Request().WithContext(ctx))
				}
			}

			return next(c)
		}
	}
}

func LoggingMiddleware() echo.MiddlewareFunc {
	return func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c echo.Context) error {
			ctx := c.Request().Context()
			start := timeNow()

			err := next(c)

			latency := timeSince(start)
			req := c.Request()
			res := c.Response()

			logger := WithContext(ctx)
			logger.Info("HTTP request",
				"method", req.Method,
				"path", req.URL.Path,
				"status", res.Status,
				"latency_ms", latency.Milliseconds(),
				"ip", c.RealIP(),
				"user_agent", req.UserAgent(),
			)

			return err
		}
	}
}

func timeNow() time.Time {
	return time.Now()
}

func timeSince(start time.Time) time.Duration {
	return time.Since(start)
}
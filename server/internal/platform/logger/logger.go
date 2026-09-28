package logger

import (
	"context"
	"io"
	"log/slog"
	"os"
	"strings"
	"time"

	"github.com/google/uuid"
)

var (
	defaultLogger *slog.Logger
)

// SensitiveFields - daftar field yang WAJIB disensor (deny-list)
// Key = lowercase field name
var SensitiveFields = map[string]bool{
	"password":        true,
	"password_hash":   true,
	"token":           true,
	"access_token":    true,
	"refresh_token":   true,
	"authorization":   true,
	"secret":          true,
	"api_key":         true,
	"apikey":          true,
	"otp":             true,
	"pin":             true,
	"credit_card":     true,
	"card_number":     true,
	"cvv":             true,
	"ssn":             true,
}

// SanitizeArgs - filter sensitive fields dari args sebelum log
// Usage: logger.InfoCtx(ctx, "msg", logger.SanitizeArgs("email", req.Email, "password", req.Password)...)
func SanitizeArgs(args ...any) []any {
	if len(args)%2 != 0 {
		return args // invalid key-value pairs, return as-is
	}
	out := make([]any, 0, len(args))
	for i := 0; i < len(args); i += 2 {
		key, ok := args[i].(string)
		if ok && SensitiveFields[strings.ToLower(key)] {
			out = append(out, key, "[REDACTED]")
		} else {
			out = append(out, args[i], args[i+1])
		}
	}
	return out
}

const (
	LevelDebug = slog.LevelDebug
	LevelInfo  = slog.LevelInfo
	LevelWarn  = slog.LevelWarn
	LevelError = slog.LevelError
)

func Init(level slog.Level, output io.Writer) {
	if output == nil {
		output = os.Stdout
	}

	handler := slog.NewJSONHandler(output, &slog.HandlerOptions{
		Level:     level,
		AddSource: true,
		ReplaceAttr: func(groups []string, a slog.Attr) slog.Attr {
			switch a.Key {
			case slog.LevelKey:
				return slog.String("severity", a.Value.String())
			case slog.TimeKey:
				return slog.String("timestamp", a.Value.Time().UTC().Format(time.RFC3339Nano))
			case slog.SourceKey:
				if src, ok := a.Value.Any().(*slog.Source); ok {
					_, file := splitSourcePath(src.File)
					return slog.String("source", file+":"+itoa(src.Line))
				}
			}
			return a
		},
	})

	defaultLogger = slog.New(handler)
	slog.SetDefault(defaultLogger)
}

func Default() *slog.Logger {
	if defaultLogger == nil {
		Init(LevelInfo, os.Stdout)
	}
	return defaultLogger
}

func Debug(msg string, args ...any) {
	Default().Debug(msg, args...)
}

func Info(msg string, args ...any) {
	Default().Info(msg, args...)
}

func Warn(msg string, args ...any) {
	Default().Warn(msg, args...)
}

func Error(msg string, args ...any) {
	Default().Error(msg, args...)
}

func With(args ...any) *slog.Logger {
	return Default().With(args...)
}

func WithContext(ctx context.Context) *slog.Logger {
	logger := Default()
	if traceID := TraceIDFromContext(ctx); traceID != "" {
		logger = logger.With("trace_id", traceID)
	}
	if spanID := SpanIDFromContext(ctx); spanID != "" {
		logger = logger.With("span_id", spanID)
	}
	if requestID := RequestIDFromContext(ctx); requestID != "" {
		logger = logger.With("request_id", requestID)
	}
	if userID := UserIDFromContext(ctx); userID != "" {
		logger = logger.With("user_id", userID)
	}
	return logger
}

func DebugCtx(ctx context.Context, msg string, args ...any) {
	WithContext(ctx).Debug(msg, args...)
}

func InfoCtx(ctx context.Context, msg string, args ...any) {
	WithContext(ctx).Info(msg, args...)
}

func WarnCtx(ctx context.Context, msg string, args ...any) {
	WithContext(ctx).Warn(msg, args...)
}

func ErrorCtx(ctx context.Context, msg string, args ...any) {
	WithContext(ctx).Error(msg, args...)
}

type contextKey string

const (
	traceIDKey  contextKey = "trace_id"
	spanIDKey   contextKey = "span_id"
	requestIDKey contextKey = "request_id"
	userIDKey   contextKey = "user_id"
)

func WithTraceID(ctx context.Context, traceID string) context.Context {
	return context.WithValue(ctx, traceIDKey, traceID)
}

func TraceIDFromContext(ctx context.Context) string {
	if v := ctx.Value(traceIDKey); v != nil {
		if s, ok := v.(string); ok {
			return s
		}
	}
	return ""
}

func WithSpanID(ctx context.Context, spanID string) context.Context {
	return context.WithValue(ctx, spanIDKey, spanID)
}

func SpanIDFromContext(ctx context.Context) string {
	if v := ctx.Value(spanIDKey); v != nil {
		if s, ok := v.(string); ok {
			return s
		}
	}
	return ""
}

func WithRequestID(ctx context.Context, requestID string) context.Context {
	return context.WithValue(ctx, requestIDKey, requestID)
}

func RequestIDFromContext(ctx context.Context) string {
	if v := ctx.Value(requestIDKey); v != nil {
		if s, ok := v.(string); ok {
			return s
		}
	}
	return ""
}

func WithUserID(ctx context.Context, userID string) context.Context {
	return context.WithValue(ctx, userIDKey, userID)
}

func UserIDFromContext(ctx context.Context) string {
	if v := ctx.Value(userIDKey); v != nil {
		if s, ok := v.(string); ok {
			return s
		}
	}
	return ""
}

func NewRequestID() string {
	return uuid.New().String()
}

func splitSourcePath(path string) (dir, file string) {
	for i := len(path) - 1; i >= 0; i-- {
		if path[i] == '/' || path[i] == '\\' {
			return path[:i+1], path[i+1:]
		}
	}
	return "", path
}

func itoa(i int) string {
	buf := make([]byte, 0, 10)
	for i >= 10 {
		buf = append(buf, byte('0'+i%10))
		i /= 10
	}
	buf = append(buf, byte('0'+i))
	for i, j := 0, len(buf)-1; i < j; i, j = i+1, j-1 {
		buf[i], buf[j] = buf[j], buf[i]
	}
	return string(buf)
}

func init() {
	Init(LevelInfo, os.Stdout)
}
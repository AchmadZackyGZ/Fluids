# FLUIDS — Backend Implementation TODO

> **FOKUS: BACKEND/SERVER ONLY** — Web, Mobile, ML nanti.
> Update file ini setiap task selesai. Checklist = definition of done.

---

## Legend
- `[ ]` = Belum mulai
- `[~]` = In progress
- `[x]` = Selesai (verified: build + test + log output)
- `🔴` = Blocker / butuh diskusi
- `🟡` = Partial / butuh follow-up

---

## WEEK 1 — Foundation: Auth Phase 1 + RabbitMQ + slog Logging

### 1.1 Logging Foundation (`internal/platform/logger/`)
| # | Task | File | Status | Notes |
|---|------|------|--------|-------|
| 1.1.1 | Buat `logger.go` — Init, custom JSON handler (severity, source, level) | `server/internal/platform/logger/logger.go` | `[ ]` | `slog.NewJSONHandler` + `ReplaceAttr` |
| 1.1.2 | Buat `context.go` — `FromContext(ctx)`, `WithUserID`, `WithRequestID`, `WithTraceID` | `server/internal/platform/logger/context.go` | `[ ]` | Extract trace_id/span_id dari OTel context |
| 1.1.3 | Integrate ke `main.go` — `logger.Init()` di startup, set `slog.SetDefault()` | `server/cmd/api/main.go` | `[ ]` | Call sebelum `fx.New()` |
| 1.1.4 | Buat HTTP middleware `RequestIDMiddleware` — inject `request_id` + `trace_id` ke context | `server/internal/platform/logger/middleware.go` | `[ ]` | Generate UUID v7, inject ke `echo.Context` |
| 1.1.5 | Update semua existing handler pakai `logger.InfoCtx/ErrorCtx` (search-replace) | `server/internal/modules/*/internal/delivery/http/handler.go` | `[ ]` | 6 modul × ~2-3 handler each |
| 1.1.6 | Test: `air` → `curl /health` → verify JSON log output dengan `request_id`, `trace_id` | Terminal | `[ ]` | `jq` filter untuk cek format |

### 1.2 Auth Contracts Extension
| # | Task | File | Status | Notes |
|---|------|------|--------|-------|
| 1.2.1 | Buat `server/internal/modules/auth/contracts/errors.go` | `server/internal/modules/auth/contracts/errors.go` | `[ ]` | Sentinel errors: `ErrInvalidRefreshToken`, `ErrRefreshTokenExpired`, `ErrTokenRevoked`, `ErrEmailNotVerified`, `ErrResetTokenInvalid`, `ErrResetTokenExpired` |
| 1.2.2 | Buat `server/internal/modules/auth/contracts/auth_contract.go` | `server/internal/modules/auth/contracts/auth_contract.go` | `[ ]` | Interface `AuthContract` dengan method: `RefreshToken`, `RevokeToken`, `RequestPasswordReset`, `VerifyEmail`, `ResendVerification`, `ChangePassword`, `DeleteAccount` |
| 1.2.3 | DTO structs: `RefreshTokenReq`, `RefreshTokenRes`, `ForgotPasswordReq`, `VerifyEmailReq`, `ResetPasswordReq`, `ChangePasswordReq`, `DeleteAccountReq` | Same file | `[ ]` | Tag `validate:"required,email"` etc |

### 1.3 Auth Service Implementation
| # | Task | File | Status | Notes |
|---|------|------|--------|-------|
| 1.3.1 | Extend `authService` struct — tambah field `redisClient`, `userContract`, `publisher` | `server/internal/modules/auth/internal/service/service.go` | `[ ]` | Inject via constructor |
| 1.3.2 | Implement `RefreshToken(ctx, req)` — validate refresh token di Redis, issue new access+refresh, rotate | Same file | `[ ]` | Redis key: `refresh_token:{user_id}:{token_hash}` |
| 1.3.3 | Implement `RevokeToken(ctx, userID, tokenHash)` — delete dari Redis, blacklist access token (optional) | Same file | `[ ]` | Log `token revoked` dengan `user_id` |
| 1.3.4 | Implement `RequestPasswordReset(ctx, req)` — generate reset token, simpan Redis (TTL 1h), publish event ke RabbitMQ | Same file | `[ ]` | Event: `user.password_reset_requested` |
| 1.3.5 | Implement `VerifyEmail(ctx, req)` — validate token, update user `email_verified=true`, revoke token | Same file | `[ ]` | Token di Redis: `email_verification:{token}` |
| 1.3.6 | Implement `ResendVerification(ctx, email)` — generate new token, publish event | Same file | `[ ]` | Rate limit: max 3/hour per email |
| 1.3.7 | Implement `ChangePassword(ctx, req)` — verify current password, hash new, revoke all refresh tokens | Same file | `[ ]` | Log `password changed` |
| 1.3.8 | Implement `DeleteAccount(ctx, userID)` — soft delete (flag `deleted_at`), revoke tokens, publish event | Same file | `[ ]` | GDPR compliance |

### 1.4 Auth Repository (PostgreSQL + Redis)
| # | Task | File | Status | Notes |
|---|------|------|--------|-------|
| 1.4.1 | Tambah tabel `refresh_tokens` migration | `server/internal/modules/auth/internal/migrations/000002_refresh_tokens.up.sql` | `[ ]` | Columns: `id`, `user_id`, `token_hash`, `expires_at`, `revoked_at`, `created_at` |
| 1.4.2 | Tambah tabel `password_reset_tokens` migration | `server/internal/modules/auth/internal/migrations/000003_password_reset_tokens.up.sql` | `[ ]` | Columns: `id`, `user_id`, `token_hash`, `expires_at`, `used_at` |
| 1.4.3 | Tambah tabel `email_verification_tokens` migration | `server/internal/modules/auth/internal/migrations/000004_email_verification_tokens.up.sql` | `[ ]` | Columns: `id`, `user_id`, `email`, `token_hash`, `expires_at`, `verified_at` |
| 1.4.4 | SQLC queries untuk CRUD token tables | `server/internal/modules/auth/internal/repository/queries/*.sql` | `[ ]` | `CreateRefreshToken`, `GetRefreshToken`, `RevokeRefreshToken`, `DeleteExpiredTokens`, etc |
| 1.4.5 | Generate SQLC | Terminal | `[ ]` | `go run github.com/sqlc-dev/sqlc/cmd/sqlc@latest generate` |
| 1.4.6 | Implement repository methods di `postgres.go` | `server/internal/modules/auth/internal/repository/postgres.go` | `[ ]` | Wrapper SQLC calls + error mapping |
| 1.4.7 | Redis operations: `SetRefreshToken`, `GetRefreshToken`, `DeleteRefreshToken`, `BlacklistAccessToken` | `server/internal/modules/auth/internal/repository/redis.go` (baru) | `[ ]` | TTL 24h untuk refresh, 15m untuk access blacklist |

### 1.5 Auth HTTP Handler
| # | Task | File | Status | Notes |
|---|------|------|--------|-------|
| 1.5.1 | Tambah endpoints di `RegisterAuthRoutes`: `POST /refresh`, `POST /logout`, `POST /forgot-password`, `POST /verify-email`, `POST /resend-verification`, `POST /reset-password`, `PATCH /change-password`, `DELETE /account` | `server/internal/modules/auth/internal/delivery/http/handler.go` | `[ ]` | `/logout`, `/change-password`, `/account` pakai `JWTMiddleware` |
| 1.5.2 | Implement handler methods dengan binding, validation, logging, error mapping | Same file | `[ ]` | Map `contracts.Err*` ke HTTP status |
| 1.5.3 | `RefreshToken` handler — read refresh token dari cookie (HttpOnly) atau body, return new access+refresh di cookie | Same file | `[ ]` | Cookie: `HttpOnly; Secure; SameSite=Lax; Path=/` |
| 1.5.4 | `Logout` handler — revoke refresh token, clear cookie | Same file | `[ ]` | |
| 1.5.5 | `ForgotPassword` handler — rate limit check, call service | Same file | `[ ]` | Rate limit via Redis sliding window |
| 1.5.6 | `VerifyEmail` & `ResendVerification` handlers | Same file | `[ ]` | |
| 1.5.7 | `ResetPassword` handler — validate token, hash new password | Same file | `[ ]` | |
| 1.5.8 | `ChangePassword` handler — require JWT, verify current password | Same file | `[ ]` | |
| 1.5.9 | `DeleteAccount` handler — require JWT, soft delete | Same file | `[ ]` | |

### 1.6 RabbitMQ Publisher & Topology
| # | Task | File | Status | Notes |
|---|------|------|--------|-------|
| 1.6.1 | Buat interface `Publisher` di `internal/platform/messaging/publisher.go` | `server/internal/platform/messaging/publisher.go` | `[ ]` | `Publish(ctx, exchange, routingKey, msg) error` |
| 1.6.2 | Buat `rabbitmq/publisher.go` implementasi | `server/internal/platform/messaging/rabbitmq/publisher.go` | `[ ]` | `amqp091-go`, connection pool, confirm mode |
| 1.6.3 | Buat `rabbitmq/topology.go` — declare exchange, queue, binding idempotent | `server/internal/platform/messaging/rabbitmq/topology.go` | `[ ]` | `fluids.auth` topic exchange, durable queues |
| 1.6.4 | Buat `rabbitmq/connection.go` — connection manager dengan reconnect | `server/internal/platform/messaging/rabbitmq/connection.go` | `[ ]` | Backoff retry, health check |
| 1.6.5 | Register publisher di `auth/module.go` — `fx.Provide(NewRabbitMQPublisher)` | `server/internal/modules/auth/module.go` | `[ ]` | |
| 1.6.6 | Publish `user.registered` di `Register` service method | `server/internal/modules/auth/internal/service/service.go` | `[ ]` | Payload: `{user_id, email, username, registered_at}` |
| 1.6.7 | Publish `user.logged_in` di `Login` service method | Same file | `[ ]` | Payload: `{user_id, ip, user_agent, logged_in_at}` |

### 1.7 Notification Consumer Skeleton
| # | Task | File | Status | Notes |
|---|------|------|--------|-------|
| 1.7.1 | Buat interface `Consumer` di `internal/platform/messaging/consumer.go` | `server/internal/platform/messaging/consumer.go` | `[ ]` | `Subscribe(queue, handler) error` |
| 1.7.2 | Buat `rabbitmq/consumer.go` implementasi | `server/internal/platform/messaging/rabbitmq/consumer.go` | `[ ]` | Auto-ack setelah handler success, retry 3x + DLQ |
| 1.7.3 | Buat `notification/internal/worker/welcome_email.go` — consume `user.registered` | `server/internal/modules/notification/internal/worker/welcome_email.go` | `[ ]` | Log dulu: "welcome email queued for user_id=xxx" |
| 1.7.4 | Register consumer di `notification/module.go` — `fx.Invoke(StartWelcomeEmailConsumer)` | `server/internal/modules/notification/module.go` | `[ ]` | |
| 1.7.5 | Test: register user → cek RabbitMQ management UI queue `welcome_email` → cek log consumer | Terminal + RabbitMQ UI | `[ ]` | |

### 1.8 Auth Module Wiring & Test
| # | Task | File | Status | Notes |
|---|------|------|--------|-------|
| 1.8.1 | Update `auth/module.go` — provide semua dependency baru (redis, publisher, repository, service) | `server/internal/modules/auth/module.go` | `[ ]` | |
| 1.8.2 | Run migration: `bash server/scripts/migrate.sh up` | Terminal | `[ ]` | Verify 3 tabel baru di `auth` schema |
| 1.8.3 | Build check: `cd server && go build ./...` | Terminal | `[ ]` | Zero error |
| 1.8.4 | Manual test full flow: register → login → refresh → logout → forgot-password → verify-email → reset-password | Terminal (curl) | `[ ]` | Verify DB + Redis + RabbitMQ + logs |
| 1.8.5 | Verify structured logs: setiap request punya `trace_id`, `request_id`, `user_id` (kalau auth) | Terminal + `jq` | `[ ]` | |

---

## WEEK 2 — User Profile + GraphQL Gateway Skeleton

### 2.1 User Profile Endpoints
| # | Task | File | Status | Notes |
|---|------|------|--------|-------|
| 2.1.1 | Extend `user/contracts/user_contract.go` — tambah `GetUserByUsername`, `UpdateProfile`, `UploadAvatar` | `server/internal/modules/user/contracts/user_contract.go` | `[ ]` | |
| 2.1.2 | Extend `user/contracts/errors.go` — `ErrUsernameNotFound`, `ErrAvatarUploadFailed` | `server/internal/modules/user/contracts/errors.go` | `[ ]` | |
| 2.1.3 | Implement service methods di `user/internal/service/service.go` | `server/internal/modules/user/internal/service/service.go` | `[ ]` | |
| 2.1.4 | Repository: query `GetUserByUsername`, `UpdateProfile` | `server/internal/modules/user/internal/repository/queries/*.sql` | `[ ]` | |
| 2.1.5 | SQLC generate + repository impl | Terminal + `postgres.go` | `[ ]` | |
| 2.1.6 | Handler: `GET /users/:username`, `PATCH /me`, `POST /me/avatar` | `server/internal/modules/user/internal/delivery/http/handler.go` | `[ ]` | Avatar upload → MinIO |
| 2.1.7 | MinIO integration: `internal/platform/storage/minio.go` | `server/internal/platform/storage/minio.go` | `[ ]` | Presigned URL untuk upload langsung dari client |
| 2.1.8 | Register routes di `user/module.go` | `server/internal/modules/user/module.go` | `[ ]` | |

### 2.2 GraphQL Gateway Skeleton
| # | Task | File | Status | Notes |
|---|------|------|--------|-------|
| 2.2.1 | Setup `gqlgen` config: `gqlgen.yml` di `server/internal/platform/graphql/` | `server/internal/platform/graphql/gqlgen.yml` | `[ ]` | Schema: `schema.graphqls`, models: existing DTOs |
| 2.2.2 | Buat root schema `schema.graphqls` — `User`, `Post`, `Comment`, `Feed`, `Query`, `Mutation` | `server/internal/platform/graphql/schema.graphqls` | `[ ]` | Map dari `contracts/` DTO |
| 2.2.3 | Buat resolver skeleton: `resolver.go`, `user.resolver.go`, `content.resolver.go` | `server/internal/platform/graphql/*.go` | `[ ]` | Call `contracts.UserContract` etc |
| 2.2.4 | Setup `DataLoader` untuk N+1 (user batch, post batch, comment batch) | `server/internal/platform/graphql/dataloader.go` | `[ ]` | `github.com/graph-gophers/dataloader` |
| 2.2.5 | HTTP handler: `POST /graphql` + Playground (dev only) | `server/internal/platform/graphql/handler.go` | `[ ]` | Mount di `main.go` |
| 2.2.6 | Auth middleware reuse: `security.JWTMiddleWare` → inject user ke context | Same | `[ ]` | |
| 2.2.7 | Test: query `feed { posts { author { username } likes { count } comments { author } } }` | Terminal (curl) | `[ ]` | Verify DataLoader batching di logs |

---

## WEEK 3 — Protobuf & gRPC Foundation

### 3.1 Protobuf Setup (`shared/proto/`)
| # | Task | File | Status | Notes |
|---|------|------|--------|-------|
| 3.1.1 | Buat `buf.yaml` + `buf.lock` | `shared/proto/buf.yaml` | `[ ]` | `version: v1`, `breaking: {use: [FILE]}` |
| 3.1.2 | Buat `buf.gen.yaml` — generate Go, Dart, TS, Python | `shared/proto/buf.gen.yaml` | `[ ]` | Plugins: `go`, `go-grpc`, `dart`, `ts`, `python` |
| 3.1.3 | Buat `reco/v1/reco.proto` — `VectorSearchService`, `EmbeddingService` | `shared/proto/reco/v1/reco.proto` | `[ ]` | `Search(vector, top_k) returns (items)` |
| 3.1.4 | Buat `chat/v1/chat.proto` — `MessageService` (streaming), `ConversationService` | `shared/proto/chat/v1/chat.proto` | `[ ]` | `SendMessage(stream) returns (stream)`, `ListMessages` |
| 3.1.5 | Buat `notification/v1/notification.proto` — `PushService`, `PreferenceService` | `shared/proto/notification/v1/notification.proto` | `[ ]` | `PushBatch(stream)`, `GetPreferences` |
| 3.1.6 | Run `buf generate` — verify output di `shared/proto/gen/` | Terminal | `[ ]` | |
| 3.1.7 | CI: GitHub Actions `buf breaking --against '.git#branch=main'` | `.github/workflows/buf.yml` | `[ ]` | Block PR kalau breaking change |

### 3.2 gRPC Server Infrastructure
| # | Task | File | Status | Notes |
|---|------|------|--------|-------|
| 3.2.1 | Buat `internal/platform/grpc/server.go` — generic gRPC server dengan interceptors | `server/internal/platform/grpc/server.go` | `[ ]` | Auth, logging, metrics, tracing interceptors |
| 3.2.2 | Buat `internal/platform/grpc/client.go` — generic client factory dengan retry | `server/internal/platform/grpc/client.go` | `[ ]` | |
| 3.2.3 | Integrate ke `main.go` — start gRPC server di port terpisah (misal `:9090`) | `server/cmd/api/main.go` | `[ ]` | `fx.Invoke(StartGRPCServer)` |

---

## WEEK 4 — gRPC Server Implementation + WebSocket Hub

### 4.1 Reco gRPC Server
| # | Task | File | Status | Notes |
|---|------|------|--------|-------|
| 4.1.1 | Implement `reco/v1.VectorSearchServiceServer` di `reco/internal/delivery/grpc/server.go` | `server/internal/modules/reco/internal/delivery/grpc/server.go` | `[ ]` | Call `RecoContract.Search` |
| 4.1.2 | Mapper: protobuf ↔ domain DTO | `server/internal/modules/reco/internal/delivery/grpc/mapper.go` | `[ ]` | |
| 4.1.3 | Register di `reco/module.go` | `server/internal/modules/reco/module.go` | `[ ]` | |

### 4.2 WebSocket Hub Platform
| # | Task | File | Status | Notes |
|---|------|------|--------|-------|
| 4.2.1 | Buat `internal/platform/ws/hub.go` — connection manager, rooms, broadcast | `server/internal/platform/ws/hub.go` | `[ ]` | In-memory map `roomID -> set[conn]` |
| 4.2.2 | Buat `internal/platform/ws/auth.go` — handshake upgrade dengan JWT validation | `server/internal/platform/ws/auth.go` | `[ ]` | Query param `token` atau header `Sec-WebSocket-Protocol` |
| 4.2.3 | Buat `internal/platform/ws/registry.go` — modul register handler | `server/internal/platform/ws/registry.go` | `[ ]` | `Register("stories", handler)` |
| 4.2.4 | Buat `internal/platform/ws/codec.go` — JSON/Protobuf codec interface | `server/internal/platform/ws/codec.go` | `[ ]` | |
| 4.2.5 | Integrate ke `main.go` — `fx.Invoke(StartWSHub)` | `server/cmd/api/main.go` | `[ ]` | Endpoint `GET /ws` |

---

## WEEK 5 — Stories Module + Kafka Event Log

### 5.1 Stories Module
| # | Task | File | Status | Notes |
|---|------|------|--------|-------|
| 5.1.1 | Buat `stories` module structure (contracts, internal, module.go) | `server/internal/modules/stories/` | `[ ]` | Follow modular monolith pattern |
| 5.1.2 | Contracts: `StoryDTO`, `CreateStoryReq`, `StoryContract` (CRUD + Viewers) | `contracts/stories_contract.go` | `[ ]` | |
| 5.1.3 | Migration: `stories`, `story_viewers`, `story_reactions` | `internal/migrations/*.sql` | `[ ]` | TTL 24h via cron job |
| 5.1.4 | Service + Repository + SQLC | `internal/service/`, `internal/repository/` | `[ ]` | |
| 5.1.5 | HTTP Handler: `POST /stories`, `GET /stories/feed`, `GET /stories/:id`, `POST /stories/:id/view`, `POST /stories/:id/reaction` | `internal/delivery/http/handler.go` | `[ ]` | |
| 5.1.6 | WS Handler: `join_story`, `leave_story`, `viewer_list`, `reaction_broadcast` | `internal/delivery/ws/handler.go` | `[ ]` | Register ke `ws.Register("stories", ...)` |
| 5.1.7 | Publish `story.created`, `story.viewed` ke Kafka | Service methods | `[ ]` | |

### 5.2 Kafka Event Log
| # | Task | File | Status | Notes |
|---|------|------|--------|-------|
| 5.2.1 | Buat `internal/platform/messaging/kafka/publisher.go` | `server/internal/platform/messaging/kafka/publisher.go` | `[ ]` | `segmentio/kafka-go`, async produce |
| 5.2.2 | Buat `kafka/topic.go` — auto-create topic dengan retention config | `server/internal/platform/messaging/kafka/topic.go` | `[ ]` | `user.actions` (30d), `embedding.updates` (7d) |
| 5.2.3 | Publish `user.action` dari setiap modul (like, follow, view, share) | Various services | `[ ]` | Async, non-blocking |
| 5.2.4 | Schema registry: `shared/events/user/v1/action.json` | `shared/events/user/v1/action.json` | `[ ]` | JSON Schema untuk validation |

---

## WEEK 6 — Chat Module + Notification Real-time

### 6.1 Chat Module (gRPC Streaming)
| # | Task | File | Status | Notes |
|---|------|------|--------|-------|
| 6.1.1 | Buat `chat` module structure | `server/internal/modules/chat/` | `[ ]` | |
| 6.1.2 | Contracts + gRPC implementation | `contracts/`, `internal/delivery/grpc/` | `[ ]` | Implement `chat.v1.MessageService` streaming |
| 6.1.3 | Migration: `conversations`, `messages`, `conversation_participants` | `internal/migrations/*.sql` | `[ ]` | |
| 6.1.4 | Service: `CreateConversation`, `SendMessage` (stream), `ListMessages`, `MarkRead` | `internal/service/service.go` | `[ ]` | |
| 6.1.5 | Register gRPC server di `chat/module.go` | `module.go` | `[ ]` | |

### 6.2 Notification Real-time (WS/SSE)
| # | Task | File | Status | Notes |
|---|------|------|--------|-------|
| 6.2.1 | Extend `notification` module dengan WS handler | `notification/internal/delivery/ws/handler.go` | `[ ]` | Register ke `ws.Register("notification", ...)` |
| 6.2.2 | SSE fallback endpoint: `GET /api/v1/notifications/stream` | `notification/internal/delivery/http/handler.go` | `[ ]` | Untuk browser tanpa WS support |
| 6.2.3 | Consumer: listen `notification.created` dari RabbitMQ → push ke WS/SSE | `notification/internal/worker/push.go` | `[ ]` | |

---

## WEEK 7 — ML Integration + Reco Explore

### 7.1 Python ML Service (gRPC Client)
| # | Task | File | Status | Notes |
|---|------|------|--------|-------|
| 7.1.1 | Setup `ml/` project dengan `uv`, `pyproject.toml` | `ml/` | `[ ]` | FastAPI + gRPC server |
| 7.1.2 | Generate Python stub dari `shared/proto/reco/v1/reco.proto` | `ml/` | `[ ]` | `buf generate` → Python |
| 7.1.3 | Implement Two-Tower model serving (PyTorch → ONNX → gRPC) | `ml/` | `[ ]` | `EmbeddingService.GetUserEmbedding`, `GetItemEmbedding` |
| 7.1.4 | Health check + metrics endpoint | `ml/` | `[ ]` | |

### 7.2 Reco Explore Integration
| # | Task | File | Status | Notes |
|---|------|------|--------|-------|
| 7.2.1 | `reco` service call ML gRPC untuk get embeddings | `reco/internal/service/service.go` | `[ ]` | Cache di Redis (TTL 1h) |
| 7.2.2 | Implement `/api/v1/reco/explore` — ranked items berdasarkan similarity | `reco/internal/delivery/http/handler.go` | `[ ]` | |
| 7.2.3 | Periodic embedding recompute job (cron) → publish `embedding.updated` ke Kafka | `reco/internal/job/recompute.go` | `[ ]` | |

---

## WEEK 8 — Hardening & Observability

### 8.1 Testing
| # | Task | Status | Notes |
|---|------|--------|-------|
| 8.1.1 | Unit test: service layer (mock contracts) | `[ ]` | `go test ./internal/modules/.../internal/service/...` |
| 8.1.2 | Integration test: handler + repository (testcontainers PostgreSQL) | `[ ]` | `go test ./internal/modules/.../internal/delivery/...` |
| 8.1.3 | Contract test: event schema validation (producer/consumer) | `[ ]` | `go test ./internal/platform/messaging/...` |
| 8.1.4 | Load test: `hey` / `k6` untuk endpoint kritis (login, feed, explore) | `[ ]` | Target: p99 < 200ms, 1000 RPS |

### 8.2 Observability
| # | Task | File | Status | Notes |
|---|------|------|--------|-------|
| 8.2.1 | OpenTelemetry setup: tracer, meter, logger provider | `server/internal/platform/otel/` | `[ ]` | OTLP exporter → Tempo/Prometheus/Loki |
| 8.2.2 | HTTP middleware: trace propagation, metrics (latency, errors, rate) | `server/internal/platform/otel/middleware.go` | `[ ]` | |
| 8.2.3 | gRPC interceptors: trace, metrics | `server/internal/platform/grpc/interceptors.go` | `[ ]` | |
| 8.2.4 | RabbitMQ/Kafka: inject trace_id ke headers, extract di consumer | `messaging/` | `[ ]` | |
| 8.2.5 | Dashboard: Grafana (RED metrics, log query, trace view) | `deploy/grafana/dashboards/` | `[ ]` | |

### 8.3 Documentation & Sync
| # | Task | File | Status | Notes |
|---|------|------|--------|-------|
| 8.3.1 | Update OpenAPI spec (`shared/openapi/`) dari handler annotations | `shared/openapi/*.yaml` | `[ ]` | `swag init` atau manual |
| 8.3.2 | Generate TS client (web) + Dart client (mobile) | `web/`, `mobile/` | `[ ]` | `openapi-typescript`, `openapi-generator` |
| 8.3.3 | Update `ARCHITECTURE_DOCUMENTATION.md` sync dengan `PLAN.md` | `ARCHITECTURE_DOCUMENTATION.md` | `[ ]` | |
| 8.3.4 | README: runbook, troubleshooting, API examples | `README.md` | `[ ]` | |

---

## BACKLOG (Post-Week 8 / Nice to Have)

| # | Task | Priority |
|---|------|----------|
| B1 | Settings module (privacy, notifications, security, linked accounts) | High |
| B2 | Moderation module (reports, admin actions, content hiding) | Medium |
| B3 | Search module (users, posts, hashtags) — Elasticsearch/MeiliSearch | Medium |
| B4 | Analytics dashboard (engagement, retention, growth) | Low |
| B5 | CI/CD pipeline: GitHub Actions → Docker → K8s staging | High |
| B6 | Chaos engineering: Litmus/Gremlin untuk resilience testing | Low |
| B7 | Multi-region deployment (active-passive) | Low |

---

## Definition of Done per Task
- [ ] Code compiles: `go build ./...` zero error
- [ ] Unit test pass: `go test ./...` (coverage > 70% untuk service layer)
- [ ] Structured logs visible: JSON output dengan `trace_id`, `request_id`, `user_id`
- [ ] Migration idempotent: `bash server/scripts/migrate.sh up` bisa diulang
- [ ] Contract test pass: event schema valid, gRPC breaking check pass
- [ ] Manual test verified: curl/Postman flow works end-to-end
- [ ] Code formatted: `gofmt -w` hanya file yang diubah
- [ ] Lint pass: `golangci-lint run` zero issue

---

## Current Sprint Focus (Week 1)
**Priority Order:**
1. 🟢 **1.1 Logging Foundation** (blocker untuk semua task lain — need trace_id di log)
2. 🟢 **1.2 Auth Contracts** (prerequisite untuk service)
3. 🟢 **1.3 Auth Service** (core logic)
4. 🟢 **1.4 Auth Repository** (DB + Redis)
5. 🟢 **1.5 Auth Handler** (HTTP endpoints)
6. 🟢 **1.6 RabbitMQ Publisher** (async events)
7. 🟢 **1.7 Notification Consumer** (event consumption)
8. 🟢 **1.8 Wiring & Test** (integration verification)

> **Rule**: Selesaikan 1.1–1.3 sebelum lanjut 1.4. Commit per logical unit (contracts → service → repo → handler → wiring).

---

*Last updated: 2026-09-27 — Update this file daily.*
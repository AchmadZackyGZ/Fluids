# FLUIDS — Backend Implementation TODO

> **FOKUS: BACKEND/SERVER ONLY** — Web, Mobile, ML nanti.
> Update file ini setiap task selesai. Checklist = definition of done.

> 🔴 **PERINGATAN (audit 15 Okt 2026):** File ini **pernah salah menandai task `[x]` padahal masih stub.**
> Aturan baru yang wajib dipatuhi: **`[x]` hanya boleh dipakai setelah diverifikasi ke kode** (bukan karena "kelihatannya sudah ditulis").
> Kalau metodenya ada tapi isinya masih `// TODO:` → tandai `[~]` atau 🟡, **BUKAN** `[x]`.

Last updated: 2026-10-15

---

## Legend
- `[ ]` = Belum mulai
- `[~]` = In progress
- 🟡 = **Partial / ada kode tapi masih stub** (ada `// TODO:` di source)
- `[x]` = Selesai (**verified**: build + test + log output + tidak ada stub)
- `🔴` = Blocker / butuh diskusi
- ⚪ = Skip / dipindah ke backlog

---

## STATUS AKTUAL vs CHECKLIST (15 Okt 2026)

Ringkasan cepat — **selalu cross-check dengan `AGENTS.md` bagian 8b**:

| Area | Checklist bilang | Realita kode |
|---|---|---|
| Logging foundation (1.1) | `[ ]` semua | ✅ **SUDAH JADI** (`4d00ade`) — logger.go + middleware.go + `SanitizeArgs` |
| Auth contracts (1.2) | `[ ]` semua | ✅ **SUDAH JADI** (`errors.go` + `auth_contract.go`) |
| Auth service (1.3) | `[x]` semua | 🟡 **STUB** — 6 `// TODO:` di `service.go` |
| Auth repository (1.4) | `[ ]` semua | ❌ **BELUM ADA FOLDER** `repository/` & `migrations/` |
| Auth handler (1.5) | `[x]` semua | 🟡 **ADA** tapi bergantung ke service yang masih stub |
| JWT middleware fix | — | ✅ **SUDAH JADI** (`02038bf`) — route dipecah public/protected |
| MinIO | — | ✅ **SUDAH JADI** (`77011bb`) |
| RabbitMQ (1.6, 1.7) | `[ ]` | ❌ **BELUM ADA** — `platform/messaging/` tidak eksis |

---

## WEEK 1 — Foundation: Auth Phase 1 + RabbitMQ + slog Logging

### 1.1 Logging Foundation (`internal/platform/logger/`) — ✅ SELESAI (commit `4d00ade`)
| # | Task | File | Status | Notes |
|---|------|------|--------|-------|
| 1.1.1 | Buat `logger.go` — Init, custom JSON handler (severity, source, level) | `server/internal/platform/logger/logger.go` | `[x]` | `slog.NewJSONHandler` + `ReplaceAttr`; plus `SanitizeArgs()` deny-list |
| 1.1.2 | Buat `context.go` — `FromContext(ctx)`, `WithUserID`, `WithRequestID`, `WithTraceID` | — | 🟡 | Helper context ada di `logger.go` (`InfoCtx`/`ErrorCtx`/`WarnCtx`); **`context.go` terpisah belum dibuat** |
| 1.1.3 | Integrate ke `main.go` — `logger.Init()` di startup, set `slog.SetDefault()` | `server/cmd/api/main.go` | `[x]` | Sudah dipanggil sebelum `fx.New()` |
| 1.1.4 | Buat HTTP middleware — inject `request_id` + `trace_id` ke context | `server/internal/platform/logger/middleware.go` | `[x]` | `RequestIDMiddleware`, `LoggingMiddleware`, `UserIDMiddleware` |
| 1.1.5 | Update semua existing handler pakai `logger.InfoCtx/ErrorCtx` | `server/internal/modules/*/internal/delivery/http/handler.go` | `[x]` | Sudah dipakai konsisten di 6 modul |
| 1.1.6 | Test: `air` → `curl /health` → verify JSON log output | Terminal | 🟡 | Perlu re-verifikasi manual setelah perubahan terakhir |

### 1.2 Auth Contracts Extension — ✅ SELESAI
| # | Task | File | Status | Notes |
|---|------|------|--------|-------|
| 1.2.1 | Buat `auth/contracts/errors.go` | `server/internal/modules/auth/contracts/errors.go` | `[x]` | Sentinel errors: `ErrInvalidRefreshToken`, `ErrRefreshTokenExpired`, `ErrTokenRevoked`, `ErrEmailNotVerified`, `ErrResetTokenInvalid`, `ErrResetTokenExpired`, dll |
| 1.2.2 | Buat `auth/contracts/auth_contract.go` | `server/internal/modules/auth/contracts/auth_contract.go` | `[x]` | Interface `AuthService` dideklarasi di `service`; DTO di `contracts` |
| 1.2.3 | DTO structs: `RefreshTokenReq`, `ForgotPasswordReq`, `VerifyEmailReq`, `ResetPasswordReq`, `ChangePasswordReq`, `DeleteAccountReq` | Same file | `[x]` | Tag `validate:"required,email"` dll |

### 1.3 Auth Service Implementation — 🟡 STUB (jangan tandai `[x]`!)
> ⚠️ Keempat baris di bawah ini **punya kode**, tapi isinya masih `// TODO:` di `service.go`
> (baris 210, 238, 284, 317, 351, 383). Efeknya: **password tidak pernah berubah**, **email tidak pernah ter-verified**.
> Status `[x]` lama itu **SALAH** dan sudah dikoreksi.

| # | Task | File | Status | Notes |
|---|------|------|--------|-------|
| 1.3.1 | Extend `authService` struct — tambah field `redisClient`, `userContract` | `server/internal/modules/auth/internal/service/service.go` | `[x]` | Inject via constructor ✅ |
| 1.3.2 | Implement `RefreshToken(ctx, req)` — validate di Redis, issue new token, rotate | Same file | 🟡 | Ada, perlu verifikasi rotasi & TTL |
| 1.3.3 | Implement `RevokeToken(ctx, userID, tokenHash)` — delete dari Redis | Same file | 🟡 | Ada; blacklist access token belum |
| 1.3.4 | Implement `RequestPasswordReset` — generate token, simpan Redis, publish event | Same file | 🟡 | 🔴 `// TODO: Publish event to RabbitMQ` (baris 210) |
| 1.3.5 | Implement `VerifyEmail(ctx, req)` — update user `email_verified=true` | Same file | 🔴 | ⚠️ `// TODO: Add UpdateEmailVerified to userContract` (baris 238) — **email TIDAK diupdate di DB** |
| 1.3.6 | Implement `ResendVerification(ctx, email)` — generate token, publish event | Same file | 🟡 | 🔴 `// TODO: Publish event to RabbitMQ` (baris 284) |
| 1.3.7 | Implement `ChangePassword(ctx, req)` — verify current password, hash new | Same file | 🔴 | ⚠️ `// TODO: Add UpdatePassword to userContract` (baris 317) — **password TIDAK berubah** |
| 1.3.8 | Implement `DeleteAccount(ctx, userID)` — soft delete `deleted_at` | Same file | 🔴 | ⚠️ `// TODO: Call userContract.DeleteAccount or UpdateDeletedAt` (baris 383) — **tidak soft-delete** |
| 1.3.9 | Helper: `issueTokens`, `revokeAllUserTokens`, `generateToken`, `hashToken` | Same file | 🟡 | 🔴 `hashToken` = **XOR manual** (baris 453) harus jadi SHA-256; `revokeAllUserTokens` = SCAN seluruh keyspace (baris 423) O(N) |

### 1.4 Auth Repository (PostgreSQL + Redis) — ❌ BELUM DIMULAI
> ⚠️ Folder `auth/internal/repository/` dan `auth/internal/migrations/` **TIDAK ADA**.

| # | Task | File | Status | Notes |
|---|------|------|--------|-------|
| 1.4.1 | Tambah tabel `refresh_tokens` migration | `server/internal/modules/auth/internal/migrations/000002_refresh_tokens.up.sql` | `[ ]` | Columns: `id`, `user_id`, `token_hash`, `expires_at`, `revoked_at`, `created_at` |
| 1.4.2 | Tambah tabel `password_reset_tokens` migration | `server/internal/modules/auth/internal/migrations/000003_password_reset_tokens.up.sql` | `[ ]` | Columns: `id`, `user_id`, `token_hash`, `expires_at`, `used_at` |
| 1.4.3 | Tambah tabel `email_verification_tokens` migration | `server/internal/modules/auth/internal/migrations/000004_email_verification_tokens.up.sql` | `[ ]` | Columns: `id`, `user_id`, `email`, `token_hash`, `expires_at`, `verified_at` |
| 1.4.4 | SQLC queries untuk CRUD token tables | `server/internal/modules/auth/internal/repository/queries/*.sql` | `[ ]` | `CreateRefreshToken`, `GetRefreshToken`, `RevokeRefreshToken`, `DeleteExpiredTokens`, etc |
| 1.4.5 | Generate SQLC | Terminal | `[ ]` | `go run github.com/sqlc-dev/sqlc/cmd/sqlc@latest generate` |
| 1.4.6 | Implement repository methods di `postgres.go` | `server/internal/modules/auth/internal/repository/postgres.go` | `[ ]` | Wrapper SQLC calls + error mapping |
| 1.4.7 | Redis operations (opsional — sekarang masih inline di service) | `server/internal/modules/auth/internal/repository/redis.go` | `[ ]` | TTL 24h refresh, 15m access blacklist |

### 1.5 Auth HTTP Handler — 🟡 ADA, tapi bergantung ke service yang masih stub
| # | Task | File | Status | Notes |
|---|------|------|--------|-------|
| 1.5.1 | Tambah endpoints di `RegisterAuthRoutes` | `server/internal/modules/auth/module.go` | `[x]` | ✅ Route dipecah: `public` group + `protected` group (+ `JWTMiddleWare`) |
| 1.5.2 | Implement handler methods dengan binding, validation, logging, error mapping | `handler.go` | `[x]` | `mapError` memetakan `contracts.Err*` ke HTTP status ✅ |
| 1.5.3 | `RefreshToken` handler — read refresh token dari cookie/body | Same file | `[x]` | Cookie support + body fallback ✅ |
| 1.5.4 | `Logout` handler — revoke refresh token, clear cookie | Same file | `[x]` | ✅ (sudah pakai JWT middleware) |
| 1.5.5 | `ForgotPassword` handler — rate limit check, call service | Same file | `[x]` | Rate limit via Redis ✅ |
| 1.5.6 | `VerifyEmail` & `ResendVerification` handlers | Same file | 🟡 | Handler ada, tapi service-nya stub → **efek nyata belum ada** |
| 1.5.7 | `ResetPassword` handler — validate token, hash new password | Same file | 🟡 | Handler ada, tapi **password tidak tersimpan** (service stub) |
| 1.5.8 | `ChangePassword` handler — require JWT, verify current password | Same file | 🟡 | Handler ada; `c.Get("user_id").(string)` masih **type assertion tanpa cek** → rawan panic |
| 1.5.9 | `DeleteAccount` handler — require JWT, soft delete | Same file | 🟡 | idem |

### 1.6 RabbitMQ Publisher & Topology — ❌ BELUM DIMULAI
> ⚠️ Folder `server/internal/platform/messaging/` **tidak ada**. Container RabbitMQ jalan, kode belum.

| # | Task | File | Status | Notes |
|---|------|------|--------|-------|
| 1.6.1 | Buat interface `Publisher` | `server/internal/platform/messaging/publisher.go` | `[ ]` | `Publish(ctx, exchange, routingKey, msg) error` |
| 1.6.2 | Buat `rabbitmq/publisher.go` implementasi | `server/internal/platform/messaging/rabbitmq/publisher.go` | `[ ]` | `amqp091-go`, connection pool, confirm mode |
| 1.6.3 | Buat `rabbitmq/topology.go` — declare exchange/queue/binding idempotent | `server/internal/platform/messaging/rabbitmq/topology.go` | `[ ]` | `fluids.auth` topic exchange, durable queues |
| 1.6.4 | Buat `rabbitmq/connection.go` — connection manager dengan reconnect | `server/internal/platform/messaging/rabbitmq/connection.go` | `[ ]` | Backoff retry, health check |
| 1.6.5 | Register publisher di `auth/module.go` via Fx | `server/internal/modules/auth/module.go` | `[ ]` | |
| 1.6.6 | Publish `user.registered` di `Register` | `service.go` | `[ ]` | Payload: `{user_id, email, username, registered_at}` |
| 1.6.7 | Publish `user.logged_in` di `Login` | Same file | `[ ]` | Payload: `{user_id, ip, user_agent, logged_in_at}` |

### 1.7 Notification Consumer Skeleton — ❌ BELUM DIMULAI
| # | Task | File | Status | Notes |
|---|------|------|--------|-------|
| 1.7.1 | Buat interface `Consumer` | `server/internal/platform/messaging/consumer.go` | `[ ]` | `Subscribe(queue, handler) error` |
| 1.7.2 | Buat `rabbitmq/consumer.go` implementasi | `.../rabbitmq/consumer.go` | `[ ]` | Auto-ack setelah handler success, retry 3x + DLQ |
| 1.7.3 | Buat `notification/internal/worker/welcome_email.go` | `server/internal/modules/notification/internal/worker/welcome_email.go` | `[ ]` | Log dulu: "welcome email queued for user_id=xxx" |
| 1.7.4 | Register consumer di `notification/module.go` | `notification/module.go` | `[ ]` | |
| 1.7.5 | Test: register → cek queue `welcome_email` → cek log consumer | Terminal + RabbitMQ UI | `[ ]` | |

### 1.8 Auth Module Wiring & Test
| # | Task | File | Status | Notes |
|---|------|------|--------|-------|
| 1.8.1 | Update `auth/module.go` — provide service, handler, new routes | `auth/module.go` | `[x]` | ✅ Route public/protected sudah dipisah |
| 1.8.2 | Run migration: `bash server/scripts/migrate.sh up` | Terminal | `[ ]` | 🔴 Butuh migrasi baru dulu (task 1.4.1–1.4.3) |
| 1.8.3 | Build check: `cd server && go build ./...` | Terminal | `[x]` | ✅ Diverifikasi 15 Okt — exit 0, zero error |
| 1.8.4 | Manual test full flow: register → login → refresh → logout → forgot → verify → reset | Terminal (curl) | `[ ]` | 🔴 **Diblokir** oleh stub service 1.3 — password/email tidak tersimpan |
| 1.8.5 | Verify structured logs: setiap request punya `trace_id`, `request_id`, `user_id` | Terminal + `jq` | `[ ]` | |

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

## PRODUCTION OBSERVABILITY (Phase 2 — Setelah Aplikasi Selesai)

> **Keputusan pemilik project (15 Okt 2026):** stack observability = **OpenTelemetry** (traceID, spanID)
> + **Grafana Alloy** (collector/agent) → **Grafana Loki** (logs) + **Tempo** (traces) + **Prometheus** (metrics)
> → **Grafana Dashboard**. Ini upgrade lanjutan dari `slog` yang sudah jalan (slog → centralized logging).

| # | Task | Priority | Notes |
|---|------|----------|-------|
| P1 | **OpenTelemetry SDK**: tracer + meter provider, OTLP exporter | High | Instrumentasi HTTP, gRPC, DB, broker. Ini pondasi trace_id |
| P2 | **Centralized Logging**: ship JSON log `slog` → **Grafana Alloy** → **Loki** | High | Query by `trace_id`, `user_id`, `service`. Ini "upgrade slog" yang dimaksud |
| P3 | **Distributed Tracing**: OTel → Alloy → **Tempo** | Medium | Trace propagation HTTP → gRPC → RabbitMQ/Kafka |
| P4 | **Metrics**: Prometheus scrape `/metrics` (RED: Rate, Errors, Duration) | High | `promhttp.Handler()`, ServiceMonitor untuk K8s |
| P5 | **Grafana Dashboard**: RED metrics + Log query + Trace view + Business KPI | High | SLO/SLI dashboard |
| P6 | **Alerting**: PrometheusRule + Alertmanager (Slack/PagerDuty) | High | High error rate, latency p99, disk/memory pressure |
| P7 | **Log Retention & Sampling**: Loki retention 30d, sampling DEBUG di prod | Medium | Cost control |

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

## Current Sprint Focus — PRIORITAS REAL (15 Okt 2026)

> ⚠️ Sprint focus lama (`1.1 … 1.8` berurutan) **sudah tidak akurat** — 1.1 & 1.2 sudah selesai.
> Urutan baru berdasarkan **rantai akar masalah** (lihat `AGENTS.md` bagian 8b). Perbaiki **dari bawah ke atas**.

**Priority Order:**

1. 🔴 **1.3-A Fix `hashToken` XOR → SHA-256** — cepat, mandiri, tidak butuh migrasi. Kerjakan dulu.
2. 🔴 **Migrasi: tambah kolom `email_verified` & `deleted_at`** ke tabel `users` (migrasi baru `0003` di modul `user`)
   → file: `server/internal/modules/user/internal/migrations/0003_add_email_verified_deleted_at.{up,down}.sql`
3. 🔴 **Extend `userContract`** — tambah `UpdatePassword`, `UpdateEmailVerified`, `DeleteAccount` (+ implementasi di `user/internal/service` + `repository`)
4. 🔴 **Sambungkan 5 stub auth service** ke method contract baru → hapus semua `// TODO:` di `service.go`
5. 🟡 **Hardening:** hentikan `panic` — `c.Get("user_id").(string)` diganti cek `ok` → return 401
6. 🟡 **Optimasi:** `revokeAllUserTokens` dari `SCAN refresh_token:*` → index per-user (`refresh_token:user:<id>:<hash>` atau Redis SET)
7. ⚪ **1.4 Auth Repository** — baru masuk akal **setelah** langkah 1–6 selesai (kalau tetap mau pindah dari inline Redis ke DB)
8. ⚪ **1.6–1.7 RabbitMQ** — butuh keputusan desain dulu (lihat `PLAN.md` bagian Async)

> **Aturan:** selesaikan **satu unit logis**, verifikasi (`go build ./...` + `curl` manual), baru commit → push → PR.
> Jangan gabungkan migrasi + refactor + docs dalam satu PR.

---

*Last updated: 2026-10-15 — Update this file setiap task selesai. **`[x]` hanya kalau sudah diverifikasi ke kode.***
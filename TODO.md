# FLUIDS — Backend Implementation TODO

> **FOKUS: BACKEND/SERVER ONLY** — Web, Mobile, ML nanti.
> Update file ini setiap task selesai. Checklist = definition of done.

> 🔴 **PERINGATAN (audit 15 Okt 2026):** File ini **pernah salah menandai task `[x]` padahal masih stub.**
> Aturan baru yang wajib dipatuhi: **`[x]` hanya boleh dipakai setelah diverifikasi ke kode** (bukan karena "kelihatannya sudah ditulis").
> Kalau metodenya ada tapi isinya masih `// TODO:` → tandai `[~]` atau 🟡, **BUKAN** `[x]`.

Last updated: 2026-11-24

---

## Legend
- `[ ]` = Belum mulai
- `[~]` = In progress
- 🟡 = **Partial / ada gap atau `TODO(step-f)` tersisa**
- `[x]` = Selesai (**verified**: build + test + kode aktual dicek)
- `🔴` = Blocker / hotfix prioritas tinggi
- ⚪ = Skip / dipindah ke backlog

---

## STATUS AKTUAL vs CHECKLIST (Audit Kode 24 Nov 2026)

Ringkasan cepat — **selalu cross-check dengan `AGENTS.md` §8b & `TASK_LOG.md`**:

| Area | Status Realita Kode | Catatan Verifikasi |
|---|---|---|
| Logging foundation (1.1) | `[x]` + 🟡 | `logger.go` + `middleware.go` + `SanitizeArgs` substring match (`b75a2fb`) + 7 test PASS. *Gap:* `UserIDMiddleware` belum di-mount & 5 handler non-`auth` belum direfactor ke §5b |
| Auth contracts (1.2) | 🟡 | `errors.go` + `auth_contract.go` ada, tapi `auth/service.go` masih punya duplikasi `service.Err*` & `AuthContract` belum di-provide |
| Auth Step A–E (1.3, 1.5, 1.8) | `[x]` (sisa Step F + hotfix) | Migrasi `0003`, `UserContract` 6 method, 5 stub tersambung, SHA-256 `HashToken`, Redis SET per-user, `currentUserID()`, 35 unit test PASS (PR #26–#28). Sisa: 2 `TODO(step-f)` RabbitMQ + hotfix JWT 15m & envelope `Register` |
| Auth repository (1.4) | `[ ]` | Folder `auth/internal/repository/` & `migrations/` belum dibuat (persistensi token masih di Redis) |
| **Hotfix Keamanan & Kontrak (1.9)** | 🔴 **PRIORITAS #1** | JWT masih `24h` (`jwt.go:29`), IDOR `content.UpdatePostCaption`, 8× unsafe `user_id` di `content`, envelope `Register` flat, healthcheck MinIO `curl` |
| User Profile + MinIO (2.1) | `[ ]` (**PRIORITAS #2**) | `user` baru punya `GET /me`; `App.tsx` hit `PUT /api/v1/users/profile` (404); `platform/storage/` belum ada |
| RabbitMQ (1.6, 1.7 / Step F) | `[ ]` (**PRIORITAS #3**) | `platform/messaging/` belum ada — container jalan tapi belum dipakai kode Go |

---

## WEEK 1 — Foundation: Auth Step A–E (✅) + Hotfix Keamanan & Kontrak (🔴) + RabbitMQ

### 1.1 Logging Foundation (`internal/platform/logger/`) — ✅ CORE SELESAI (PR #24, #27, #28)
| # | Task | File | Status | Notes |
|---|------|------|--------|-------|
| 1.1.1 | Buat `logger.go` — Init, custom JSON handler (severity, source, timestamp) + `SanitizeArgs` substring | `server/internal/platform/logger/logger.go` | `[x]` | Substring deny-list + 7 unit test PASS (`b75a2fb`, `52b85db`) |
| 1.1.2 | Helper context (`WithUserID`, `WithRequestID`, `WithTraceID`, `InfoCtx/DebugCtx/WarnCtx/ErrorCtx`) | `server/internal/platform/logger/logger.go` | `[x]` | Digabung di `logger.go` (pecah `context.go` opsional saat OTel masuk) |
| 1.1.3 | Integrate ke `main.go` — `logger.Init()` di startup, `slog.SetDefault()` | `server/cmd/api/main.go` | `[x]` | Dipanggil sebelum `fx.New()` |
| 1.1.4 | HTTP middleware — `RequestIDMiddleware`, `LoggingMiddleware`, `UserIDMiddleware` | `server/internal/platform/logger/middleware.go` | 🟡 | `RequestID` & `Logging` terpasang; `UserIDMiddleware` belum di-mount & `LoggingMiddleware` ambil `ctx` sebelum `next(c)` |
| 1.1.5 | Terapkan aturan logging `AGENTS.md` §5b di seluruh handler | `server/internal/modules/*/internal/delivery/http/handler.go` | 🟡 | `auth` sudah patuh §5b (`6cecb01`); 5 modul lain (`user`, `content`, `social`, `notification`, `reco`) menyusul bertahap |
| 1.1.6 | Verifikasi log JSON (`LOG_LEVEL=debug`, 4xx = `WARN`, password `[REDACTED]`) | Terminal | `[x]` | Terverifikasi di T-020 (`AGENTS.md` §5b.8) |

### 1.2 Auth Contracts Extension — 🟡 ADA (duplikasi sentinel di service)
| # | Task | File | Status | Notes |
|---|------|------|--------|-------|
| 1.2.1 | Buat `auth/contracts/errors.go` | `server/internal/modules/auth/contracts/errors.go` | `[x]` | Ada; perlu penyatuan dengan `service.Err*` nanti |
| 1.2.2 | Buat `auth/contracts/auth_contract.go` | `server/internal/modules/auth/contracts/auth_contract.go` | 🟡 | Interface & DTO ada, tapi `auth/module.go` belum provide `AuthContract` |
| 1.2.3 | DTO structs (`RefreshTokenReq`, `ForgotPasswordReq`, `VerifyEmailReq`, `ResetPasswordReq`, `ChangePasswordReq`, `DeleteAccountReq`) | Same file | `[x]` | Dipakai aktif di `auth/service.go` & `handler.go` |

### 1.3 Auth Service Implementation — ✅ STEP A–E SELESAI (sisa 2 `TODO(step-f)` RabbitMQ)
| # | Task | File | Status | Notes |
|---|------|------|--------|-------|
| 1.3.1 | Extend `authService` struct — `redisClient`, `userContract` (6 method) | `server/internal/modules/auth/internal/service/service.go` | `[x]` | Step B (`22aa2ca`) + fix `PasswordHash` (`b050692`) |
| 1.3.2 | `RefreshToken(ctx, req)` — validate Redis, rotasi token + cleanup index | Same file | `[x]` | Verifikasi unit test (`52b85db`) |
| 1.3.3 | `RevokeToken(ctx, userID, tokenHash)` — hapus refresh token + SRem index | Same file | `[x]` | Fix double-hash (`6cecb01`) + test regresi. *Catatan:* `access_blacklist:` belum ditegakkan di `JWTMiddleWare` |
| 1.3.4 | `RequestPasswordReset` — rate limit 3/jam, simpan Redis 1h | Same file | 🟡 | Jalan + test PASS; sisa `TODO(step-f)` publish RabbitMQ & hapus log `dev token` DEBUG |
| 1.3.5 | `VerifyEmail(ctx, req)` — `UpdateEmailVerified(true)` dulu, baru hapus token | Same file | `[x]` | Step C (`09c7e26`) + test regresi (`52b85db`) |
| 1.3.6 | `ResendVerification(ctx, req)` — rate limit 3/jam, simpan Redis 24h | Same file | 🟡 | Jalan; sisa `TODO(step-f)` publish RabbitMQ & hapus log `dev token` DEBUG |
| 1.3.7 | `ChangePassword` & `ResetPassword` — hash bcrypt + `UpdatePassword` + cabut semua sesi | Same file | `[x]` | Step C/D (`09c7e26`, `6cecb01`) + test regresi (`52b85db`) |
| 1.3.8 | `DeleteAccount(ctx, userID, req)` — soft delete `deleted_at` + cabut semua sesi | Same file | `[x]` | Step C (`09c7e26`) + test PASS (`52b85db`) |
| 1.3.9 | Helper: `issueTokens`, `revokeAllUserTokens` (Redis SET O(k)), `security.HashToken` (SHA-256) | Same file + `platform/security/token.go` | `[x]` | Step D (`6cecb01`) + 11 test `platform/security` PASS |

### 1.4 Auth Repository (PostgreSQL + Redis) — ⚪ BACKLOG (persistensi saat ini di Redis)
> ℹ️ Folder `auth/internal/repository/` & `auth/internal/migrations/` belum dibuat; token saat ini di-persist di Redis. Diputuskan belakangan sesuai ADR/Open Question #8.

| # | Task | File | Status | Notes |
|---|------|------|--------|-------|
| 1.4.1 | Tambah tabel `refresh_tokens` migration | `server/internal/modules/auth/internal/migrations/000002_refresh_tokens.up.sql` | `[ ]` | Columns: `id`, `user_id`, `token_hash`, `expires_at`, `revoked_at`, `created_at` |
| 1.4.2 | Tambah tabel `password_reset_tokens` migration | `server/internal/modules/auth/internal/migrations/000003_password_reset_tokens.up.sql` | `[ ]` | Columns: `id`, `user_id`, `token_hash`, `expires_at`, `used_at` |
| 1.4.3 | Tambah tabel `email_verification_tokens` migration | `server/internal/modules/auth/internal/migrations/000004_email_verification_tokens.up.sql` | `[ ]` | Columns: `id`, `user_id`, `email`, `token_hash`, `expires_at`, `verified_at` |
| 1.4.4 | SQLC queries untuk CRUD token tables | `server/internal/modules/auth/internal/repository/queries/*.sql` | `[ ]` | |
| 1.4.5 | Generate SQLC + implementasi `postgres.go` / `redis.go` | `server/internal/modules/auth/internal/repository/` | `[ ]` | |

### 1.5 Auth HTTP Handler — ✅ STEP C–D SELESAI (sisa hotfix envelope `Register` & cookie)
| # | Task | File | Status | Notes |
|---|------|------|--------|-------|
| 1.5.1 | Split route `public` (7) + `protected` (3 + `JWTMiddleWare`) = 10 route | `server/internal/modules/auth/module.go` | `[x]` | PR #24 (`02038bf`) |
| 1.5.2 | Single-source logging (`logAuthError`, `isExpectedAuthError`, `mapError` murni) | `server/internal/modules/auth/internal/delivery/http/handler.go` | `[x]` | Step D (`6cecb01`) |
| 1.5.3 | `Register` envelope konsisten (`{"status":"success","data":...}`) | Same file | 🔴 | Saat ini return flat → `AuthFormCard.tsx:119` gagal simpan token (**Hotfix #1**) |
| 1.5.4 | `RefreshToken` & `Login`/`Register` HttpOnly cookie | Same file | 🟡 | Saat ini `RefreshToken` hanya baca body JSON; `Login`/`Register` belum `SetCookie` |
| 1.5.5 | `Logout`, `ForgotPassword`, `VerifyEmail`, `ResendVerification`, `ResetPassword`, `ChangePassword`, `DeleteAccount` | Same file | `[x]` | Sudah pakai `currentUserID()`, `maskToken()`, `SanitizeArgs` (`6cecb01`) |

### 1.6 RabbitMQ Publisher & Topology (Step F) — ❌ BELUM DIMULAI (Prioritas #3)
> ⚠️ Folder `server/internal/platform/messaging/` belum dibuat. Container RabbitMQ jalan, kode belum.

| # | Task | File | Status | Notes |
|---|------|------|--------|-------|
| 1.6.1 | Buat interface `Publisher` | `server/internal/platform/messaging/publisher.go` | `[ ]` | `Publish(ctx, exchange, routingKey, msg) error` |
| 1.6.2 | Buat `rabbitmq/publisher.go` implementasi | `server/internal/platform/messaging/rabbitmq/publisher.go` | `[ ]` | `amqp091-go`, confirm mode |
| 1.6.3 | Buat `rabbitmq/topology.go` — declare exchange/queue/binding idempotent | `server/internal/platform/messaging/rabbitmq/topology.go` | `[ ]` | `fluids.auth` topic exchange, durable queues |
| 1.6.4 | Buat `rabbitmq/connection.go` — connection manager dengan reconnect | `server/internal/platform/messaging/rabbitmq/connection.go` | `[ ]` | Backoff retry, health check |
| 1.6.5 | Register publisher di `auth/module.go` via Fx + sambungkan 2 `TODO(step-f)` & hapus `dev token` DEBUG | `server/internal/modules/auth/` | `[ ]` | Reset password, verifikasi email, `user.registered` |

### 1.7 Notification Consumer Skeleton (Step F) — ❌ BELUM DIMULAI (Prioritas #3)
| # | Task | File | Status | Notes |
|---|------|------|--------|-------|
| 1.7.1 | Buat interface `Consumer` + `rabbitmq/consumer.go` (auto-ack, retry 3x + DLQ) | `server/internal/platform/messaging/` | `[ ]` | |
| 1.7.2 | Buat `notification/internal/worker/welcome_email.go` + register di `notification/module.go` | `server/internal/modules/notification/` | `[ ]` | |
| 1.7.3 | Test end-to-end: register/forgot-password → queue RabbitMQ → log consumer | Terminal + RabbitMQ UI | `[ ]` | |

### 1.8 Auth Module Wiring & Test — ✅ STEP E SELESAI (PR #28)
| # | Task | File | Status | Notes |
|---|------|------|--------|-------|
| 1.8.1 | Migrasi `user` `0003` (`email_verified`, `deleted_at`) + `go build ./...` + `go vet ./...` | `server/` | `[x]` | Terverifikasi (`85f8f37`, PR #26–#28) |
| 1.8.2 | Uji manual end-to-end 10 skenario auth + cek log JSON | Terminal | `[x]` | Terverifikasi di `TASK_LOG.md` T-018 & T-020 |
| 1.8.3 | Unit test otomatis (35 test: `auth/service`, `platform/security`, `platform/logger`) | `server/` | `[x]` | `make test` PASS (`52b85db`, PR #28) |

### 1.9 🔴 Hotfix Keamanan & Kontrak — PRIORITAS #1 (SEKARANG)
| # | Task | File | Status | Notes |
|---|------|------|--------|-------|
| 1.9.1 | Ubah expiry JWT `24 * 1 * time.Hour` → `15 * time.Minute` + unit test JWT expiry | `server/internal/platform/security/jwt.go` | `[ ]` | Menyelaraskan dengan `auth/service.go:444` & ADR-007 |
| 1.9.2 | Tutup IDOR di `UpdatePostCaption` (cek `post.AuthorID != userID` → `403`) | `server/internal/modules/content/internal/delivery/http/handler.go` | `[ ]` | Samakan dengan cek kepemilikan di `DeletePost` |
| 1.9.3 | Amankan 8× `c.Get("user_id").(string)` di `content` dengan helper `currentUserID()` (`401`, bukan panic) | Same file | `[ ]` | Baris 32, 58, 106, 128, 159, 176, 193, 210 |
| 1.9.4 | Samakan response envelope `POST /api/v1/auth/register` (`{"status":"success","data":user}`) | `server/internal/modules/auth/internal/delivery/http/handler.go` | `[ ]` | Agar `AuthFormCard.tsx:119` (`data.data?.token`) menyimpan token |
| 1.9.5 | Perbaiki healthcheck MinIO: `curl` → `["CMD","mc","ready","local"]` | `deploy/podman/podman-compose.dev.yml` | `[ ]` | Hilangkan false alarm `(unhealthy)` |
| 1.9.6 | Verifikasi: `go build ./...`, `go test ./... -count=1`, `gofmt -l`, smoke test manual | Terminal | `[ ]` | Lalu commit per logical unit → push `dev-zacky` → PR ke `dev` |

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

## Current Sprint Focus — PRIORITAS REAL (Disahkan 24 Nov 2026)

> ✅ Auth Step A–E sudah selesai (PR #26–#28, 35 unit test PASS). Urutan prioritas aktif di bawah disahkan setelah audit kode 24 Nov 2026:

**Priority Order:**

1. 🔴 **1.9 Hotfix Keamanan & Kontrak (PR saat ini setelah PR docs):**
   - `jwt.go`: expiry JWT `24h` → `15m` + unit test
   - `content/handler.go`: tutup IDOR `UpdatePostCaption` + amankan 8× `c.Get("user_id")` dengan `, ok`
   - `auth/handler.go`: samakan envelope `Register` (`{"status":"success","data":...}`) agar `AuthFormCard.tsx` menyimpan token
   - `podman-compose.dev.yml`: perbaiki healthcheck MinIO (`["CMD","mc","ready","local"]`)
2. 🟡 **2.1 User Profile Endpoints + MinIO (`platform/storage/`):**
   - `GET /api/v1/users/:username`, `PATCH /api/v1/users/me` (selaraskan dengan `App.tsx`), `POST /api/v1/users/me/avatar`
   - Rapikan logging `user/handler.go` sesuai `AGENTS.md` §5b + unit test `user/service`
3. 🟡 **1.6–1.7 Step F — RabbitMQ (`platform/messaging/`) + Email Worker:**
   - Sambungkan 2 `TODO(step-f)` di `auth/service.go` + welcome email `user.registered` + hapus log `dev token` DEBUG
4. ⚪ **8.3.1 OpenAPI Sync (`shared/openapi/openapi.yaml`)** → siap generate TS client & integrasi Web penuh
5. ⚪ **Hardening lanjut (bertahap):** `UserIDMiddleware` + logging §5b di modul lain, `access_blacklist` JWT `jti`, HttpOnly cookie refresh token, `content` likes/comments table, `social` → `user/contracts`, `1.4 Auth Repository` (opsional)

> **Aturan:** 1 concern = 1 PR (`dev-zacky → dev`). Pemilik yang mengetik & menjalankan kode/terminal; setelah direview & fixed, AI langsung meng-update `.md`.

---

*Last updated: 2026-11-24 — Update this file setiap task selesai. **`[x]` hanya kalau sudah diverifikasi ke kode.***
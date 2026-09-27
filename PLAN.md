# FLUIDS — Technical Plan & Architecture Decision Record

> **Source of truth** untuk arsitektur, stack, roadmap, dan konvensi project.
> Update file ini setiap keputusan arsitektur baru (ADR style).
> Last updated: 2026-09-27

---

## 1. Vision & Scope

**FLUIDS** = Social media platform untuk developer (Instagram-like tapi code-first).
- **Monorepo polyglot**: Go backend, React web, Flutter mobile, Python ML.
- **Target**: Production-ready, scalable, showcase-worthy untuk portfolio & hiring.

---

## 2. Architecture Style

| Layer | Decision | Rationale |
|-------|----------|-----------|
| **Backend** | Modular Monolith (Go + Uber Fx) | Isolasi modul via `contracts/`, nanti pecah microservice tanpa rewrite |
| **API Public** | **REST (JSON)** untuk Web & Mobile | Simpel, cacheable, single surface. GraphQL gateway *opsional* nanti |
| **API Internal** | **gRPC (protobuf-first)** untuk `reco`, `chat`, `notification` | High-throughput, streaming, type-safe cross-lang (Go ↔ Python ↔ Dart) |
| **Real-time** | **WebSocket** (`stories`, `notification`), **gRPC streaming** (`chat`) | Bedakan concern: broadcast vs bi-di flow-control |
| **Async/Event** | **RabbitMQ** (task queue) + **Kafka** (event log/analytics) | Right tool per use case |
| **Multi-client** | Shared OpenAPI spec (`shared/openapi/`) + Protobuf (`shared/proto/`) | Generate TS (Web) & Dart (Mobile) SDK otomatis |

---

## 3. Repository Structure (Root)

```
Fluids/
├── PLAN.md                          ← THIS FILE
├── AGENTS.md                        ← Konteks untuk AI agent
├── ARCHITECTURE_DOCUMENTATION.md    ← Aspirational docs (sync dengan PLAN.md)
├── GEMINI.md                        ← Pointer ke design-tokens
├── Makefile                         ← Entry point dev (pakai podman-compose)
├── .agents/rules/design-tokens.md   ← SOURCE OF TRUTH UI styling
├── deploy/
│   └── podman/
│       ├── podman-compose.dev.yml   ← 5 services: postgres, redis, rabbitmq, kafka, minio
│       ├── .env                     ← Gitignored, copy dari .env.example
│       └── postgres/init/01_extensions.sql
├── server/                          ← Go Backend (modular monolith)
│   ├── cmd/api/main.go              ← Fx app entry, register 6 modul
│   ├── internal/
│   │   ├── modules/                 ← 6 modul bisnis + modul baru
│   │   │   ├── auth/
│   │   │   ├── user/
│   │   │   ├── content/
│   │   │   ├── social/
│   │   │   ├── notification/
│   │   │   ├── reco/
│   │   │   ├── stories/      (baru)
│   │   │   ├── chat/         (baru)
│   │   │   └── settings/     (baru)
│   │       └── platform/                ← Shared kernel
│   │       ├── database/
│   │       ├── redisx/
│   │       ├── security/
│   │       ├── validator/
│   │       ├── logger/           (baru)  ← Structured logging (slog)
│   │       ├── graphql/      (baru)  ← GraphQL gateway
│   │       ├── ws/           (baru)  ← Generic WS hub
│   │       └── messaging/    (baru)  ← Publisher/Consumer abstraction
│   ├── sqlc.yaml
│   └── scripts/migrate.sh
├── web/                             ← React 18 + TS + Vite + Tailwind (pnpm@9)
│   ├── apps/web/                    ← Package @fluids/web
│   └── package.json
├── mobile/                          ← Flutter (belum ada, nanti)
├── ml/                              ← Python Two-Tower (FastAPI + PyTorch)
│   ├── pyproject.toml
│   └── uv.lock
├── shared/
│   ├── openapi/                     ← OpenAPI 3.1 spec per modul
│   │   ├── auth.yaml
│   │   ├── user.yaml
│   │   └── ...
│   └── proto/                       ← Protobuf-first (buf managed)
│       ├── buf.yaml
│       ├── buf.lock
│       ├── reco/v1/reco.proto
│       ├── chat/v1/chat.proto
│       └── notification/v1/notification.proto
└── .workbuddy-ai/                   ← Jangan hapus (catatan kerja)
```

---

## 4. Modul Backend — Current & Planned

| Modul | Status | Prefix | Contracts | gRPC | WS | Event Producer | Event Consumer |
|-------|--------|--------|-----------|------|----|----------------|----------------|
| `auth` | ✅ Done | `/api/v1/auth` | ❌ (belum di-consume) | ❌ | ❌ | `user.registered`, `user.logged_in` | — |
| `user` | ✅ Done | `/api/v1/users` | ✅ `user_contract.go` | ❌ | ❌ | `profile.updated` | `user.registered` → init embedding |
| `content` | ✅ Done | `/api/v1/content` | ✅ `content_contract.go` | ❌ | ❌ | `post.created`, `post.deleted` | — |
| `social` | ✅ Done | `/api/v1/social` | ✅ `social_contract.go` | ❌ | ❌ | `user.followed`, `post.bookmarked` | `post.created` → fan-out feed |
| `notification` | ✅ Done | `/api/v1/notifications` | ✅ `notification_contract.go` | 🔜 | 🔜 | `notification.created` | `user.followed`, `post.liked`, `comment.created` |
| `reco` | ✅ Done | `/api/v1/reco` | ❌ (belum di-consume) | 🔜 | ❌ | `embedding.updated` | `post.created` → index, `user.action` → retrain |
| `stories` | 📋 Planned | `/api/v1/stories` | ✅ (buat saat implement) | ❌ | ✅ | `story.created`, `story.viewed` | — |
| `chat` | 📋 Planned | `/api/v1/chat` | ✅ (buat saat implement) | ✅ | ❌ (gRPC streaming) | `message.sent`, `conversation.created` | — |
| `settings` | 📋 Planned | `/api/v1/settings` | ✅ (buat saat implement) | ❌ | ❌ | `settings.changed` | — |
| `moderation` | 📋 Planned | `/api/v1/admin` | ✅ (buat saat implement) | ❌ | ❌ | `report.created`, `content.hidden` | — |

> **Rule**: Modul baru **wajib** punya `contracts/{errors.go, <modul>_contract.go}` sebelum implementation.

---

## 5. API Design Standards

### REST (Current & Primary)
- **Versioning**: `/api/v1/` di URL (jangan ubah). Breaking → `/api/v2/`.
- **Auth**: JWT Access (15m) + Refresh Token (24h, opaque, Redis + HttpOnly cookie).
- **Validation**: `go-playground/validator` tags → pesan Bahasa Indonesia via `internal/platform/validator`.
- **Error**: Sentinel error di `contracts/errors.go` → map ke HTTP status di handler (`handle<Modul>Error`).
- **Pagination**: Cursor-based (`?cursor=&limit=20`) untuk feed, offset untuk admin.

### GraphQL Gateway (Planned — Web Only)
- **Tool**: `gqlgen` (code-first dari struct existing).
- **Location**: `server/internal/platform/graphql/`.
- **Schema**: Stitch dari `contracts/` DTO — **modul tidak tahu GraphQL**.
- **N+1**: **Wajib** `DataLoader` (batch + cache per request).
- **Auth**: Reuse `security.JWTMiddleWare`.
- **Endpoint**: `POST /graphql` + Playground (dev only).
- **Mobile**: Tetap pakai REST.

### gRPC Internal (Planned)
- **Protobuf-first** di `shared/proto/` (buf managed).
- **Versioning**: Package `fluids.<modul>.v1`, `v2`...
- **Breaking check**: `buf breaking --against '.git#branch=main'` di CI.
- **Generate**: `buf generate` → Go, Dart, TS (Python ML).
- **Interceptors**: Auth (validate JWT), Logging, Metrics, Tracing.
- **Error**: `google.rpc.Status` + `grpc.Status`.

### WebSocket (Planned)
- **Hub**: Generic di `internal/platform/ws/hub.go` (rooms, broadcast, presence).
- **Auth**: Handshake `GET /ws?token=<access>` → validate JWT → set `userID` di context.
- **Codec**: JSON (default), Protobuf (optional per modul).
- **Modul register**: `ws.Register("stories", handler)`, `ws.Register("notification", handler)`.
- **Scaling**: Local in-memory dulu → Redis Pub/Sub nanti (horizontal).

---

## 6.1. Logging Standards (Structured Logging)

### Library: `slog` (stdlib Go 1.21+)
- **Zero dependency**, native OpenTelemetry integration, future-proof.
- **Output**: JSON structured log ke stdout → Loki/Grafana (prod), `jq` (local).
- **Levels**: DEBUG (dev only), INFO (business events), WARN (recoverable), ERROR (failures), FATAL (startup crash).

### Wajib Ada di Setiap Log Entry
```go
slog.Info("event",
    "timestamp", time.Now().UTC().Format(time.RFC3339Nano), // auto via slog
    "service", "fluids-api",
    "version", "1.2.3",              // build info (ldflags)
    "environment", "production",     // dev/staging/prod
    "trace_id", "abc-123",           // Wajib - correlation (OTel)
    "span_id", "def-456",            // Wajib - distributed tracing
    "user_id", "usr-789",            // Kalau authenticated
    "request_id", "req-xyz",         // HTTP request ID
    // business fields...
)
```

### Implementation Location
```
server/internal/platform/logger/
├── logger.go          ← Init, levels, context extraction (trace_id/span_id)
├── handler.go         ← Custom JSON handler (rename level→severity, add source)
└── context.go         ← Helper: FromContext(ctx), WithUserID, WithRequestID
```

### Usage Pattern
```go
// Handler
func (h *AuthHandler) Register(c echo.Context) error {
    ctx := c.Request().Context()
    logger.InfoCtx(ctx, "register attempt", "email", req.Email)
    // ...
    logger.InfoCtx(ctx, "user registered", "user_id", user.ID)
}

// Service
func (s *authService) Register(ctx context.Context, req RegisterReq) (*UserDTO, error) {
    logger.InfoCtx(ctx, "hashing password")
    // ...
}
```

### Integration Points
| Layer | Integration |
|-------|-------------|
| `main.go` | `logger.Init()` di startup, set `slog.SetDefault()` |
| HTTP Middleware | Inject `request_id`, `trace_id` ke context |
| gRPC Interceptor | Propagate `trace_id`/`span_id` via metadata |
| WebSocket Hub | Attach `user_id` ke connection context |
| RabbitMQ/Kafka | Inject `trace_id` ke message headers |

---

## 6. Async & Event Architecture

### RabbitMQ — Task Queue (Command/Action)
| Exchange | Queue | Routing Key | Producer | Consumer | Retry/DLQ |
|----------|-------|-------------|----------|----------|-----------|
| `fluids.auth` | `welcome_email` | `user.registered` | `auth` | `notification` (email worker) | 3x + DLQ |
| `fluids.content` | `feed_fanout` | `post.created` | `content` | `social` (feed), `notification` (push), `reco` (index) | 3x + DLQ |
| `fluids.social` | `notif_dispatch` | `user.followed`, `post.liked` | `social` | `notification` | 3x + DLQ |

- **Topology**: Declared idempotent di `internal/platform/messaging/rabbitmq/topology.go`.
- **Publisher**: Interface `Publish(ctx, topic, key, msg) error` — implementasi RabbitMQ.
- **Consumer**: `Subscribe(topic, handler)` — auto-ack setelah handler sukses.

### Kafka — Event Log / Analytics / ML (Event Sourcing)
| Topic | Partitions | Retention | Producer | Consumer | Use Case |
|-------|------------|-----------|----------|----------|----------|
| `user.actions` | 12 | 30 days | All modules | `ml/` (training), `analytics` | Like, follow, view, share, click |
| `embedding.updates` | 6 | 7 days | `reco` | `ml/` (Two-Tower retrain) | Vector recompute trigger |
| `audit.log` | 6 | 90 days | All modules | `moderation`, `compliance` | Admin action, security events |

- **Schema**: JSON Schema / Protobuf di `shared/events/` — contract testing wajib.
- **Consumer Group**: Per service (`ml-trainer`, `analytics-etl`, `moderation-watcher`).

---

## 7. Multi-Client Strategy

| Client | Protocol | SDK Generation | Auth Flow |
|--------|----------|----------------|-----------|
| **Web (React)** | REST + GraphQL (optional) | `openapi-typescript` → TS types + fetch wrapper | HttpOnly cookie (refresh) + memory (access) |
| **Mobile (Flutter)** | REST | `openapi-generator` → Dart client | `flutter_secure_storage` (refresh) + Bearer header (access) |
| **Internal (Go/Python)** | gRPC | `buf generate` → Go/Python stub | mTLS (prod), insecure (dev) |

### Shared Contracts
```
shared/openapi/          ← OpenAPI 3.1 (REST)
  ├── auth.yaml
  ├── user.yaml
  ├── content.yaml
  └── ...

shared/proto/            ← Protobuf (gRPC)
  ├── buf.yaml
  ├── reco/v1/reco.proto
  ├── chat/v1/chat.proto
  └── notification/v1/notification.proto

shared/events/           ← Event schemas (JSON/Protobuf)
  ├── user/v1/user_registered.json
  ├── content/v1/post_created.json
  └── social/v1/user_followed.json
```

---

## 8. Infrastructure (Local → Prod)

### Local (Podman)
| Service | Image | Host Port | Notes |
|---------|-------|-----------|-------|
| PostgreSQL + pgvector | `pgvector/pgvector:pg16` | **5436** → 5432 | Port 5432 dipakai project lain |
| Redis | `redis:7-alpine` | 6379 | Cache, session, refresh token |
| RabbitMQ | `rabbitmq:3-management-alpine` | 5672 / 15672 | Task queue |
| Kafka | `apache/kafka:latest` | 9092 | Event log |
| MinIO | `quay.io/minio/minio:latest` | 9000 / 9001 | Object storage (avatar, media) |

- **Env**: `deploy/podman/.env` (gitignored) ← copy dari `.env.example`.
- **Migrate**: `bash server/scripts/migrate.sh up` (per-modul, idempotent).
- **Run**: `air` (backend), `npx -y pnpm@9.0.0 dev` (web).

### Production (Target)
- **Orchestration**: Kubernetes (EKS/GKE) — Helm charts per modul.
- **Database**: Managed PG (Cloud SQL / RDS) + pgvector extension.
- **Cache**: Managed Redis (ElastiCache / Memorystore).
- **Messaging**: Managed Kafka (MSK / Confluent) + RabbitMQ (CloudAMQP).
- **Object Storage**: S3 / GCS (MinIO compatible).
- **Observability**: OpenTelemetry → Prometheus + Grafana + Tempo + Loki.

---

## 9. Development Workflow (Branch & Commit)

```
main       ← Production (protected, PR only)
  ↑ PR
staging    ← Pre-prod QA (protected, PR only)
  ↑ PR
dev        ← Team integration (protected, PR only)
  ↑ PR
dev-zacky  ← Daily work branch (KAMU DI SINI)
```

**Rules:**
- Semua coding & testing di `dev-zacky`.
- Naik ke atas **hanya lewat PR** — tidak pernah push langsung.
- Commit message: Conventional Commits (`feat:`, `fix:`, `refactor:`, `docs:`, `test:`, `chore:`).
- Pre-commit: `gofmt` (file yang diubah), `golangci-lint`, `pnpm lint` (web).

---

## 10. Roadmap & Milestones (8 Weeks)

| Week | Phase | Focus | Deliverable |
|------|-------|-------|-------------|
| **1** | **Foundation** | Auth Phase 1 + RabbitMQ + Event `user.registered` | `refresh`, `logout`, `forgot-password`, `verify-email`, `callback/github` + publisher |
| **2** | **User Profile** | Profile lengkap + GraphQL Gateway skeleton + DataLoader | `GET /users/:username`, `PATCH /me`, `POST /me/avatar` + `/graphql` playground |
| **3** | **Protobuf & gRPC** | `shared/proto/` setup, `reco`, `chat`, `notification` proto + Buf CI | `buf generate` Go/Dart/TS, breaking check CI |
| **4** | **gRPC Server + WS Hub** | `reco` gRPC server stub, generic WS hub platform | `reco` gRPC impl, `ws.Register()` untuk stories/notification |
| **5** | **Stories + Kafka** | Stories modul (REST + WS live viewers), Kafka event log `user.actions` | `POST/GET /stories`, WS viewers, `user.actions` → Kafka |
| **6** | **Chat + Notification Real-time** | Chat gRPC streaming, Notification WS/SSE | `chat` streaming, `notification` real-time in-app |
| **7** | **ML Integration** | Python ML gRPC client, Reco Explore ranked | `reco` call ML service, `/explore` return personalized |
| **8** | **Hardening** | Tests, Observability, Docs, OpenAPI sync | `go test ./...`, `pnpm test`, OTel, OpenAPI spec updated |

> **Catatan**: Minggu 1–2 bisa dijalanin paralel kalau bandwidth cukup. Minggu 3+ butuh sequential (proto → server → client).

---

## 11. Immediate Next Steps (This Week)

**Fokus: Auth Phase 1 + RabbitMQ + Logging Foundation**

### Week 1 — Auth Phase 1 + RabbitMQ + slog Setup
1. **Logging Foundation** (`internal/platform/logger/`):
   - `logger.go` — Init, levels, custom JSON handler (severity, source)
   - `context.go` — `FromContext`, `WithUserID`, `WithRequestID` helpers
   - Integrate ke `main.go` — `logger.Init()` di startup
   - HTTP middleware inject `request_id` + `trace_id` ke context
2. **Extend `auth` contracts**:
   - `server/internal/modules/auth/contracts/errors.go` (tambah error baru)
   - `server/internal/modules/auth/contracts/auth_contract.go` (interface baru: `RefreshToken`, `RevokeToken`, `RequestPasswordReset`, `VerifyEmail`)
3. **Implement service**: `auth/internal/service/service.go` — logic refresh, logout, forgot-password, verify-email + **structured logging**.
4. **Repository**: `auth/internal/repository/postgres.go` + `queries/*.sql` (refresh token store, reset token store).
5. **Handler**: `auth/internal/delivery/http/handler.go` — endpoints baru + mapping error + **logging**.
6. **RabbitMQ Publisher**: `internal/platform/messaging/rabbitmq/publisher.go` + topology.
7. **Publish Event**: Di `Register` & `Login` → publish `user.registered`, `user.logged_in` + **logging**.
8. **Consumer Skeleton**: `notification` worker consume `user.registered` → send welcome email (log dulu).
9. **Register di `auth/module.go`**: Provide publisher, consumer, new routes.
10. **Test**: `curl` register → cek DB + RabbitMQ queue + log consumer + **verify JSON log output**.

---

## 12. ADR Log (Architecture Decision Records)

| ADR | Title | Date | Status |
|-----|-------|------|--------|
| 001 | Modular Monolith dengan `contracts/` sebagai single public surface | 2026-09-20 | ✅ Accepted |
| 002 | REST primary, GraphQL gateway optional untuk Web | 2026-09-27 | ✅ Accepted |
| 003 | gRPC internal (protobuf-first) untuk `reco`, `chat`, `notification` | 2026-09-27 | ✅ Accepted |
| 004 | WebSocket generic hub untuk `stories`, `notification`; gRPC streaming untuk `chat` | 2026-09-27 | ✅ Accepted |
| 005 | RabbitMQ untuk task queue, Kafka untuk event log/analytics | 2026-09-27 | ✅ Accepted |
| 006 | Shared OpenAPI + Protobuf untuk multi-client SDK generation | 2026-09-27 | ✅ Accepted |
| 007 | JWT Access (15m) + Refresh (24h, Redis + HttpOnly cookie) | 2026-09-27 | ✅ Accepted |
| 008 | Structured logging dengan `slog` (stdlib Go 1.21+) — JSON, trace_id/span_id, context propagation | 2026-09-27 | ✅ Accepted |

---

## 13. Learning Goals (Hiring-Focused)

| Skill | Project Evidence | Talking Point |
|-------|------------------|---------------|
| **Modular Monolith** | `server/internal/modules/*/contracts/` isolation | "Bisa pecah jadi microservice tanpa rewrite business logic" |
| **gRPC + Protobuf** | `shared/proto/`, `reco` gRPC server, Python ML client | "Protobuf-first, buf CI breaking detection, cross-lang generate" |
| **GraphQL** | `internal/platform/graphql/`, DataLoader, schema stitching | "N+1 solved, gateway pattern, reuse existing contracts" |
| **WebSocket** | `internal/platform/ws/`, stories live viewers | "Generic hub, room-based, Redis Pub/Sub ready" |
| **Event-Driven** | RabbitMQ topology, Kafka event log, contract testing | "Right broker per use case, idempotent topology, schema registry" |
| **Multi-Client** | OpenAPI → TS/Dart, Protobuf → Go/Dart/TS | "Single source of truth, type-safe end-to-end" |
| **Observability** | OpenTelemetry, **structured logging (slog)**, metrics | "Production-ready, structured JSON logs dengan trace_id correlation, Loki/Grafana ready" |

---

## 14. Guardrails (Jangan Dilanggar)

1. **Branch**: Hanya `dev-zacky` untuk coding. PR ke `dev` → `staging` → `main`.
2. **Contracts**: Modul lain **hanya** import `contracts/`. Tidak boleh import `internal/`.
3. **SQL**: Query di `repository/queries/*.sql` → `sqlc generate`. Jangan SQL di Go.
4. **Migration**: File baru di `internal/migrations/`. Jangan edit yang sudah jalan.
5. **Format**: `gofmt -w` **hanya file yang diubah**. Jangan `gofmt -w .`.
6. **Env**: `.env` tidak di-commit. Copy dari `.env.example`.
7. **Ports**: 5436 (PG), 3000 (Web), 8080 (API) — jangan ubah.
8. **MinIO**: Selalu `quay.io/minio/minio:latest` (bukan Docker Hub).
9. **Logging**: Wajib pakai `logger.InfoCtx/ErrorCtx` dari `internal/platform/logger`. **Dilarang** `fmt.Println`, `log.Printf`, `slog.Info` langsung di modul. Semua log lewat wrapper.
10. **Trace ID**: Setiap request HTTP/gRPC/WS **wajib** ada `trace_id` di log (inject via middleware/interceptor).

---

## 15. Open Questions (Resolve Before Implementation)

| # | Question | Options | Decision Target |
|---|----------|---------|-----------------|
| 1 | GraphQL gateway: embed di Echo atau service terpisah? | Embed / Separate | Week 2 |
| 2 | WebSocket scaling: Redis Pub/Sub vs managed (Pusher/Ably)? | Self-hosted / Managed | Week 5 |
| 3 | ML model serving: gRPC dari Go ke Python, atau REST? | gRPC / REST | Week 3 (proto decide) |
| 4 | Flutter mobile: monorepo `mobile/` atau repo terpisah? | Mono / Separate | Week 4 |
| 5 | CI/CD: GitHub Actions → Docker → K8s, atau PaaS (Fly/Render)? | K8s / PaaS | Week 8 |

---

*End of PLAN.md — Update this file for every architectural decision.*
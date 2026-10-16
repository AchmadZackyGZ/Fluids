# FLUIDS — Technical Plan & Architecture Decision Record

> **Source of truth** untuk arsitektur, stack, roadmap, dan konvensi project.
> Update file ini setiap keputusan arsitektur baru (ADR style).
> Last updated: 2026-10-15

> **Peran dokumen** (jangan tumpang tindih):
> - `PLAN.md` (**file ini**) → keputusan arsitektur + roadmap. Ini acuan arah jangka panjang.
> - `ARCHITECTURE_DOCUMENTATION.md` → referensi teknis detail arsitektur **aktual**.
> - `AGENTS.md` → aturan kerja, konvensi, jebakan, status terkini.
> - `TODO.md` → status task per-minggu.

---

## 1. Vision & Scope

**FLUIDS** = Social media platform untuk developer (Instagram-like tapi code-first).
- **Monorepo polyglot**: Go backend, React web, Flutter mobile, Python ML.
- **Target**: Production-ready, scalable, showcase-worthy untuk portfolio & hiring.

### Recommendation System (dikerjakan TERAKHIR di `/ml`)
Sesuai keputusan pemilik project:
- **Two-Tower Neural Network** (user tower + item tower).
- **TF-IDF + Cosine Similarity** sebagai baseline / fitur tambahan.
- **Item embedding + user embedding** → pencocokan lewat **Dot Product / Cosine Similarity**.
- **Interaksi user** (like, follow, view, share) → sinyal training.
- **Urutan pengerjaan**: setelah backend + web + mobile selesai. Jangan mulai lebih awal.

---

## 2. Architecture Style

| Layer | Decision | Rationale |
|-------|----------|-----------|
| **Backend** | Modular Monolith (Go + Uber Fx) | Isolasi modul via `contracts/`, nanti pecah microservice tanpa rewrite |
| **API Public** | **REST (JSON)** untuk Web & Mobile | Simpel, cacheable, single surface. Lihat ADR-002 |
| **API Web** | **GraphQL** (single query endpoint) — **Web saja, BUKAN mobile** | Web butuh fleksibel shape + 1 round-trip. Mobile tetap REST (lihat ADR-002) |
| **API Internal** | **gRPC (protobuf-first)** untuk `reco`, `chat`, `notification` | High-throughput, streaming, type-safe cross-lang (Go ↔ Python ↔ Dart) |
| **Real-time** | **WebSocket** (`stories`, `notification`), **gRPC streaming** (`chat`) | Bedakan concern: broadcast vs bi-di flow-control |
| **Outbound Integration** | **Webhook** (keluar) — notifikasi event ke sistem eksternal | Untuk integrasi pihak ketiga (CI/CD, bot, dsb). Lihat ADR-009 |
| **Async/Event** | **RabbitMQ** (task queue) + **Kafka** (event log/analytics) | Right tool per use case |
| **Multi-client** | Shared OpenAPI spec (`shared/openapi/`) + Protobuf (`shared/proto/`) | Generate TS (Web) & Dart (Mobile) SDK otomatis |
| **Observability** | OpenTelemetry → Grafana Alloy → Loki + Tempo + Prometheus | Lihat ADR-008 & ADR-010 |

> ⚠️ **Status realitas (15 Okt 2026):** yang **sudah jalan** = REST + modular monolith + Postgres + Redis + `slog`.
> Sisanya (GraphQL, gRPC, WS, Webhook, RabbitMQ, Kafka, OTel) = **rencana**, belum ada kodenya.
> Lihat `AGENTS.md` bagian 8b untuk daftar lubang terkonfirmasi.

---

## 3. Repository Structure (Root)

> ✅ = sudah ada &nbsp;|&nbsp; 🔜 = direncanakan, **belum ada di repo**

```
Fluids/
├── PLAN.md                          ← THIS FILE
├── AGENTS.md                        ← Konteks + aturan kerja untuk AI agent
├── ARCHITECTURE_DOCUMENTATION.md    ← Referensi teknis arsitektur aktual
├── TODO.md                          ← Status task per-minggu
├── IDEA.md                          ← Ringkasan ide (1 paragraf)
├── GEMINI.md                        ← Pointer ke design-tokens
├── Makefile                         ← Entry point dev (pakai podman-compose)
├── .agents/rules/design-tokens.md   ← SOURCE OF TRUTH UI styling (web sudah final)
├── deploy/
│   └── podman/
│       ├── podman-compose.dev.yml   ← 5 services: postgres, redis, rabbitmq, kafka, minio
│       ├── .env                     ← Gitignored, copy dari .env.example
│       └── ../postgres/init/01_extensions.sql
├── server/                          ← Go Backend (modular monolith)
│   ├── cmd/api/main.go              ← Fx app entry, register 6 modul
│   ├── internal/
│   │   ├── modules/                 ← 6 modul AKTIF saat ini
│   │   │   ├── auth/     ✅         ├── social/        ✅
│   │   │   ├── user/     ✅         ├── notification/  ✅
│   │   │   ├── content/  ✅         └── reco/          ✅
│   │   │   ├── stories/     🔜 (planned)
│   │   │   ├── chat/        🔜 (planned)
│   │   │   └── settings/    🔜 (planned)
│   │   └── platform/                ← Shared kernel
│   │       ├── database/    ✅
│   │       ├── redisx/      ✅
│   │       ├── security/    ✅
│   │       ├── validator/   ✅
│   │       ├── logger/      ✅  ← Structured logging (slog)
│   │       ├── graphql/     🔜  ← GraphQL gateway (Web only)
│   │       ├── grpc/        🔜  ← gRPC server/client
│   │       ├── ws/          🔜  ← Generic WS hub
│   │       ├── webhook/     🔜  ← Outbound webhook dispatcher
│   │       ├── messaging/   🔜  ← Publisher/Consumer (RabbitMQ + Kafka)
│   │       ├── storage/     🔜  ← MinIO object storage client
│   │       └── otel/        🔜  ← OpenTelemetry setup
│   ├── sqlc.yaml
│   └── scripts/migrate.sh
├── web/                             ← React 18 + TS + Vite + Tailwind (pnpm@9)
│   ├── apps/web/                    ← Package @fluids/web (~80% selesai)
│   └── package.json
├── mobile/                          ← 🔜 Flutter (belum ada, nanti)
├── ml/                              ← 🔜 Python Two-Tower (FastAPI + PyTorch)
│   ├── pyproject.toml               ✅ (ada, belum di-install)
│   └── uv.lock                      ✅
├── shared/
│   ├── openapi/                     ← ✅ ada (masih `openapi.yaml`, belum per-modul)
│   │   └── openapi.yaml
│   ├── proto/                       ← 🔜 Protobuf-first (buf managed) — BELUM ADA
│   │   ├── buf.yaml / buf.lock
│   │   ├── reco/v1/reco.proto
│   │   ├── chat/v1/chat.proto
│   │   └── notification/v1/notification.proto
│   └── events/                      ← 🔜 Event schemas (JSON/Protobuf) — BELUM ADA
└── .workbuddy-ai/                   ← Jangan hapus (catatan kerja, di-gitignore)
```

---

## 4. Modul Backend — Current & Planned

> ⚠️ Status di bawah **diverifikasi ke kode** (15 Okt 2026), bukan dari checklist.
> `✅ Done` = benar-benar jalan & terverifikasi. `🟡 Partial` = ada kode tapi masih stub.

| Modul | Status | Prefix | Contracts | gRPC | WS | Event Producer | Event Consumer |
|-------|--------|--------|-----------|------|----|----------------|----------------|
| `auth` | 🟡 Partial (5 stub) | `/api/v1/auth` | ✅ `auth_contract.go` | ❌ | ❌ | 🔜 `user.registered`, `user.logged_in` | — |
| `user` | ✅ Done (kontrak minim) | `/api/v1/users` | ✅ `user_contract.go` (3 method) | ❌ | ❌ | 🔜 `profile.updated` | 🔜 `user.registered` → init embedding |
| `content` | ✅ Done | `/api/v1/content` | ✅ `content_contract.go` | ❌ | ❌ | 🔜 `post.created`, `post.deleted` | — |
| `social` | ✅ Done | `/api/v1/social` | ✅ `social_contract.go` | ❌ | ❌ | 🔜 `user.followed`, `post.bookmarked` | 🔜 `post.created` → fan-out feed |
| `notification` | ✅ Done | `/api/v1/notifications` | ✅ `notification_contract.go` | 🔜 | 🔜 | 🔜 `notification.created` | 🔜 `user.followed`, `post.liked`, `comment.created` |
| `reco` | 🟡 Skeleton (no ML) | `/api/v1/reco` | ❌ (belum di-consume) | 🔜 | ❌ | 🔜 `embedding.updated` | 🔜 `post.created` → index, `user.action` → retrain |
| `stories` | 📋 Planned | `/api/v1/stories` | ✅ (buat saat implement) | ❌ | ✅ | 🔜 `story.created`, `story.viewed` | — |
| `chat` | 📋 Planned | `/api/v1/chat` | ✅ (buat saat implement) | ✅ | ❌ (gRPC streaming) | 🔜 `message.sent`, `conversation.created` | — |
| `settings` | 📋 Planned | `/api/v1/settings` | ✅ (buat saat implement) | ❌ | ❌ | 🔜 `settings.changed` | — |
| `moderation` | 📋 Planned | `/api/v1/admin` | ✅ (buat saat implement) | ❌ | ❌ | 🔜 `report.created`, `content.hidden` | — |

> **Rule**: Modul baru **wajib** punya `contracts/{errors.go, <modul>_contract.go}` sebelum implementation.
> Semua kolom gRPC/WS/Event = **rencana**, belum ada kode. `🔜` = belum diimplementasikan.

> 🔴 **Hutang teknis `auth` (prioritas #1 saat ini):**

> - 5 method stub: `VerifyEmail` (email tidak diupdate), `ResetPassword` & `ChangePassword` (**password tidak pernah berubah**), `DeleteAccount` (tidak soft-delete), publish event email
> - `auth/internal/repository/` & `auth/internal/migrations/` **belum ada** — persistensi 100% inline Redis
> - `userContract` cuma 3 method → akar masalah. Butuh `UpdatePassword`, `UpdateEmailVerified`, `DeleteAccount`
> - Skema `users` belum punya `email_verified` & `deleted_at`
> - `hashToken` = XOR manual (bukan SHA-256); `revokeAllUserTokens` = SCAN seluruh keyspace O(N)

---

## 5. API Design Standards

### REST (Current & Primary)
- **Versioning**: `/api/v1/` di URL (jangan ubah). Breaking → `/api/v2/`.
- **Auth**: JWT Access (15m) + Refresh Token (24h, opaque, Redis + HttpOnly cookie).
- **Validation**: `go-playground/validator` tags → pesan Bahasa Indonesia via `internal/platform/validator`.
- **Error**: Sentinel error di `contracts/errors.go` → map ke HTTP status di handler (`handle<Modul>Error`).
- **Pagination**: Cursor-based (`?cursor=&limit=20`) untuk feed, offset untuk admin.

### GraphQL Gateway (Planned — **Web Only, BUKAN Mobile**)
- **Tool**: `gqlgen` (code-first dari struct existing).
- **Location**: `server/internal/platform/graphql/`.
- **Schema**: Stitch dari `contracts/` DTO — **modul tidak tahu GraphQL**.
- **N+1**: **Wajib** `DataLoader` (batch + cache per request).
- **Auth**: Reuse `security.JWTMiddleWare`.
- **Endpoint**: `POST /graphql` (single query endpoint) + Playground (dev only).
- **Mobile**: **Tetap pakai REST.**

> ### ⚠️ KOREKSI PENTING — GraphQL *bukan* pilihan terbaik untuk mobile
>
> Asumsi umum "GraphQL lebih baik untuk mobile karena single endpoint & hemat request" itu
> **menyesatkan**. Alasannya:
>
> 1. **HTTP caching jadi tidak bisa dipakai.** REST dengan `GET /feed?cursor=x` bisa di-cache
>    di level HTTP/CDN/OkHttp. GraphQL selalu `POST /graphql` dengan body berbeda → cache
>    key tidak stabil → **semua request harus ke server**.
> 2. **Payload justru bisa membengkak.** GraphQL mengirim *tepat* yang diminta klien — tapi
>    developer mobile sering tidak tahu field mana yang dibutuhkan, jadi minta "segala hal",
>    dan hasilnya lebih berat dari REST yang sudah dirancang ramping.
> 3. **Offline-first mobile butuh endpoint predictable.** Aplikasi mobile butuh endpoint
>    stabil dengan ETag/`If-None-Match` untuk sinkronisasi offline. GraphQL menyulitkan ini.
> 4. **Bandwidth boros untuk operation kecil.** Setiap request membawa query string lengkap.
>
> **Kapan GraphQL masuk akal di mobile?** Kalau sudah pakai **persisted queries** +
> **APQ (Automatic Persisted Queries)** — query disimpan di hash, klien kirim hash saja.
> Itu pun menambah kompleksitas build & rilis.
>
> **Kesimpulan untuk FLUIDS:**
> - **Web** → GraphQL (layar besar, butuh banyak relasi sekaligus, 1 round-trip signifikan).
> - **Mobile** → **REST** (ramping, cacheable, predictable, offline-friendly).

### Webhook (Planned — Outbound)
- **Arah**: **keluar** (FLUIDS → sistem eksternal). Ini bukan inbound webhook dari GitHub dll.
- **Location**: `server/internal/platform/webhook/`.
- **Use case**: notifikasi event ke integrasi pihak ketiga — misal bot CI yang ingin tahu ada
  `post.created`, atau integrasi Slack/Discord saat `user.followed`.
- **Desain**:
  - Consumer **subscribe** ke topic Kafka/RabbitMQ (mis. `post.created`) → webhook dispatcher
    mengirim HTTP POST ke URL yang didaftarkan user.
  - **Signature**: HMAC-SHA256 di header `X-Fluids-Signature` → penerima bisa verifikasi
    bahwa request benar dari FLUIDS.
  - **Retry**: exponential backoff (mis. 5×, 1m → 2m → 4m → 8m → 16m) + DLQ.
  - **Idempotency**: header `X-Fluids-Delivery` (UUID) supaya penerima bisa dedup.
  - **Secret per-endpoint** disimpan terenkripsi; bisa di-rotate.
- **Kenapa via broker, bukan langsung?** Supaya endpoint eksternal yang lambat/down **tidak**
  memblokir request user. Ini alasan utama RabbitMQ/Kafka ada di arsitektur ini.

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

## 5b. Logging Standards (Structured Logging)

> ✅ **Status: IMPLEMENTED** (commit `4d00ade`). Bukan rencana lagi.

### Library: `slog` (stdlib Go 1.21+)
- **Zero dependency**, native OpenTelemetry integration, future-proof.
- **Output**: JSON structured log ke stdout → Loki/Grafana (prod), `jq` (local).
- **Levels**: DEBUG (dev only), INFO (business events), WARN (recoverable), ERROR (failures), FATAL (startup crash).
- **Rename keys** via `ReplaceAttr`: `level`→`severity`, `time`→`timestamp`, + tambah `source`.
- **Sanitasi**: `logger.SanitizeArgs()` menutup 15 field sensitif (password, token, dsb) agar tidak bocor ke log.

### Wajib Ada di Setiap Log Entry
```go
// Pola AKTUAL yang dipakai di repo (helper, bukan slog langsung):
logger.InfoCtx(ctx, "event name",
    "user_id", userID,          // kalau authenticated
    "email", req.Email,         // business field
    // trace_id/request_id otomatis diambil dari context oleh helper
)
```

> ⚠️ **Guardrail:** di dalam modul, **dilarang** `fmt.Println`, `log.Printf`, atau `slog.Info` langsung.
> Semua log **wajib** lewat wrapper: `logger.InfoCtx / WarnCtx / ErrorCtx`.

### Implementation Location (AKTUAL — 2 file, bukan 3)
```
server/internal/platform/logger/
├── logger.go          ← Init, JSON handler + ReplaceAttr (severity/timestamp/source),
│                        SanitizeArgs(), helper InfoCtx/WarnCtx/ErrorCtx, WithContext
└── middleware.go      ← RequestIDMiddleware, UserIDMiddleware, LoggingMiddleware
```

> 🔜 **Rencana**: pecah helper context ke `context.go` terpisah + tambah `WithTraceID`
> (setelah OpenTelemetry masuk). Sekarang masih digabung di `logger.go`.

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
| Layer | Integration | Status |
|-------|-------------|--------|
| `main.go` | `logger.Init()` di startup | ✅ done |
| HTTP Middleware | Inject `request_id` ke context | ✅ done (`request_id`; `trace_id` 🔜 via OTel) |
| gRPC Interceptor | Propagate `trace_id`/`span_id` via metadata | 🔜 planned |
| WebSocket Hub | Attach `user_id` ke connection context | 🔜 planned |
| RabbitMQ/Kafka | Inject `trace_id` ke message headers | 🔜 planned |

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
| **Web (React)** | **REST + GraphQL** | `openapi-typescript` → TS types + fetch wrapper; `gqlgen` → TS types untuk GraphQL | HttpOnly cookie (refresh) + memory (access) |
| **Mobile (Flutter)** | **REST saja** | `openapi-generator` → Dart client | `flutter_secure_storage` (refresh) + Bearer header (access) |
| **Internal (Go/Python)** | gRPC | `buf generate` → Go/Python stub | mTLS (prod), insecure (dev) |
| **Third-party** | **Webhook (outbound)** + REST | — | HMAC-SHA256 signature |

> **Alasan mobile tetap REST (bukan GraphQL):** lihat koreksi di bagian 5. Ringkasnya —
> mobile butuh endpoint ramping, cacheable (ETag), dan predictable untuk offline sync.
> GraphQL merusak HTTP caching dan justru bisa membengkakkan payload.

### Shared Contracts
```
shared/openapi/          ← OpenAPI 3.1 (REST)
  └── openapi.yaml       ← ✅ ada (belum dipecah per-modul)

shared/proto/            ← 🔜 Protobuf (gRPC) — BELUM ADA
  ├── buf.yaml
  ├── reco/v1/reco.proto
  ├── chat/v1/chat.proto
  └── notification/v1/notification.proto

shared/events/           ← 🔜 Event schemas (JSON/Protobuf) — BELUM ADA
  ├── user/v1/user_registered.json
  ├── content/v1/post_created.json
  └── social/v1/user_followed.json
```

---

## 8. Infrastructure (Local → Prod)

### Local (Podman)
| Service | Image | Host Port | Notes |
|---------|-------|-----------|-------|
| PostgreSQL + pgvector | `docker.io/pgvector/pgvector:pg16` | **5436** → 5432 | Port 5432 dipakai project lain |
| Redis | `docker.io/library/redis:7-alpine` | 6379 | Cache, session, refresh token |
| RabbitMQ | `docker.io/library/rabbitmq:3-management-alpine` | 5672 / 15672 | Task queue (🔜 belum dipakai kode) |
| Kafka | `docker.io/apache/kafka:latest` | 9092 | Event log (🔜 belum dipakai kode) |
| MinIO | `ghcr.io/coollabsio/minio:latest` | 9000 / 9001 | Object storage (avatar, media) |

> ⚠️ **MinIO image**: MinIO menghapus **semua** image publiknya (Docker Hub 404, quay.io private).
> Pakai **`ghcr.io/coollabsio/minio:latest`** (community mirror, build dari source resmi, no auth).
> Container name `fluids-minio`, volume `minio_data`, console `--console-address ":9001"`.

- **Env**: `deploy/podman/.env` (gitignored) ← copy dari `.env.example`.
- **Migrate**: `bash server/scripts/migrate.sh up` (per-modul, idempotent).
- **Run**: `air` (backend), `npx -y pnpm@9.0.0 dev` (web).

### Production (Target)
- **Orchestration**: Kubernetes (EKS/GKE) — Helm charts per modul.
- **Database**: Managed PG (Cloud SQL / RDS) + pgvector extension.
- **Cache**: Managed Redis (ElastiCache / Memorystore).
- **Messaging**: Managed Kafka (MSK / Confluent) + RabbitMQ (CloudAMQP).
- **Object Storage**: S3 / GCS (MinIO-compatible API).
- **Observability**: **OpenTelemetry → Grafana Alloy → Loki (logs) + Tempo (traces) + Prometheus (metrics) + Grafana Dashboard**.

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

## 10. Roadmap & Milestones

> ⚠️ **Estimasi minggu di bawah = target, bukan janji.** Realitas 15 Okt 2026: Week 1 **belum tuntas**
> (auth masih 5 stub). Lihat `TODO.md` → "Current Sprint Focus" untuk urutan prioritas yang benar.

| Week | Phase | Focus | Deliverable |
|------|-------|-------|-------------|
| **1** | **Foundation** | Auth Phase 1 (**selesaikan stub dulu**) + RabbitMQ + Event `user.registered` | Migrasi `email_verified`/`deleted_at`, extend `userContract`, refresh/logout/forgot/verify/reset **benar-benar jalan** + publisher |
| **2** | **User Profile** | Profile lengkap + GraphQL Gateway skeleton + DataLoader | `GET /users/:username`, `PATCH /me`, `POST /me/avatar` + `/graphql` playground |
| **3** | **Protobuf & gRPC** | `shared/proto/` setup, `reco`, `chat`, `notification` proto + Buf CI | `buf generate` Go/Dart/TS, breaking check CI |
| **4** | **gRPC Server + WS Hub** | `reco` gRPC server stub, generic WS hub platform | `reco` gRPC impl, `ws.Register()` untuk stories/notification |
| **5** | **Stories + Kafka** | Stories modul (REST + WS live viewers), Kafka event log `user.actions` | `POST/GET /stories`, WS viewers, `user.actions` → Kafka |
| **6** | **Chat + Notification Real-time** | Chat gRPC streaming, Notification WS/SSE | `chat` streaming, `notification` real-time in-app |
| **7** | **ML Integration** | Python ML gRPC client, Reco Explore ranked | `reco` call ML service, `/explore` return personalized |
| **8** | **Hardening** | Tests, Observability, Docs, OpenAPI sync | `go test ./...`, `pnpm test`, OTel, OpenAPI spec updated |
| **9+** | **Webhook + Mobile + Observability Prod** | Webhook outbound, Flutter mobile, Grafana stack penuh | Webhook dispatcher, app mobile, Alloy→Loki/Tempo/Prometheus dashboard |

> **Catatan**: Minggu 1–2 bisa dijalanin paralel kalau bandwidth cukup. Minggu 3+ butuh sequential (proto → server → client).

---

## 11. Immediate Next Steps (PRIORITAS 15 Okt 2026)

> 🔴 **Rantai akar masalah** — perbaiki **dari bawah ke atas**:
> ```
> skema users kurang kolom email_verified + deleted_at
>         ↓
> userContract cuma 3 method (tanpa UpdatePassword / UpdateEmailVerified / DeleteAccount)
>         ↓
> 5 method auth jadi stub (VerifyEmail, ResetPassword, ChangePassword, DeleteAccount, publish event)
> ```

### Urutan kerja yang benar (satu unit = satu commit + satu PR)

**Step A — Migrasi skema `users`** (modul `user`, file baru `0003`)
1. `server/internal/modules/user/internal/migrations/0003_add_email_verified_deleted_at.up.sql`
   → `ALTER TABLE users ADD COLUMN email_verified BOOLEAN NOT NULL DEFAULT FALSE;`
   → `ALTER TABLE users ADD COLUMN deleted_at TIMESTAMPTZ;`
2. File `.down.sql` → `ALTER TABLE users DROP COLUMN ...` (rollback)
3. Jalankan `bash server/scripts/migrate.sh up`, verifikasi kolom muncul

**Step B — Extend `userContract`**
1. `user/contracts/user_contract.go` → tambah 3 method ke `UserContract`:
   `UpdatePassword`, `UpdateEmailVerified`, `DeleteAccount`
2. Tambah DTO/Req yang dibutuhkan di file yang sama
3. `user/internal/repository/queries/users.sql` → query baru → `sqlc generate`
4. Implementasi di `user/internal/repository/postgres.go` + `user/internal/service/service.go`

**Step C — Sambungkan 5 stub auth service**
1. `VerifyEmail` → panggil `userContract.UpdateEmailVerified(ctx, userID)`
2. `ResetPassword` → panggil `userContract.UpdatePassword(ctx, userID, newHash)`
3. `ChangePassword` → idem
4. `DeleteAccount` → panggil `userContract.DeleteAccount(ctx, userID)`
5. Hapus **semua** `// TODO:` di `service.go` (baris 210, 238, 284, 317, 351, 383)

**Step D — Perbaikan keamanan & performa**
1. `hashToken` XOR manual → **SHA-256** (`crypto/sha256`)
2. `revokeAllUserTokens` SCAN seluruh keyspace → index per-user (Redis SET atau key prefix `refresh_token:user:<id>:*`)
3. Handler: `c.Get("user_id").(string)` → pakai cek `ok` agar **401 bukan panic**

**Step E — Verifikasi & test manual**
1. `go build ./...` → zero error
2. `curl` flow penuh: register → login → refresh → logout → forgot-password → verify-email → reset-password → change-password → delete-account
3. Cek Postgres: `password_hash` benar-benar berubah, `email_verified` = true, `deleted_at` terisi
4. Cek log JSON punya `trace_id`, `request_id`, `user_id`

**Step F (opsional, setelah A–E) — RabbitMQ + logging upgrade**
- `platform/messaging/` publisher/consumer + publish `user.registered`/`user.logged_in`
- Notification worker welcome email

> **Setiap step selesai** → pandu commit → push `dev-zacky` → PR ke `dev`. Format commit:
> `feat(user): ...`, `fix(auth): ...`, `perf(auth): ...`.

---

## 12. ADR Log (Architecture Decision Records)

| ADR | Title | Date | Status |
|-----|-------|------|--------|
| 001 | Modular Monolith dengan `contracts/` sebagai single public surface | 2026-09-20 | ✅ Accepted |
| 002 | **REST primary (Web + Mobile); GraphQL single endpoint untuk Web saja — BUKAN mobile** | 2026-10-15 | ✅ Accepted (direvisi) |
| 003 | gRPC internal (protobuf-first) untuk `reco`, `chat`, `notification` | 2026-09-27 | ✅ Accepted |
| 004 | WebSocket generic hub untuk `stories`, `notification`; gRPC streaming untuk `chat` | 2026-09-27 | ✅ Accepted |
| 005 | RabbitMQ untuk task queue, Kafka untuk event log/analytics | 2026-09-27 | ✅ Accepted |
| 006 | Shared OpenAPI + Protobuf untuk multi-client SDK generation | 2026-09-27 | ✅ Accepted |
| 007 | JWT Access (15m) + Refresh (24h, Redis + HttpOnly cookie) | 2026-09-27 | ✅ Accepted |
| 008 | Structured logging dengan `slog` (stdlib) — JSON, trace_id/span_id, context propagation | 2026-10-15 | ✅ **Implemented** (`4d00ade`) |
| 009 | **Webhook outbound** — dispatch via broker + HMAC-SHA256 signature + retry/backoff | 2026-10-15 | ✅ Accepted (planned) |
| 010 | **Observability stack**: OpenTelemetry → Grafana Alloy → Loki (logs) + Tempo (traces) + Prometheus (metrics) | 2026-10-15 | ✅ Accepted (planned) |
| 011 | **Object storage = MinIO** (`ghcr.io/coollabsio/minio:latest`) — kembali dari eksperimen SeaweedFS | 2026-10-15 | ✅ **Implemented** (`77011bb` + follow-up image fix) |
| 012 | **slog di-upgrade ke centralized logging** (ship JSON → Loki) setelah aplikasi selesai | 2026-10-15 | ✅ Accepted (planned) |

> **Catatan ADR-002:** versi lama menyebut "GraphQL gateway *opsional*". Direvisi karena
> pemilik project ingin GraphQL jelas posisinya: **Web-only**. Lihat koreksi di bagian 5.
> **Catatan ADR-011:** MinIO sempat diganti SeaweedFS (image Docker Hub-nya 404), lalu diputuskan
> kembali ke MinIO dengan registry `quay.io`.

---

## 13. Learning Goals (Hiring-Focused)

| Skill | Project Evidence | Talking Point |
|-------|------------------|---------------|
| **Modular Monolith** | `server/internal/modules/*/contracts/` isolation | "Bisa pecah jadi microservice tanpa rewrite business logic" |
| **gRPC + Protobuf** | `shared/proto/`, `reco` gRPC server, Python ML client | "Protobuf-first, buf CI breaking detection, cross-lang generate" |
| **GraphQL** | `internal/platform/graphql/`, DataLoader, schema stitching | "N+1 solved, gateway pattern, **Web-only** — mobile tetap REST karena caching & offline" |
| **WebSocket** | `internal/platform/ws/`, stories live viewers | "Generic hub, room-based, Redis Pub/Sub ready" |
| **Webhook** | `internal/platform/webhook/`, HMAC-SHA256, retry + DLQ | "Outbound delivery via broker, signature verification, idempotent" |
| **Event-Driven** | RabbitMQ topology, Kafka event log, contract testing | "Right broker per use case, idempotent topology, schema registry" |
| **Multi-Client** | OpenAPI → TS/Dart, Protobuf → Go/Dart/TS | "Single source of truth, type-safe end-to-end" |
| **Observability** | OpenTelemetry, structured logging (slog → centralized) | "trace_id correlation end-to-end, Alloy→Loki/Tempo/Prometheus, SLO dashboard" |
| **Recommendation System** | Two-Tower NN + TF-IDF + cosine similarity di `ml/` | "User/item embedding, dot-product matching, di-serve via gRPC dari Go" |

---

## 14. Guardrails (Jangan Dilanggar)

1. **Branch**: Hanya `dev-zacky` untuk coding. PR ke `dev` → `staging` → `main`.
2. **Contracts**: Modul lain **hanya** import `contracts/`. Tidak boleh import `internal/`.
3. **SQL**: Query di `repository/queries/*.sql` → `sqlc generate`. Jangan SQL di Go.
4. **Migration**: File baru di `internal/migrations/`. Jangan edit yang sudah jalan.
5. **Format**: `gofmt -w` **hanya file yang diubah**. Jangan `gofmt -w .`.
6. **Env**: `.env` tidak di-commit. Copy dari `.env.example`.
7. **Ports**: 5436 (PG), 3000 (Web), 8080 (API) — jangan ubah.
8. **MinIO**: Pakai `ghcr.io/coollabsio/minio:latest` — MinIO hapus semua image publik (Docker Hub 404, quay.io private).
9. **Logging**: Wajib pakai `logger.InfoCtx/ErrorCtx` dari `internal/platform/logger`. **Dilarang** `fmt.Println`, `log.Printf`, `slog.Info` langsung di modul. Semua log lewat wrapper.
10. **Trace ID**: Setiap request HTTP/gRPC/WS **wajib** ada `trace_id` di log (inject via middleware/interceptor). *(🔜 setelah OTel masuk; sekarang baru `request_id`.)*
11. **Git add**: **Jangan `git add .`** — selalu per-file. Pernah ada file pribadi nyaris ter-commit.
12. **Design `/web`**: Sudah **final**. `.agents/rules/design-tokens.md` untuk komponen **baru**, bukan alasan redesign halaman yang sudah jadi.
13. **Percaya kode, bukan checklist**: Verifikasi ke source sebelum menandai `[x]` (lihat `AGENTS.md` 8b).

---

## 15. Open Questions (Resolve Before Implementation)

| # | Question | Options | Decision Target |
|---|----------|---------|-----------------|
| 1 | GraphQL gateway: embed di Echo atau service terpisah? | Embed / Separate | Week 2 |
| 2 | WebSocket scaling: Redis Pub/Sub vs managed (Pusher/Ably)? | Self-hosted / Managed | Week 5 |
| 3 | ML model serving: gRPC dari Go ke Python, atau REST? | gRPC / REST | Week 3 (proto decide) |
| 4 | Flutter mobile: monorepo `mobile/` atau repo terpisah? | Mono / Separate | Week 4 |
| 5 | CI/CD: GitHub Actions → Docker → K8s, atau PaaS (Fly/Render)? | K8s / PaaS | Week 8 |
| 6 | **Webhook delivery**: lewat Kafka topic terpisah atau langsung dari dispatcher? | Kafka / Direct | Saat implement Webhook |
| 7 | **Grafana Alloy**: agent per-host atau central collector? | Agent / Central | Phase 2 (observability) |
| 8 | **Auth persistence**: tetap Redis inline, atau pindah ke Postgres (3 tabel `auth`)? | Redis / Postgres | Saat Step D |

---

*End of PLAN.md — Update this file for every architectural decision.*
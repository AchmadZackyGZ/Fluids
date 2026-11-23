# FLUIDS — Architecture Documentation

> **Dokumen referensi teknis.** Menjelaskan arsitektur FLUIDS yang **benar-benar diimplementasikan**.
>
> Pembagian peran dokumen (jangan dicampur):
> | File | Peran |
> |---|---|
> | `aturanFluidsAi.md` | Peran mentor, aturan keras, workflow dual-boot Windows ↔ Debian, prioritas terkini |
> | `PLAN.md` | Keputusan arsitektur + roadmap (ADR style) — **source of truth arsitektur** |
> | `ARCHITECTURE_DOCUMENTATION.md` | **File ini** — penjelasan teknis detail: alur data, kontrak, skema |
> | `AGENTS.md` | Aturan kerja, konvensi ngoding, logging §5b, jebakan, protokol PR §12b |
> | `TODO.md` | Status task & sprint focus (checklist, **ke depan**) |
> | `TASK_LOG.md` | Riwayat task yang **sudah selesai** + protokol review/commit |
> | `.agents/rules/design-tokens.md` | **Source of truth styling UI** — jangan diubah tanpa alasan kuat |
>
> ⚠️ **Riwayat:** dokumen ini sebelumnya berisi arsitektur *aspirational* yang salah
> (microservice terpisah di port 8081–8085, Traefik, GIN, Confluent Kafka + Zookeeper,
> Postgres 5432, folder `backend/`). Semua itu **tidak pernah** menjadi kenyataan.
> Versi ini menggantikannya dengan deskripsi sistem aktual.
> Terakhir diperbarui: 24 November 2026

---

## 1. Ringkasan Sistem

**FLUIDS** — platform sosial media untuk developer. Monorepo polyglot:

| Folder | Bahasa | Peran | Status |
|---|---|---|---|
| `server/` | Go 1.25 | Backend — **modular monolith** | ✅ Berjalan |
| `web/` | React 18 + TS | Frontend Web (SPA) | ✅ UI ~80% selesai, integrasi API sebagian |
| `mobile/` | Dart / Flutter | Aplikasi mobile | ⏸️ Belum ada |
| `ml/` | Python 3 | Rekomendasi Two-Tower | ⏸️ Belum disetup (hanya `pyproject.toml`) |
| `shared/` | — | Kontrak API (OpenAPI, nanti Protobuf) | 🟡 `openapi.yaml` ada, isi belum lengkap |
| `deploy/` | YAML | Podman compose + init SQL | ✅ Berjalan |

**Dua bahasa utama (polyglot):** Go untuk backend/API, Python untuk ML.
Dart (Flutter) menyusul di `mobile/`.

---

## 2. Arsitektur Backend — Modular Monolith

**Keputusan:** satu binary Go, dipecah jadi modul-modul terisolasi. Bukan microservice.

```
                        ┌─────────────────────────────┐
                        │      server/cmd/api         │
                        │   (main.go — Uber Fx)       │
                        └──────────────┬──────────────┘
                                       │
                    ┌──────────────────┴──────────────────┐
                    │        Echo HTTP Server :8080       │
                    │  middleware: RequestID → Logging    │
                    └──────────────────┬──────────────────┘
                                       │
     ┌──────────┬──────────┬───────────┼───────────┬──────────┬──────────┐
     │          │          │           │           │          │          │
 ┌───▼───┐ ┌────▼───┐ ┌────▼───┐ ┌─────▼────┐ ┌────▼────┐
 │ auth  │ │  user  │ │content │ │  social  │ │notific. │  reco
 └───┬───┘ └────┬───┘ └────┬───┘ └─────┬────┘ └────┬────┘   │
     │          │          │           │           │        │
     │      ┌───▼──────────▼───────────▼───────────▼────────▼───┐
     │      │        contracts/  (satu-satunya pintu)           │
     │      └───────────────────────┬───────────────────────────┘
     └───────────import contracts───┘
                                   │
          ┌────────────────────────┴────────────────────────┐
          │          internal/platform/  (shared kernel)    │
          │  database · redisx · security · validator ·     │
          │  logger                                         │
          └─────────────────────────────────────────────────┘
```

### 2.1 Aturan isolasi antar modul — INI YANG PALING PENTING

Modul **tidak boleh** meng-import `internal/` modul lain. Komunikasi **hanya** lewat `contracts/`.

Setiap `contracts/` berisi **tepat 2 file**:

| File | Isi |
|---|---|
| `errors.go` | Semua sentinel error modul, dalam satu blok `var (...)` |
| `<nama>_contract.go` | **Gabungan** DTO (domain) + `interface <Nama>Contract` |

**Alasan desain:** supaya modul bisa dipisah jadi microservice tanpa menulis ulang business logic.
Kalau `content` butuh data user, ia import `user/contracts` — bukan `user/internal/service`.

Contoh nyata yang sudah jalan: `auth` meng-consume `user/contracts`.
Binding lewat Fx di `user/module.go`:
```go
func ProvideUserContract(s service.UserService) contracts.UserContract { return s }
```

**Status `contracts/` per 24 Nov 2026:**

| Modul | contracts/ | Keterangan |
|---|---|---|
| `user` | ✅ | Dipakai `auth` (6 method: Create, GetByEmail, GetByID, UpdatePassword, UpdateEmailVerified, DeleteAccount) |
| `content` | ✅ | Belum di-consume |
| `social` | ✅ | Belum di-consume |
| `notification` | ✅ | Belum di-consume |
| `auth` | ✅ | Ada, tapi `auth/service.go` masih punya duplikasi sentinel `service.Err*` & belum di-provide sebagai `AuthContract` |
| `reco` | ❌ | Belum ada — belum di-consume modul lain |

### 2.2 Struktur satu modul

```
server/internal/modules/<nama>/
├── module.go                    ← fx.Options: Provide + Invoke(RegisterRoutes)
├── contracts/                   ← pintu keluar (2 file saja)
└── internal/
    ├── delivery/http/handler.go ← bind request, map error → HTTP status
    ├── service/service.go       ← business logic, struct Req + tag validate
    ├── repository/
    │   ├── postgres.go
    │   ├── queries/*.sql        ← query mentah untuk sqlc
    │   └── gen/                 ← ⚠️ HASIL GENERATE sqlc — jangan edit manual
    └── migrations/*.sql         ← golang-migrate, milik modul ini sendiri
```

**Layer wajib:** `delivery/http` → `service` → `repository`. Handler **tidak boleh** akses DB langsung.

---

## 3. API Surface

### 3.1 REST (aktual — satu-satunya yang jalan)

Prefix `/api/v1/`. Didaftarkan per modul di `module.go` masing-masing.

| Modul | Prefix | Endpoint | JWT |
|---|---|---|---|
| `auth` | `/api/v1/auth` | `POST /register`, `/login`, `/refresh` | publik |
| | | `POST /forgot-password`, `/verify-email`, `/resend-verification`, `/reset-password` | publik |
| | | `POST /logout`, `PATCH /change-password`, `DELETE /account` | protected |
| `user` | `/api/v1/users` | `GET /me` | protected |
| `content` | `/api/v1/content` | `GET /feed`, `POST /posts`, `GET /posts/:id`, `PATCH /posts/:id`, `DELETE /posts/:id`, `POST /posts/:id/like`, `DELETE /posts/:id/like`, `POST /posts/:id/comment`, `POST /posts/:id/share` | protected |
| `social` | `/api/v1/social` | follow/unfollow, followers/following, stats, bookmarks, GitHub link + activity | protected |
| `notification` | `/api/v1/notifications` | `GET ""`, `GET /unread-count`, `PATCH /read/:id`, `POST /read-all` | protected |
| `reco` | `/api/v1/reco` | `GET /explore` (belum ada model ML-nya) | publik |

Kesehatan: `GET /health` → `{"status":"UP"}` (tanpa prefix).

> ⚠️ **Pola penting:** route publik dan protected **dipisah ke dua `e.Group()` dengan prefix sama**.
> Echo menggabungkannya. Kalau semua digabung jadi satu group lalu `.Use(JWTMiddleWare)`,
> endpoint seperti `/login` akan menuntut token — itu bug yang pernah terjadi di modul `auth`.

### 3.2 GraphQL (rencana)

- **Untuk Web** — bukan Mobile.
- **Koreksi asumsi yang umum:** GraphQL **bukan** pilihan terbaik untuk mobile. Mobile butuh
  endpoint ramping & predictable untuk caching offline. GraphQL mengirim payload sesuai yang
  diminta klien, tapi klien mobile sering tidak tahu harus minta apa → payload justru membengkak,
  dan HTTP caching tidak bisa dimanfaatkan. GraphQL di mobile baru masuk akal dengan
  *persisted queries* + APQ.
- Lokasi: `server/internal/platform/graphql/`, tool `gqlgen`, wajib `DataLoader` (anti N+1).

### 3.3 gRPC (rencana)

- **Protobuf-first** di `shared/proto/` (buf managed).
- Dipakai untuk komunikasi internal: Go ↔ Python (`ml/`).
- Kandidat: `reco`, `chat` (streaming), `notification`.
- **Belum ada satu file pun.** `shared/proto/` belum dibuat.

### 3.4 WebSocket & Webhook (rencana)

- **WebSocket** — broadcast realtime: `stories` (penonton live), `notification` (in-app).
  Hub generik di `server/internal/platform/ws/`. Auth via `GET /ws?token=<access>`.
- **Webhook** — belum dirancang. Kandidat pemakaian: menerima event dari GitHub untuk sync
  aktivitas developer, atau mengirim event keluar ke pihak ketiga.
  **Belum ada keputusan desain — jangan dianggap sudah diputuskan.**

---

## 4. Event & Messaging

Dua broker, dua peran berbeda. Disengaja — bukan duplikasi.

| | RabbitMQ | Kafka |
|---|---|---|
| **Peran** | Task queue (command) | Event log / analytics |
| **Sifat** | Pesan dikonsumsi sekali lalu hilang | Disimpan, bisa dibaca ulang |
| **Pakai untuk** | kirim email, push notif, fan-out feed | training ML, audit log, analytics |
| **Port** | 5672 / 15672 | 9092 |

### RabbitMQ — exchange & queue yang direncanakan

| Exchange | Queue | Routing key | Producer | Consumer |
|---|---|---|---|---|
| `fluids.auth` | `welcome_email` | `user.registered` | `auth` | `notification` |
| `fluids.content` | `feed_fanout` | `post.created` | `content` | `social`, `notification`, `reco` |
| `fluids.social` | `notif_dispatch` | `user.followed`, `post.liked` | `social` | `notification` |

Retry 3x → DLQ. Topology di-declare idempotent di `platform/messaging/rabbitmq/topology.go`.

### Kafka — topic yang direncanakan

| Topic | Partisi | Retensi | Producer | Consumer |
|---|---|---|---|---|
| `user.actions` | 12 | 30 hari | semua modul | `ml/`, analytics |
| `embedding.updates` | 6 | 7 hari | `reco` | `ml/` |
| `audit.log` | 6 | 90 hari | semua modul | moderation |

### Status aktual

> 🔴 **Container RabbitMQ & Kafka sudah berjalan, tapi belum ada satu baris kode Go
> yang memakainya.** Folder `server/internal/platform/messaging/` belum dibuat.
> Saat ini backend hanya memakai PostgreSQL + Redis.

---

## 5. Data Layer

### 5.1 PostgreSQL 16 + pgvector

Port host **5436** (port 5432 dipakai project lain di mesin ini). Database `fluids_db`.

Extension otomatis (`deploy/postgres/init/01_extensions.sql`):
`uuid-ossp`, `vector`, `pgcrypto`, `pg_trgm`.

**Skema per modul** — tiap modul punya tabel tracking migrasinya sendiri
(`x-migrations-table=schema_migrations_<modul>`).
Urutan dependensi: user → content → social → notification → reco.

| Modul | Tabel | Catatan |
|---|---|---|
| `user` | `users` | ✅ Sudah punya `email_verified` & `deleted_at` (migrasi `0003`, PR #26) |
| `content` | `posts`, `post_media`, `post_code_snippets` | Belum ada tabel `likes` / `comments` (baru kolom counter) |
| `social` | `follows`, `bookmarks` | ⚠️ `social.sql` masih `UPDATE`/`SELECT` tabel `users` langsung |
| `notification` | `notifications` | |
| `reco` | `user_embeddings`, `item_embeddings` | vektor untuk Two-Tower |

Total: **9 tabel bisnis** + 5 tabel tracking `schema_migrations_*` (**14 tabel**), **11 file migrasi** di 5 modul (`auth` belum punya `repository/` & `migrations/`). Semua memakai `UUID` sebagai primary key
(bukan `BIGSERIAL` seperti di dokumen versi lama).

**Query:** ditulis manual di `repository/queries/*.sql`, lalu di-generate `sqlc`.
Konfigurasi per-modul ada di `server/sqlc.yaml`. **Jangan tulis SQL di dalam Go.**

### 5.2 Redis 7

Dipakai untuk (aktual):
- Refresh token (key `refresh_token:<sha256-hash>`, TTL 24 jam) + index per-user SET `user_refresh_tokens:<userID>` (TTL 24 jam, O(k) revoke)
- Reset password token (`password_reset:<sha256-hash>`, TTL 1 jam)
- Email verification token (`email_verification:<sha256-hash>`, TTL 24 jam)
- Rate limiting (`INCR` + `EXPIRE`, mis. forgot-password & resend-verification max 3/jam)
- Blacklist key (`access_blacklist:<hash>`, TTL 15 menit) — ⚠️ belum ditegakkan di `JWTMiddleWare`
- Cache GitHub heatmap (`social`, TTL 6 jam) & unread notification count (`notification`, TTL 2 menit)

Rencana tambahan: cache feed, counter realtime, Pub/Sub untuk WebSocket horizontal scaling.

### 5.3 MinIO (object storage)

- Image: `ghcr.io/coollabsio/minio:latest` — MinIO **menghapus semua image publik** (Docker Hub `minio/minio` 404, `quay.io/minio/minio` sekarang private → `unauthorized`). Pakai community mirror `coollabsio/minio` yang build dari source MinIO resmi.
- Port 9000 (API S3) / 9001 (console).
- Rencana pemakaian: avatar user, media post.
- 🔴 **Kode Go belum ada integrasi apa pun.** `platform/storage/` belum dibuat.

---

## 6. Logging & Observability

### 6.1 Yang sudah jalan — structured logging (`slog`)

Lokasi: `server/internal/platform/logger/`

| File | Isi |
|---|---|
| `logger.go` | `Init()`, JSON handler, `ReplaceAttr` (`level`→`severity`, `time`→`timestamp`, `source`), `SanitizeArgs` |
| `middleware.go` | `RequestIDMiddleware`, `LoggingMiddleware`, `UserIDMiddleware` |

Fitur penting:
- **`SanitizeArgs()`** — deny-list eksak + pencocokan **substring** (`isSensitiveKey`: `password`, `token`, `secret`, `api_key`, `apikey`, `credential`, `private_key`) otomatis menjadi `[REDACTED]` sebelum masuk log (termasuk `current_password`, `new_password`, `reset_token`).
- **Context propagation** — `WithContext(ctx)` menarik `trace_id`, `span_id`, `request_id`,
  `user_id` dari `context.Context`. Semua log lewat `DebugCtx`/`InfoCtx`/`WarnCtx`/`ErrorCtx` otomatis membawa korelasi ini.
- **Aturan ketat (`AGENTS.md` §5b):** error di-log sekali di handler, service tidak boleh log error yang di-`return`, 4xx = `WARN` bukan `ERROR`. ⚠️ *Catatan aktual (24 Nov 2026):* `UserIDMiddleware` belum di-mount di `main.go`, `LoggingMiddleware` menangkap `ctx` sebelum `next(c)`, dan 5 handler non-`auth` belum direfactor ke pola §5b.

**Aturan:** dilarang `fmt.Println` / `log.Printf` di modul. Semua lewat wrapper.

### 6.2 Rencana — centralised logging & tracing

Target akhir (dikerjakan setelah fitur selesai):

```
Go API (slog JSON) ──stdout───► Grafana Alloy ──► Grafana Loki ──► Grafana Dashboard
                                    (collector)      (log store)     (query by trace_id)
Go API (OTel SDK) ──OTLP──────► Alloy ─────────► Grafana Tempo ──► trace view
Go API (/metrics) ─────────────► Prometheus ─────────────────────► RED dashboard
```

| Komponen | Peran |
|---|---|
| **Grafana Alloy** | Collector/agent — menggantikan Promtail + OTel Collector |
| **Grafana Loki** | Penyimpanan log, query berbasis label (`trace_id`, `user_id`, `service`) |
| **Grafana Tempo** | Distributed tracing |
| **Prometheus** | Metrics (Rate, Errors, Duration) |
| **OpenTelemetry** | Instrumentasi — `trace_id` konsisten HTTP → gRPC → RabbitMQ |

Belum dikerjakan. `slog` + JSON sudah jadi fondasinya — tinggal dikirim ke Alloy.

---

## 7. Infrastruktur Lokal

Podman (bukan Docker — Docker tidak terpasang di mesin pengembangan).

Compose: `deploy/podman/podman-compose.dev.yml` — **5 container**
Env: `deploy/podman/.env` (gitignored, copy dari `.env.example`)

| Service | Image | Port host |
|---|---|---|
| postgres | `docker.io/pgvector/pgvector:pg16` | **5436** → 5432 |
| redis | `docker.io/library/redis:7-alpine` | 6379 |
| rabbitmq | `docker.io/library/rabbitmq:3-management-alpine` | 5672 / 15672 |
| kafka | `docker.io/apache/kafka:latest` | 9092 |
| minio | `ghcr.io/coollabsio/minio:latest` | 9000 / 9001 |

Aplikasi: Go API `:8080`, Web Vite `:3000` (proxy `/api` → `127.0.0.1:8080`).

**Catatan penting (Dual-Boot Windows & Debian 13):**
- **Windows/WSL:** Podman machine **wajib rootful + cgroupfs**. Rootless membuat `cgroupControllers: []`
  kosong → semua container gagal dengan `crun: controller pids is not available`.
- **Debian 13 (Linux):** Podman berjalan native **rootless**. `podman-compose` 1.3.0 punya bug path relatif → jalankan dari `deploy/podman/` atau pakai `-f "$PWD/deploy/podman/podman-compose.dev.yml"`.
- **MinIO healthcheck:** `podman-compose.dev.yml` masih memakai `curl` (tidak ada di image → tampil `unhealthy` false alarm); akan diganti `["CMD","mc","ready","local"]` di Hotfix #1.
- Kafka memakai mode **KRaft** (tanpa Zookeeper).

---

## 8. Alur Request (contoh: Login)

```
Client (Web :3000)
   │  POST /api/v1/auth/login   ← lewat proxy Vite
   ▼
Echo :8080
   │  RequestIDMiddleware   → generate request_id + trace_id, inject ke context
   │  LoggingMiddleware     → catat mulai + latency di akhir
   ▼
auth/delivery/http — AuthHandler.Login
   │  c.Bind(&req)
   │  logger.DebugCtx(ctx, "login attempt", "email", req.Email)
   ▼
auth/internal/service — authService.Login
   │  validator.Validate.Struct(req)
   │  userContract.GetUserByEmail()      ← LINTAS MODUL lewat contracts/ ✅
   │  security.CheckPasswordHash()
   ▼
user/internal/service → user/internal/repository → sqlc → PostgreSQL (WHERE deleted_at IS NULL)
   ▼
kembali ke authService
   │  issueTokens() → JWT HS256 (target 15m; masih 24h di jwt.go — masuk Hotfix)
   │                + refresh token (SHA-256, 24h) → Redis + SET user_refresh_tokens:<userID>
   ▼
handler → logger.InfoCtx("login success") → c.JSON(200, {"status":"success","data":res})
   │  LoggingMiddleware catat selesai + latency
   ▼
Client
```

Perhatikan: `auth` menyentuh `user` **hanya** lewat `user/contracts`.
Itu bukti isolasi modul berjalan.

---

## 9. Utang Teknis yang Terkonfirmasi (per 24 Nov 2026)

> ✅ Auth Step A–E (`email_verified`/`deleted_at`, `UserContract` 6 method, 5 stub auth, SHA-256 `HashToken`, Redis SET per-user index, 35 unit test) **sudah selesai** (PR #26–#28). Daftar di bawah adalah lubang aktual yang tersisa.

Diurutkan dari paling kritis:

| # | Masalah | Lokasi | Dampak |
|---|---|---|---|
| 1 | **IDOR pada `PATCH /api/v1/content/posts/:id`** — tidak cek `post.AuthorID != userID` | `content/internal/delivery/http/handler.go:95-123` | User mana pun bisa mengubah caption post orang lain (**Hotfix #1**) |
| 2 | **JWT expiry 24 jam (bukan 15 menit)** + blacklist `access_blacklist:` tidak ditegakkan di `JWTMiddleWare` | `platform/security/jwt.go:29`, `security/middleware.go` | Token tetap aktif 24 jam meski logout/ganti password/hapus akun (**Hotfix #1** untuk expiry 15m) |
| 3 | **8× type assertion `c.Get("user_id").(string)` tanpa `, ok`** di `content` + `reco` bocor `err.Error()` di HTTP 500 | `content/handler.go`, `reco/handler.go:38` | Berpotensi panic 500 & membocorkan error internal (**Hotfix #1** untuk `content`) |
| 4 | **Envelope `Register` flat** (`{token, user}`), tidak sama dengan `Login`/`Refresh` (`{"status":"success","data":...}`) | `auth/handler.go:131` vs `AuthFormCard.tsx:119` | Web frontend gagal menyimpan `fluids_token` saat register (**Hotfix #1**) |
| 5 | Endpoint profil user belum lengkap (`App.tsx` panggil `PUT /api/v1/users/profile` → 404) & `platform/storage/` belum ada | `user/module.go`, `web/.../App.tsx:115` | Edit profil & upload avatar MinIO belum jalan (**Prioritas #2**) |
| 6 | RabbitMQ/Kafka belum dipakai Go (`platform/messaging/` belum ada) + 2 `TODO(step-f)` & log `dev token` DEBUG | `auth/service.go:236-239, 317-320` | Email reset/verifikasi & welcome email belum terkirim (**Prioritas #3**) |
| 7 | `auth/internal/repository/` & `migrations/` belum ada; duplikasi `service.Err*` vs `auth/contracts/errors.go`; HttpOnly cookie belum diset di `Login`/`Register` | `auth/internal/service/service.go`, `auth/handler.go` | Utang arsitektur modul `auth` |
| 8 | Coupling SQL lintas modul (`social.sql:73` `UPDATE users`, `sqlc.yaml` share schema); `content` belum punya tabel `likes`/`comments`; N+1 di `ListFeed`/`GetFollowers` | `social.sql`, `content/service.go`, `social/service.go` | Menghambat pemecahan microservice & performa saat skala besar |
| 9 | `UserIDMiddleware` tidak terpasang, `LoggingMiddleware` ambil `ctx` sebelum `next(c)`, dan 5 handler non-`auth` belum ikut `AGENTS.md` §5b | `logger/middleware.go`, `{user,content,social,notification,reco}/handler.go` | Noise log `INFO` & `ERROR` palsu pada 4xx |
| 10 | `shared/openapi/openapi.yaml` baru 2 endpoint usang; `shared/proto/` belum ada; healthcheck MinIO masih `curl` | `shared/openapi/openapi.yaml`, `podman-compose.dev.yml:84` | Belum bisa generate SDK klien; false alarm `unhealthy` MinIO (**Hotfix #1**) |

> ⚠️ **Ingat:** selalu verifikasi ke kode sumber aktual sebelum menandai item selesai.

---

## 10. Referensi Silang

| Butuh | Baca |
|---|---|
| Keputusan arsitektur + alasan | `PLAN.md` bagian 2 & 12 (ADR) |
| Roadmap 8 minggu | `PLAN.md` bagian 10 |
| Aturan ngoding & jebakan | `AGENTS.md` bagian 5 & 10 |
| Cara menjalankan | `AGENTS.md` bagian 7 |
| Status task (ke depan) | `TODO.md` |
| Riwayat task selesai + protokol review | `TASK_LOG.md` |
| Styling UI | `.agents/rules/design-tokens.md` |

---

*End of ARCHITECTURE_DOCUMENTATION.md*

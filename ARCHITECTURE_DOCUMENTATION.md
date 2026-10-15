# FLUIDS — Architecture Documentation

> **Dokumen referensi teknis.** Menjelaskan arsitektur FLUIDS yang **benar-benar diimplementasikan**.
>
> Pembagian peran dokumen (jangan dicampur):
> | File | Peran |
> |---|---|
> | `PLAN.md` | Keputusan arsitektur + roadmap (ADR style) — **source of truth arsitektur** |
> | `ARCHITECTURE_DOCUMENTATION.md` | **File ini** — penjelasan teknis detail: alur data, kontrak, skema |
> | `AGENTS.md` | Aturan kerja, konvensi ngoding, jebakan yang sudah terkonfirmasi |
> | `TODO.md` | Status task per minggu (checklist) |
> | `.agents/rules/design-tokens.md` | **Source of truth styling UI** — jangan diubah tanpa alasan kuat |
>
> ⚠️ **Riwayat:** dokumen ini sebelumnya berisi arsitektur *aspirational* yang salah
> (microservice terpisah di port 8081–8085, Traefik, GIN, Confluent Kafka + Zookeeper,
> Postgres 5432, folder `backend/`). Semua itu **tidak pernah** menjadi kenyataan.
> Versi ini menggantikannya dengan deskripsi sistem aktual.
> Terakhir diperbarui: 15 Oktober 2026

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

**Status `contracts/` per 15 Okt 2026:**

| Modul | contracts/ | Keterangan |
|---|---|---|
| `user` | ✅ | Dipakai `auth` |
| `content` | ✅ | Belum di-consume |
| `social` | ✅ | Belum di-consume |
| `notification` | ✅ | Belum di-consume |
| `auth` | ✅ | Baru dibuat; belum di-consume |
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
| `user` | `users` | ⚠️ **belum punya** kolom `email_verified` & `deleted_at` |
| `content` | `posts`, `post_media`, `post_code_snippets` | |
| `social` | `follows`, `bookmarks` | |
| `notification` | `notifications` | |
| `reco` | `user_embeddings`, `item_embeddings` | vektor untuk Two-Tower |

Total: **9 tabel bisnis**, 8 migrasi. Semua memakai `UUID` sebagai primary key
(bukan `BIGSERIAL` seperti di dokumen versi lama).

**Query:** ditulis manual di `repository/queries/*.sql`, lalu di-generate `sqlc`.
Konfigurasi per-modul ada di `server/sqlc.yaml`. **Jangan tulis SQL di dalam Go.**

### 5.2 Redis 7

Dipakai untuk (aktual):
- Refresh token (key `refresh_token:<hash>`, TTL 24 jam)
- Reset password token (TTL 1 jam)
- Email verification token (TTL 24 jam)
- Rate limiting (`INCR` + `EXPIRE`, mis. forgot-password max 3/jam)
- Blacklist access token (TTL 15 menit)

Rencana tambahan: cache feed, counter realtime, Pub/Sub untuk WebSocket horizontal scaling.

### 5.3 MinIO (object storage)

- Image: `quay.io/minio/minio:latest` — **wajib `quay.io`**, image Docker Hub (`minio/minio`) dihapus (404).
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
- **`SanitizeArgs()`** — deny-list 15 field sensitif (`password`, `token`, `refresh_token`, dll)
  otomatis menjadi `[REDACTED]` sebelum masuk log. Mencegah kebocoran kredensial ke log.
- **Context propagation** — `WithContext(ctx)` menarik `trace_id`, `span_id`, `request_id`,
  `user_id` dari `context.Context`. Semua log lewat `InfoCtx`/`ErrorCtx` otomatis membawa
  korelasi ini.

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
| minio | `quay.io/minio/minio:latest` | 9000 / 9001 |

Aplikasi: Go API `:8080`, Web Vite `:3000` (proxy `/api` → `127.0.0.1:8080`).

**Catatan penting (Windows/WSL):**
- Podman machine **wajib rootful + cgroupfs**. Rootless membuat `cgroupControllers: []`
  kosong → semua container gagal dengan `crun: controller pids is not available`.
- Kafka di sini memakai mode **KRaft** (tanpa Zookeeper).

---

## 8. Alur Request (contoh: Login)

```
Client (Web :3000)
   │  POST /api/auth/login   ← lewat proxy Vite
   ▼
Echo :8080
   │  RequestIDMiddleware   → generate request_id + trace_id, inject ke context
   │  LoggingMiddleware     → catat mulai
   ▼
auth/delivery/http — AuthHandler.Login
   │  c.Bind(&req) → validator
   │  logger.InfoCtx(ctx, "login attempt", sanitized...)
   ▼
auth/internal/service — authService.Login
   │  userContract.GetUserByEmail()      ← LINTAS MODUL lewat contracts/ ✅
   │  security.CheckPasswordHash()
   ▼
user/internal/service → user/internal/repository → sqlc → PostgreSQL
   ▼
kembali ke authService
   │  issueTokens() → JWT access (15m) + refresh (24h) → Redis
   ▼
handler → c.JSON(200, {...})
   │  LoggingMiddleware catat selesai + latency
   ▼
Client
```

Perhatikan: `auth` menyentuh `user` **hanya** lewat `user/contracts`.
Itu bukti isolasi modul berjalan.

---

## 9. Utang Teknis yang Terkonfirmasi (per 15 Okt 2026)

Diurutkan dari paling kritis.

| # | Masalah | Dampak |
|---|---|---|
| 1 | 5 method auth masih stub: `VerifyEmail` (email tidak di-update), `ResetPassword` & `ChangePassword` (password **tidak pernah berubah**), `DeleteAccount` (tidak soft-delete) | Fitur keamanan akun tidak berfungsi |
| 2 | `userContract` hanya 3 method — belum ada `UpdatePassword`, `UpdateEmailVerified`, `DeleteAccount` | Akar masalah #1 |
| 3 | Tabel `users` belum punya `email_verified` & `deleted_at` | Akar masalah #1 |
| 4 | `hashToken()` pakai XOR manual, bukan SHA-256 | Lemah sebagai key derivation |
| 5 | `revokeAllUserTokens()` pakai `SCAN refresh_token:*` seluruh keyspace | O(N) tiap ganti/hapus password |
| 6 | `auth/internal/repository/` tidak ada — persistence 100% inline di service | Melanggar layer wajib; sulit dites |
| 7 | RabbitMQ/Kafka belum dipakai kode Go | Container jalan tanpa guna |
| 8 | `platform/storage/` belum ada | Avatar/media belum bisa diunggah |
| 9 | `shared/openapi/openapi.yaml` isinya belum lengkap | Tidak bisa generate SDK klien |
| 10 | `shared/proto/` belum ada | gRPC belum bisa mulai |
| 11 | Assertion `c.Get("user_id").(string)` tanpa `ok` di beberapa handler | Berpotensi panic bila middleware tidak men-set |

> ⚠️ **Ingat:** `TODO.md` dan `PLAN.md` bersifat aspirational. Banyak item `[x]` di sana
> ternyata stub. **Selalu verifikasi ke kode**, bukan ke checklist.

---

## 10. Referensi Silang

| Butuh | Baca |
|---|---|
| Keputusan arsitektur + alasan | `PLAN.md` bagian 2 & 12 (ADR) |
| Roadmap 8 minggu | `PLAN.md` bagian 10 |
| Aturan ngoding & jebakan | `AGENTS.md` bagian 5 & 10 |
| Cara menjalankan | `AGENTS.md` bagian 7 |
| Status task | `TODO.md` |
| Styling UI | `.agents/rules/design-tokens.md` |

---

*End of ARCHITECTURE_DOCUMENTATION.md*

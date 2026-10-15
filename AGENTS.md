# AGENTS.md — Konteks Project FLUIDS

> File ini dibaca otomatis oleh OpenCode. Isinya adalah konteks lengkap project:
> alur branch, stack, struktur folder, cara menjalankan, konvensi ngoding,
> dan **status pekerjaan terkini** supaya pekerjaan yang sudah selesai tidak diulang.

Terakhir diperbarui: 15 Oktober 2026

> 📌 **Dokumen lain & perannya** (supaya tidak tumpang tindih):
> - `PLAN.md` → keputusan arsitektur + roadmap (ADR style). Ini yang jadi acuan arah.
> - `ARCHITECTURE_DOCUMENTATION.md` → referensi teknis detail arsitektur **aktual**.
> - `TODO.md` → status task per-minggu.
> - `GEMINI.md` → pointer ke design token.
> - File ini (`AGENTS.md`) → **aturan kerja + konvensi + jebakan + status terkini**.

---

## 0. ⚠️ ATURAN KERJA DENGAN PEMILIK PROJECT (BACA DULU, WAJIB)

Project ini adalah **project portofolio / karier** pemiliknya. Karena itu:

1. **Pemilik project mengetik dan menjalankan sendiri seluruh kodenya.** Tugas AI agent adalah **memandu seperti senior developer**: beri kode + langkah + penjelasan singkat, bukan mengedit file secara agentic.
2. **Dilarang melakukan edit file secara otonom** pada kode project (`server/`, `web/`, `ml/`, `deploy/`) kecuali pemilik project **secara eksplisit** meminta.
3. Pengecualian: file dokumentasi (`.md`) **boleh** dikoreksi langsung kalau diminta.
4. Setiap task selesai, **pandu pemilik untuk commit → push ke `dev-zacky` → PR `dev-zacky` → `dev`**.

> Ringkasnya: AI = mentor yang memberi kode & arahan. Pemilik = yang eksekusi. Ini disengaja supaya dia benar-benar paham.

---

## 1. Apa itu FLUIDS

Platform sosial media **untuk developer** (konsep: Instagram-like tapi code-first). Monorepo polyglot:

| Folder | Isi | Status (15 Okt 2026) |
|---|---|---|
| `server/` | Backend Go — modular monolith (6 modul) | ✅ jalan lokal, auth masih ada stub |
| `web/` | Frontend React (SPA) | ✅ ~80% selesai (desain sudah final) |
| `ml/` | Two-Tower Neural Network recsys (Python) | ⏸️ belum disetup (baru `pyproject.toml` + `uv.lock`) |
| `mobile/` | Flutter | ⏸️ belum ada di repo |
| `shared/openapi` | Kontrak API | 🟡 masih 1 file `openapi.yaml` |
| `deploy/` | Podman compose + init SQL | ✅ jalan lokal |

- Repo: `https://github.com/AchmadZackyGZ/Fluids`
- Path lokal: `D:\Project-Zacky\Fluids`
- Go module path: `github.com/AchmadZackyGZ/fluids/server`

---

## 2. ALUR BRANCH — WAJIB DIIKUTI, JANGAN DILANGGAR

```
main       ← production (rilis stabil)
  ↑ PR
staging    ← pra-production (QA / verifikasi)
  ↑ PR
dev        ← integrasi seluruh kerjaan tim (kamu + team)
  ↑ PR
dev-zacky  ← branch kerja harian (ngoding + testing di sini)
```

**Aturan:**
- Semua ngoding & testing dikerjakan di **`dev-zacky`**.
- Naik ke atas **hanya lewat Pull Request**, tidak pernah commit langsung.
- Jangan pernah `git push` langsung ke `dev`, `staging`, atau `main`.

---

## 3. Stack & versi terpasang

### Backend (`server/`)
- Go **1.25.1** (go.mod)
- **Echo v4.15.4** (HTTP framework)
- **Uber Fx v1.24.0** (dependency injection)
- **pgx v5.10.0** + `pgxpool` (PostgreSQL driver)
- **go-playground/validator v10.30.3** (validasi request) — masih `// indirect` di go.mod
- **golang-jwt/jwt v5.3.1** + `golang.org/x/crypto` (auth & hashing password)
- **redis/go-redis v9.22.0** (cache) — masih `// indirect` di go.mod
- **pgvector-go v0.4.1** (vector embedding untuk reco)
- **sqlc** (generate kode dari query SQL) + **air** (hot reload)

### Frontend (`web/`)
- React **18.2** + TypeScript **5.2** + Vite **5.x** + Tailwind **3.4**
- Turborepo + pnpm workspace (`web/apps/web` = package `@fluids/web`)
- framer-motion, lucide-react, clsx, tailwind-merge
- **`packageManager: pnpm@9.0.0`** di-pin di `web/package.json`

### Infra
- Podman **6.1.1** + `podman-compose` **1.6.0**
- Podman machine: `podman-machine-default`, provider **WSL** (Fedora-based)

---

## 4. Struktur folder

```
Fluids/
├── .agents/rules/design-tokens.md   ← SOURCE OF TRUTH styling UI. Baca sebelum bikin komponen.
├── AGENTS.md                        ← file ini (aturan kerja + konteks)
├── ARCHITECTURE_DOCUMENTATION.md    ← referensi teknis arsitektur AKTUAL
├── PLAN.md                          ← keputusan arsitektur + roadmap (ADR)
├── TODO.md                          ← status task per-minggu
├── IDEA.md                          ← ringkasan ide project (1 paragraf)
├── GEMINI.md                        ← pointer ke design-tokens
├── Makefile                         ← entry point perintah dev
├── deploy/
│   ├── podman/podman-compose.dev.yml  ← 5 service container
│   ├── podman/.env                    ← GITIGNORED, dibuat manual dari .env.example
│   └── postgres/init/01_extensions.sql ← auto-run saat container pertama kali
├── server/                          ← Go backend
├── web/                             ← React frontend (pnpm workspace + turbo)
├── ml/                              ← Python (pyproject.toml + uv.lock) — belum disetup
└── shared/openapi/                  ← kontrak API (sekarang: openapi.yaml)
                                     ← 🔜 shared/proto/ (gRPC) & shared/events/ (schema) BELUM ADA
```

### Struktur satu modul backend

```
server/internal/modules/<nama-modul>/
├── module.go                        ← fx.Module + RegisterRoutes + prefix /api/v1/<modul>
├── contracts/                       ← ⭐ WAJIB: satu-satunya jalan komunikasi antar modul
│   ├── errors.go                    ← sentralisasi SEMUA error modul ini (sentinel error)
│   └── <nama>_contract.go           ← gabungan DOMAIN + CONTRACT: struct/DTO + interface
└── internal/
    ├── delivery/http/handler.go     ← layer HTTP (Echo), bind request + map error ke status code
    ├── service/service.go           ← business logic, definisi Req/Res struct + tag validate
    ├── repository/
    │   ├── postgres.go              ← implementasi repository
    │   ├── queries/*.sql            ← query mentah untuk sqlc
    │   └── gen/                     ← ⚠️ HASIL GENERATE sqlc — JANGAN EDIT MANUAL
    └── migrations/*.sql             ← golang-migrate, milik modul ini sendiri
```

### ⭐ ATURAN FOLDER `contracts/` — WAJIB DITERAPKAN, JANGAN DILANGGAR

Project ini **modular monolith**. Setiap modul harus terisolasi penuh supaya nanti bisa dipecah jadi microservice tanpa refactor besar. Karena itu `contracts/` adalah **satu-satunya pintu** yang boleh dilewati modul lain, dan isinya **HANYA 2 FILE**:

**1. `errors.go` — sentralisasi error modul**

Semua sentinel error modul dideklarasikan di sini pakai `errors.New()` dalam satu blok `var (...)`. Tujuannya supaya modul lain bisa cek error dengan `errors.Is()` tanpa perlu tahu detail implementasinya.

```go
package contracts

import "errors"

var (
    ErrUserNotFound          = errors.New("user not found")
    ErrEmailAlreadyExists    = errors.New("email already exists")
    ErrUsernameAlreadyExists = errors.New("username already exists")
)
```

**2. `<nama>_contract.go` — gabungan DOMAIN + CONTRACT dalam satu file**

Ini **sengaja digabung** (bukan dipisah jadi `domain.go` + `contract.go`). Isinya dua hal:

- **struct / DTO** — bentuk data yang di-expose ke modul lain (perannya sebagai *domain*)
- **interface `<Nama>Contract`** — kontrak method yang wajib dipenuhi modul ini (perannya sebagai *contract*)

```go
package contracts

type UserDTO struct {
    ID       string `json:"id"`
    Username string `json:"username"`
    Email    string `json:"email"`
    // ...
}

type CreateUserReq struct {
    Username     string `json:"username"`
    PasswordHash string `json:"password_hash"`
    // ...
}

type UserContract interface {
    CreateUser(ctx context.Context, req CreateUserReq) (*UserDTO, error)
    GetUserByEmail(ctx context.Context, email string) (*UserDTO, error)
    GetUserByID(ctx context.Context, id string) (*UserDTO, error)
}
```

**Cara pakai dari modul lain** — import `contracts/`-nya, jangan pernah ke `internal/`:

```go
import userContract "github.com/AchmadZackyGZ/fluids/server/internal/modules/user/contracts"
```

**Aturan turunan (pelanggaran = PR ditolak):**

- ❌ DILARANG `modules/auth/...` meng-import `modules/user/internal/...`
- ❌ DILARANG meng-import `service` atau `repository` milik modul lain
- ✅ BOLEH `modules/auth/...` meng-import `modules/user/contracts`
- ❌ DILARANG menaruh file ketiga di `contracts/` (misal `dto.go`, `types.go`, `service.go`) — semuanya masuk ke `<nama>_contract.go` dan `errors.go`
- ✅ Kalau modul A butuh akses modul B: modul B **wajib** mengekspos interface di `contracts/`, lalu di-bind lewat Fx. Contoh nyata: `user.ProvideUserContract()` di `user/module.go`, dikonsumsi `auth` sebagai `userContract.UserContract`.

**Status folder `contracts/` saat ini (audit 15 Okt 2026):**

| Modul | `contracts/` | Isi |
|---|---|---|
| `user` | ✅ | `errors.go`, `user_contract.go` |
| `content` | ✅ | `errors.go`, `content_contract.go` |
| `social` | ✅ | `errors.go`, `social_contract.go` |
| `notification` | ✅ | `errors.go`, `notification_contract.go` |
| `auth` | ✅ | `errors.go`, `auth_contract.go` |
| `reco` | ❌ belum ada | Belum ada modul yang meng-consume `reco` |

> `reco` belum punya `contracts/` karena **belum di-consume modul lain**. Begitu ada modul lain yang butuh akses, **WAJIB dibuatkan `contracts/`** dengan 2 file tersebut.
>
> ℹ️ Catatan: `auth/contracts/` sudah ada, **tapi** isinya (`auth_contract.go`) masih berupa DTO + interface yang **belum di-consume** modul lain — dipakai internal auth sendiri. Tetap ikuti aturan `contracts/` supaya konsisten.

Hasil audit terakhir: **tidak ada pelanggaran** import lintas modul. Satu-satunya import lintas modul adalah `auth` → `user/contracts` (itu contoh yang benar).

Modul yang ada: `auth`, `user`, `content`, `social`, `notification`, `reco`.
Prefix route: `/api/v1/auth`, `/api/v1/users`, `/api/v1/content`, `/api/v1/social`, `/api/v1/notifications`, `/api/v1/reco`.

---

## 5. Konvensi ngoding backend

1. **Anti tight-coupling — ini aturan paling penting di project ini.** Modul **tidak boleh** meng-import `internal/` modul lain. Komunikasi **hanya** lewat `contracts/`. Aturan lengkap folder `contracts/` (wajib 2 file: `errors.go` + `<nama>_contract.go`) ada di **bagian 4** di atas — baca dulu sebelum bikin modul baru atau sebelum modul A butuh akses modul B.
2. **Layer wajib:** `delivery/http` → `service` → `repository`. Handler tidak boleh akses DB langsung.
3. **Error handling terpusat.** Semua sentinel error modul ada di `contracts/errors.go`, dan handler memetakannya ke HTTP status code (lihat `handleAuthError` di `auth/internal/delivery/http/handler.go`).
4. **Validasi request** pakai tag `validate:"..."` di struct Req, lalu diterjemahkan ke pesan Bahasa Indonesia lewat `internal/platform/validator/validator.go`.
5. **Query SQL ditulis manual** di `repository/queries/*.sql`, lalu generate dengan `sqlc`. Jangan tulis SQL di dalam Go.
6. **Migrasi per modul.** Setiap modul punya folder `internal/migrations` sendiri dan tabel tracking sendiri (`x-migrations-table=schema_migrations_<modul>`). Urutan dependensi: **user → content → social → notification → reco** (rollback dibalik).
7. **DI lewat Fx.** Daftarkan provider di `module.go` pakai `fx.Provide(...)` + `fx.Invoke(RegisterRoutes)`. Modul didaftarkan di `server/cmd/api/main.go`.
8. **Styling UI:** wajib ikut `.agents/rules/design-tokens.md`. Dilarang improvisasi warna/gradient/glow. Identitas visual = alat developer (GitHub, Linear, Vercel, Raycast), bukan sci-fi neon.

---

## 6. Infra lokal (Podman, Windows)

Compose file: `deploy/podman/podman-compose.dev.yml`
Env file: `deploy/podman/.env` (**gitignored**, copy dari `.env.example`)

| Service | Image | Host Port |
|---|---|---|
| postgres | `docker.io/pgvector/pgvector:pg16` | **5436** → 5432 |
| redis | `docker.io/library/redis:7-alpine` | 6379 |
| rabbitmq | `docker.io/library/rabbitmq:3-management-alpine` | 5672 / 15672 |
| kafka | `docker.io/apache/kafka:latest` | 9092 |
| minio | **`quay.io/minio/minio:latest`** | 9000 / 9001 |

- Database: `fluids_db`, user `fluids_admin`
- Extension terpasang otomatis: `uuid-ossp`, `vector`, `pgcrypto`, `pg_trgm`
- ⚠️ Port **5432 sudah dipakai** container project lain (`invora-postgres`). Fluids pakai 5436 — jangan diubah.
- ⚠️ **Object storage = MinIO** (keputusan 15 Okt 2026, kembali dari eksperimen SeaweedFS). Container name `fluids-minio`, volume `minio_data`, console `--console-address ":9001"`.
- ⚠️ MinIO **menghapus** image-nya dari Docker Hub (`docker.io/minio/minio` → 404). **WAJIB** pakai `quay.io/minio/minio:latest`. Registry resmi sekarang `quay.io`.
- ⚠️ Podman machine **wajib rootful + cgroupfs** di Windows/WSL (06 Okt 2026): rootless bikin `cgroupControllers: []` kosong → semua container gagal `crun: controller pids is not available`. Fix: `podman machine set --rootful` + file `/etc/containers/containers.conf.d/99-cgroupfs.conf` berisi `[engine]` + `cgroup_manager = "cgroupfs"` di dalam VM (via `Get-Content ... | podman machine ssh sudo tee ...`), lalu restart machine. File ini hilang kalau machine di-`rm`, wajib dibuat ulang.

Aplikasi: Go API `:8080` (health `/health`), Web Vite `:3000` (proxy `/api` → `127.0.0.1:8080`).

---

## 7. Cara menjalankan

```powershell
# 1. Nyalakan Podman VM (kalau mati)
podman machine start

# 2. Nyalakan infra (5 container)
cd D:\Project-Zacky\Fluids
podman-compose -f deploy/podman/podman-compose.dev.yml up -d

# 3. Migrasi database (idempotent, aman diulang)
bash server/scripts/migrate.sh up

# 4. Backend — terminal terpisah
cd server
air

# 5. Frontend — terminal terpisah
cd web
npx -y pnpm@9.0.0 dev
```

Buka `http://localhost:3000`.

**Perintah lain:**
```powershell
bash server/scripts/migrate.sh down                                    # rollback migrasi
cd server && go run github.com/sqlc-dev/sqlc/cmd/sqlc@latest generate  # regenerate sqlc
cd server && go build ./...                                            # verifikasi build
podman-compose -f deploy/podman/podman-compose.dev.yml down -v        # stop + hapus volume (DATA HILANG)
```

---

## 8. YANG SUDAH SELESAI — JANGAN DIKERJAKAN ULANG

Dikerjakan 19–20 September 2026 (setup environment), lalu **15 Oktober 2026** (logging + perbaikan bug).

### Setup environment (SELESAI, terverifikasi)
- [x] Clone repo, checkout `dev`, buat branch `dev-zacky`
- [x] `deploy/podman/.env` dibuat (15 variabel) — **gitignored**
- [x] `server/.env` dibuat dari `server/.env.example` — **gitignored**
- [x] Install `podman-compose` 1.6.0 via pip
- [x] Install CLI `migrate` (golang-migrate v4.20.1) via `go install -tags postgres`
- [x] `go mod download` + `go build ./...` → sukses
- [x] `pnpm install` (143 paket) + `pnpm build` → sukses, `pnpm-lock.yaml` TIDAK berubah

### Infra (SELESAI, terverifikasi)
- [x] Podman machine start
- [x] 5 container UP: postgres, redis, rabbitmq, kafka, minio
- [x] Postgres siap + extension `vector 0.8.6` terpasang
- [x] Redis `PING` → `PONG`

### Database (SELESAI, terverifikasi)
- [x] Migrasi 5 modul jalan semua (**9 file migrasi**: user 3, content 1, social 1, notification 1, reco 3)
- [x] 9 tabel bisnis: `users`, `posts`, `post_media`, `post_code_snippets`, `bookmarks`, `follows`, `notifications`, `user_embeddings`, `item_embeddings`
- [x] 5 tabel tracking: `schema_migrations_{user,content,social,notification,reco}`

### Verifikasi end-to-end (SELESAI)
- [x] Go API `:8080` — `NewPostgresPool` & `NewRedisClient` konek sukses, `/health` → `{"status":"UP"}`
- [x] Web `:3000` — Vite ready
- [x] **`POST /api/v1/auth/register` dan `/login` lewat proxy `:3000/api` sukses**, JWT keluar, row user tersimpan di Postgres

### Pekerjaan 15 Okt 2026 — SUDAH DI-COMMIT & SUDAH DI-MERGE KE `dev`
Semua di bawah ini **sudah selesai, sudah di-commit, dan PR-nya sudah di-merge**. Jangan kerjakan ulang.

| Commit | Isi |
|---|---|
| `4d00ade` | `feat(platform)`: structured logging dengan `slog` + context propagation |
| `02038bf` | `fix(auth)`: mount JWT middleware di protected routes (`/logout`, `/change-password`, `/account`) |
| `77011bb` | `chore(infra)`: switch object storage kembali ke MinIO (`quay.io/minio/minio:latest`) |
| `8506e25` | `docs`: sync AGENTS.md & TODO.md + enforce LF untuk shell & SQL |
| `bffec42` | `refactor(social)`: hapus per-module redis provider |

→ PR #24 **merged ke `dev`** (squash commit `59285ad`). Working tree bersih pada saat merge.

Rincian perbaikan:
- [x] **Structured logging** (`internal/platform/logger/`): `logger.go` (Init + JSON handler + `ReplaceAttr` rename `level`→`severity`, `time`→`timestamp`, tambah `source`) + `middleware.go` (`RequestIDMiddleware`, `LoggingMiddleware`, `UserIDMiddleware`) + `SanitizeArgs()` deny-list untuk 15 field sensitif. Dipasang di `main.go`.
- [x] **Bug JWT middleware FIXED.** Dulu `JWT` hanya dipasang di sebagian route → `c.Get("user_id").(string)` **panic**. Sekarang `auth/module.go` memisah route jadi dua group: `public` (register, login, refresh, forgot-password, verify-email, resend-verification, reset-password) dan `protected` (+ `security.JWTMiddleWare`: logout, change-password, delete-account).
- [x] **Object storage kembali ke MinIO** di compose + volume `minio_data`.
- [x] `deploy/podman/.env.example` dibuat (sebelumnya tidak ada).
- [x] `.gitignore`: tambah `.workbuddy-ai/memory`.
- [x] `Makefile`: `docker compose` → `podman-compose`; target `migrate-up`/`migrate-down` diarahkan ke `bash server/scripts/migrate.sh`.

---

## 8b. 🔴 REALITAS vs DOKUMEN — BACA SEBELUM PERCAYA CHECKLIST

**`TODO.md` dan `PLAN.md` TIDAK BISA DIPERCAYA MENTAH.** Hasil audit 15 Okt 2026: beberapa item bertanda `[x]` ternyata **stub** (ada `// TODO:` di kodenya). **Selalu verifikasi ke kode**, jangan percaya checklist.

Lubang terkonfirmasi per 15 Okt 2026:

| # | Temuan | Bukti |
|---|---|---|
| 1 | `auth/internal/repository/` **tidak ada** — persistensi auth 100% Redis inline di `service.go` | `find modules/auth` → tidak ada folder `repository` |
| 2 | `auth/internal/migrations/` **tidak ada** — 3 tabel auth belum dibuat | idem |
| 3 | Auth service punya **6 stub `// TODO:`** | `service.go` baris 210, 238, 284, 317, 351, 383 |
| 4 | `VerifyEmail` — email **TIDAK** diupdate di DB | `// TODO: Add UpdateEmailVerified to userContract` |
| 5 | `ResetPassword` + `ChangePassword` — password **TIDAK PERNAH berubah** | `// TODO: Add UpdatePassword to userContract` (2×) |
| 6 | `DeleteAccount` — tidak soft-delete (hanya revoke token) | `// TODO: Call userContract.DeleteAccount or UpdateDeletedAt` |
| 7 | Publish event email ke RabbitMQ — **tidak ada** | `// TODO: Publish event to RabbitMQ` (2×: forgot-password, resend-verification) |
| 8 | Akar masalah: `userContract.UserContract` cuma **3 method** | `CreateUser`, `GetUserByEmail`, `GetUserByID` |
| 9 | Skema `users` belum punya kolom `email_verified` & `deleted_at` | `0001_user_init.up.sql` |
| 10 | `hashToken` = **XOR manual**, bukan SHA-256/bcrypt | `service.go` baris 453 |
| 11 | `revokeAllUserTokens` = `SCAN refresh_token:*` **seluruh keyspace** → O(N) | `service.go` baris 423 |
| 12 | `platform/messaging/` **tidak ada** — RabbitMQ/Kafka container jalan tapi belum dipakai kode Go | `ls internal/platform` → cuma `database, logger, redisx, security, validator` |
| 13 | `platform/storage/` belum ada → belum ada integrasi object storage di Go | idem |
| 14 | `server/internal/modules/*/contracts/` untuk `auth` & `reco` **BELUM ADA** | padahal `auth/contracts/` sudah ada sekarang (audit lama keliru) — lihat koreksi di bawah |

> ⚠️ **Koreksi atas audit 20 Sep:** `auth` **sudah punya** `contracts/{errors.go, auth_contract.go}` (dibuat saat kerja logging 15 Okt). Yang masih benar-benar kosong: `reco`.

**Rantai akar masalah** (perbaiki dari bawah ke atas, bukan dari atas):
```
skema users kurang kolom email_verified + deleted_at
        ↓
userContract cuma 3 method (tanpa UpdatePassword / UpdateEmailVerified / DeleteAccount)
        ↓
5 method auth jadi stub (VerifyEmail, ResetPassword, ChangePassword, DeleteAccount, publish event)
```

---

## 9. YANG BELUM DIKERJAKAN (roadmap)

Urutan sesuai keputusan pemilik project:

1. **Backend + Web dulu** (sedang berjalan) — prioritas saat ini: **selesaikan Auth** (lihat 8b, rantai akar masalah)
2. **Mobile — Flutter** (belum ada folder `mobile/` di repo)
3. **ML — Two-Tower recsys** di `ml/` (FastAPI + PyTorch). `pyproject.toml` + `uv.lock` sudah ada, tinggal `uv sync`. Butuh `uv` yang belum terpasang. PyTorch ~2–3 GB.

Fitur yang direncanakan **setelah** pondasi backend selesai (detail di `PLAN.md`):
- **GraphQL gateway** — untuk **Web saja**, bukan mobile.
- **gRPC internal** — untuk `reco`, `chat`, `notification` (Go ↔ Python ↔ Dart).
- **WebSocket hub** + **Webhook** (keluar) untuk integrasi pihak ketiga.
- **Message broker**: RabbitMQ (task queue) + Kafka (event log/analytics) — container sudah jalan, kode belum.
- **Observability**: OpenTelemetry (traceID) + Grafana Alloy → Loki (logs) + Tempo (traces) + Prometheus (metrics) + Grafana dashboard.
- **Upgrade slog → centralized logging** (ship JSON log ke Loki).

Catatan teknis yang masih menggantung:
- Kafka & RabbitMQ container sudah jalan, tapi **belum dipakai** di kode Go (backend baru pakai Postgres + Redis).
- Modul `reco` sudah ada route `/api/v1/reco/explore`, tapi belum ada model ML-nya.
- `reco` belum punya `contracts/` (belum di-consume modul lain).
- `web/package.json` masih pin `pnpm@9.0.0` (agak usang).

---

## 10. Jebakan yang sudah terkonfirmasi — baca sebelum debug

1. **pnpm version mismatch.** Mesin punya pnpm 12.4.1 global, tapi repo pin `pnpm@9.0.0`. Fitur auto-switch pnpm **gagal** dengan error `did not materialize in the global virtual store`. **Solusi: selalu `npx -y pnpm@9.0.0 <cmd>`** di folder `web/`.
2. **`make` tidak terpasang** di Windows (juga tidak ada `mingw32-make`/`gmake`). Makefile tidak bisa dipakai langsung — jalankan perintah mentahnya, atau install GNU Make.
3. **Vite bind ke IPv6 `::1` saja.** `curl http://127.0.0.1:3000` GAGAL, `http://localhost:3000` SUKSES. Di browser selalu pakai `localhost`.
4. **Proses orphan.** `go run` dan `npx pnpm dev` meninggalkan proses anak kalau parent di-kill, sehingga port tetap terpakai. Bersihkan: `netstat -ano | findstr :3000` lalu `taskkill /PID <pid> /F`.
5. **`podman-compose` membaca `.env` dari folder file compose** (`deploy/podman/`), bukan dari root repo.
6. **CLI `migrate` wajib ada di PATH** untuk `server/scripts/migrate.sh`. Terpasang di `C:\Users\ferin\go\bin`.
7. **File `.env` tidak ada di repo** (gitignored). Kalau environment baru, wajib copy dari `.env.example` — kalau tidak, Go akan error `missing required database environment variables`.
8. **`server/tmp/`** dipakai air untuk binary hasil build. Jangan diedit.
9. **Banyak file Go belum rapi formatnya — tapi hati-hati saat merapikan.** Hasil audit 20 Sep 2026:
   - `gofmt -l` menandai **53 file**
   - **17 file** ditandai hanya karena line ending CRLF — git **tidak melihat perubahan apa pun** di sini, karena repo ini `core.autocrlf=true` (CRLF di working tree itu **normal**, bukan bug)
   - **36 file** punya masalah format **asli** (alignment blok `var`, trailing newline di akhir file, dll)

   ⚠️ **JANGAN jalankan `gofmt -w .` di seluruh folder `server/`.** Itu akan mengubah 36 file sekaligus dan membuat diff PR-mu kacau serta mustahil di-review.
   Format **hanya file yang kamu sentuh**, dan bicarakan dulu dengan tim kalau mau normalisasi seluruh repo.

---

## 11. Aturan kerja untuk AI agent

> ⚠️ Baca juga **bagian 0** — pemilik project mengetik & menjalankan kodenya sendiri. AI bertindak sebagai mentor, bukan eksekutor.

1. **Jangan edit kode project secara otonom.** Berikan kode + langkah + penjelasan singkat; pemilik yang mengetik & menjalankan. (File `.md` boleh dikoreksi bila diminta.)
2. Kerjakan semua perubahan di branch **`dev-zacky`**. Jangan commit/push ke `dev`, `staging`, `main`.
3. **Jangan pernah** commit file `.env` atau kredensial apa pun.
4. **Jangan edit manual** file di `repository/gen/` — itu hasil generate `sqlc`. Ubah `queries/*.sql` lalu regenerate.
5. **Jangan `git add .`** — selalu `git add <file>` per file. Pernah terjadi file pribadi (`podman-error.txt` berisi hash & stack trace) nyaris ikut ter-commit.
6. Sebelum menyatakan selesai: jalankan `go build ./...` di `server/`, dan `npx -y pnpm@9.0.0 run build` di `web/`.
7. Untuk komponen UI, **wajib** ikut `.agents/rules/design-tokens.md`. **Desain `/web` sudah final — jangan redesign.**
8. Jangan hapus folder `.workbuddy-ai/` (berisi catatan kerja).
9. Jangan ubah port yang sudah ditentukan (5436 untuk Postgres, 3000 web, 8080 API).
10. Kalau butuh mengubah skema DB: bikin file migrasi baru di `internal/migrations` modul terkait — jangan ubah file migrasi yang sudah pernah dijalankan.
11. **Format Go:** setelah selesai mengedit, jalankan `gofmt -w` **hanya pada file yang kamu ubah** — jangan pernah `gofmt -w .` di seluruh folder (lihat jebakan #9 di bagian 10).
12. **Kalau bikin modul baru**, wajib ikut struktur di bagian 4: `contracts/{errors.go, <nama>_contract.go}` + `internal/{delivery/http, service, repository, migrations}` + `module.go`, lalu daftarkan modulnya di `server/cmd/api/main.go`.
13. **Sebelum mengecek pelanggaran arsitektur**, baca dulu bagian 4. Import yang diizinkan lintas modul **hanya** ke `contracts/`.
14. **Jangan percaya checklist `TODO.md`/`PLAN.md`** — verifikasi ke kode dulu (lihat bagian 8b).

---

## 12. Konvensi commit & alur PR

Setiap task selesai → **pandu pemilik project** untuk menempuh alur ini (jangan skip):

```bash
# 1. Pastikan di branch dev-zacky & lihat apa yang berubah
git branch --show-current
git status --short
git diff

# 2. Commit PER LOGICAL UNIT (jangan git add .)
git add server/internal/modules/user/internal/migrations/0003_add_email_verified_deleted_at.up.sql
git add server/internal/modules/user/internal/migrations/0003_add_email_verified_deleted_at.down.sql
git commit -m "feat(user): add email_verified & deleted_at columns"

# 3. Push ke dev-zacky
git push origin dev-zacky

# 4. Buka PR: dev-zacky → dev (lewat GitHub UI / gh CLI)
gh pr create --base dev --head dev-zacky --title "..." --body "..."
```

**Format commit (Conventional Commits):** `feat:`, `fix:`, `refactor:`, `docs:`, `test:`, `chore:`, `perf:`. Pakai scope modul kalau relevan, contoh `fix(auth): ...`, `chore(infra): ...`.

**Aturan PR:**
- Base = `dev`, head = `dev-zacky`. **Jangan pernah** PR langsung ke `staging`/`main`.
- Satu PR = satu concern. Jangan campur migrasi + refactor + docs dalam satu PR besar.
- Setelah PR merged, `git checkout dev && git pull && git checkout dev-zacky && git merge dev` (biar branch kerja tetap sinkron).


# AGENTS.md — Konteks Project FLUIDS

> File ini dibaca otomatis oleh OpenCode. Isinya adalah konteks lengkap project:
> alur branch, stack, struktur folder, cara menjalankan, konvensi ngoding,
> dan **status pekerjaan terkini** supaya pekerjaan yang sudah selesai tidak diulang.

Terakhir diperbarui: 24 November 2026

> 📌 **Dokumen lain & perannya** (supaya tidak tumpang tindih):
> - `aturanFluidsAi.md` → peran mentor, aturan keras, workflow dual-boot Windows ↔ Debian, prioritas kerja terkini.
> - `PLAN.md` → keputusan arsitektur + roadmap (ADR style). Ini yang jadi acuan arah.
> - `ARCHITECTURE_DOCUMENTATION.md` → referensi teknis detail arsitektur **aktual**.
> - `TODO.md` → status task & sprint focus (**ke depan**).
> - `TASK_LOG.md` → riwayat task yang **sudah selesai** + protokol review/commit. Baca ini untuk tahu apa yang sudah dikerjakan.
> - `GEMINI.md` → pointer ke design token.
> - File ini (`AGENTS.md`) → **aturan kerja + konvensi + logging §5b + jebakan + protokol PR §12b**.

---

## 0. ⚠️ ATURAN KERJA DENGAN PEMILIK PROJECT (BACA DULU, WAJIB)

Project ini adalah **project portofolio / karier** pemiliknya. Karena itu:

1. **Pemilik project mengetik dan menjalankan sendiri seluruh kode & perintah terminal.** Tugas AI agent adalah **memandu seperti senior developer**: beri kode + langkah + penjelasan singkat + review hasil kerjanya, bukan mengedit kode atau menjalankan terminal secara agentic.
2. **Dilarang melakukan edit file secara otonom** pada kode project (`server/`, `web/`, `ml/`, `deploy/`, `Makefile`, `shared/`) kecuali pemilik project **secara eksplisit** menulis *"kerjakan dengan mode agentic"*.
3. **Pengecualian resmi — dokumentasi (`.md`):** AI **BOLEH dan WAJIB mengedit langsung** file dokumentasi `.md` setelah task/hotfix selesai direview & dikonfirmasi (atau saat sinkronisasi docs), agar konteks tetap akurat saat pemilik pindah OS atau berganti AI agent.
4. Setiap task selesai, **review hasil ketikan pemilik → update file `.md` → pandu commit → push ke `dev-zacky` → PR `dev-zacky` → `dev`**.

> Ringkasnya: AI = mentor + reviewer + penjaga akurasi `.md`. Pemilik = eksekutor semua kode & perintah terminal. Ini disengaja supaya dia benar-benar paham.

---

## 1. Apa itu FLUIDS

Platform sosial media **untuk developer** (konsep: Instagram-like tapi code-first). Monorepo polyglot:

| Folder | Isi | Status (24 Nov 2026) |
|---|---|---|
| `server/` | Backend Go — modular monolith (6 modul, 36 route API) | ✅ jalan lokal, Auth Step A–E selesai (35 test PASS), lanjut Hotfix Keamanan & Kontrak |
| `web/` | Frontend React (SPA) | ✅ ~80% selesai (desain sudah final; integrasi API baru sebagian auth) |
| `ml/` | Two-Tower Neural Network recsys (Python) | ⏸️ belum disetup (baru `pyproject.toml` + `uv.lock`) |
| `mobile/` | Flutter | ⏸️ belum ada di repo |
| `shared/openapi` | Kontrak API | 🟡 masih 1 file `openapi.yaml` (baru 2 path usang) |
| `deploy/` | Podman compose + init SQL | ✅ jalan lokal |

- Repo: `https://github.com/AchmadZackyGZ/Fluids`
- Path lokal: `D:\Project-Zacky\Fluids` (Windows) · dual-boot Debian 13 (Linux)
- Go module path: `github.com/AchmadZackyGZ/fluids/server`

---

## 2. ALUR BRANCH — WAJIB DIIKUTI, JANGAN DILANGGAR

Disahkan **24 Nov 2026** (3 layer untuk fase lokal/solo; lihat ADR-013 di `PLAN.md`):

```
main       ← rilis stabil / showcase portfolio (PR only, per milestone besar)
  ↑ PR
dev        ← integrasi yang selalu hijau: build + test pass (PR only, per concern)
  ↑ PR
dev-zacky  ← branch kerja harian + sinkronisasi dual-boot Windows ↔ Debian
```

**Aturan:**
- Semua ngoding & testing dikerjakan di **`dev-zacky`**.
- Naik ke atas **hanya lewat Pull Request**, tidak pernah commit/push langsung ke `dev` atau `main`.
- **Branch `staging` belum dipakai** saat ini (belum ada server QA/staging terpisah); akan ditambahkan nanti saat masuk fase CI/CD & deployment (Week 8/9).
- **Dual-boot sync:** sebelum pindah OS → commit & `git push origin dev-zacky`; di OS tujuan → `git fetch origin` lalu `git pull --ff-only origin dev-zacky`.

---

## 3. Stack & versi terpasang

### Backend (`server/`)
- Go **1.25.1** (go.mod)
- **Echo v4.15.4** (HTTP framework)
- **Uber Fx v1.24.0** (dependency injection)
- **pgx v5.10.0** + `pgxpool` (PostgreSQL driver)
- **go-playground/validator v10.30.3** (validasi request — direct `require`)
- **golang-jwt/jwt v5.3.1** + `golang.org/x/crypto` (auth & hashing password)
- **redis/go-redis v9.22.0** (cache & token store — direct `require`)
- **pgvector-go v0.4.1** (vector embedding untuk reco)
- **alicebob/miniredis/v2 v2.40.0** + **stretchr/testify v1.12.1** (unit testing tanpa container)
- **sqlc** (generate kode dari query SQL) + **air** (hot reload)

### Frontend (`web/`)
- React **18.2** + TypeScript **5.2** + Vite **5.x** + Tailwind **3.4**
- Turborepo + pnpm workspace (`web/apps/web` = package `@fluids/web`)
- framer-motion, lucide-react, clsx, tailwind-merge
- **`packageManager: pnpm@9.0.0`** di-pin di `web/package.json`

### Infra (Dual-Boot)
- **Windows 10 Home:** Podman **6.1.1** + `podman-compose` **1.6.0**, machine `podman-machine-default` (WSL, **wajib rootful + cgroupfs**)
- **Debian 13 (Linux):** Podman native (**rootless**) + `podman-compose` **1.3.0** (catatan bug path relatif di §6)

---

## 4. Struktur folder

```
Fluids/
├── .agents/rules/design-tokens.md   ← SOURCE OF TRUTH styling UI. Baca sebelum bikin komponen.
├── aturanFluidsAi.md                ← aturan mentor, workflow dual-boot, prioritas kerja terkini
├── AGENTS.md                        ← file ini (aturan kerja + konvensi + logging + PR)
├── ARCHITECTURE_DOCUMENTATION.md    ← referensi teknis arsitektur AKTUAL
├── PLAN.md                          ← keputusan arsitektur + roadmap (ADR)
├── TODO.md                          ← status task & sprint focus
├── TASK_LOG.md                      ← riwayat task SELESAI + protokol review/commit
├── IDEA.md                          ← ringkasan ide project (1 paragraf)
├── GEMINI.md                        ← pointer ke design-tokens
├── Makefile                         ← entry point perintah dev (kompatibel cmd.exe Windows)
├── deploy/
│   ├── podman/podman-compose.dev.yml  ← 5 service container
│   ├── podman/.env                    ← GITIGNORED, dibuat manual dari .env.example
│   └── postgres/init/01_extensions.sql ← auto-run saat container pertama kali
├── server/                          ← Go backend
├── web/                             ← React frontend (pnpm workspace + turbo)
├── ml/                              ← Python (pyproject.toml + uv.lock) — belum disetup
└── shared/openapi/                  ← kontrak API (sekarang: openapi.yaml, baru 2 path)
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

## 5b. ⚠️ ATURAN LOGGING — WAJIB DIBACA SEBELUM MENULIS `logger.*`

> Bagian ini ditambahkan **17 Okt 2026** setelah ditemukan **double-logging** dan **password user bocor di log**
> di modul `auth`. Aturan di bawah bersifat **preskriptif** — pelanggaran = PR ditolak.

### 5b.1 Prinsip: log itu untuk OPERATOR, bukan untuk developer

Setiap baris log harus menjawab: *"kalau saya melihat baris ini jam 3 pagi, apakah saya perlu bertindak?"*
Kalau jawabannya **tidak**, jangan pakai `INFO` apalagi `ERROR`.

### 5b.2 Di layer mana log apa (JANGAN TERTUKAR)

| Layer | Boleh log? | Yang dicatat |
|---|---|---|
| `delivery/http` (handler) | ✅ | **Semua kegagalan — SEKALI**, + event sukses penting |
| `service` | ✅ **hanya EVENT** | Event bisnis yang berhasil (`INFO`), kondisi mencurigakan (`WARN`) |
| `service` | ❌ | **Error yang di-`return`** — jangan dicatat di sini |
| `repository` | ❌ | Tidak pernah log. Hanya `return err` (di-map ke sentinel). |

**Alasannya:** error merambat naik. Kalau setiap layer mencatatnya, satu kegagalan jadi 2–3 baris log.
Handler adalah **batas sistem** — di situ konteks lengkap tersedia (user, endpoint, status HTTP).

### 5b.3 Level ditentukan oleh KEPARAHAN, bukan berhasil/gagal

> ❌ **SALAH:** "error → `ERROR`, success → `INFO`"
> ✅ **BENAR:** level = seberapa besar operator harus peduli

| Level | Pakai untuk | Contoh |
|---|---|---|
| `DEBUG` | detail debugging. **Mati di production** (`LOG_LEVEL=info`) | `"login attempt"`, `"tokens issued"` |
| `INFO` | event bisnis berhasil — **maks 1 baris per request** | `"user registered"`, `"password changed"`, `"email verified"` |
| `WARN` | mencurigakan / gagal tapi tertangani — **traffic normal** | salah password (401), token tidak ditemukan, rate limit, email sudah terdaftar (409) |
| `ERROR` | kegagalan sistem, butuh manusia | Redis/DB putus, publish ke broker gagal, cleanup gagal di fungsi yang tidak return error |

> 🔴 **4xx BUKAN ERROR.** `401`/`404`/`409`/`429` adalah hasil normal dari input user.
> Kalau dicatat `ERROR`, alert `ERROR > 0` menyala terus → tim berhenti mempercayai alert.

### 5b.4 Anti-pattern — semuanya pernah terjadi di project ini

| ❌ Anti-pattern | Kenapa salah | ✅ Perbaikan |
|---|---|---|
| `logger.ErrorCtx(...)` lalu `return err` di service | Double-logging dengan handler | Hapus; cukup `return err` |
| Logging di dalam `mapError` / mapper error | Fungsi mapping harus murni | Log di handler, mapper hanya memetakan |
| `ErrorCtx` untuk salah password | 401 = traffic normal | `WarnCtx` |
| `InfoCtx("login attempt")` tiap request | 2 baris per login, noise | `DebugCtx` |
| `InfoCtx("login success")` + `InfoCtx("tokens issued")` | Dua log untuk satu event | Pilih satu |
| Log `password`/`token` tanpa `SanitizeArgs` | **Kebocoran kredensial** | `SanitizeArgs` + `maskToken` |

### 5b.5 Sanitasi WAJIB untuk data sensitif

`SanitizeArgs()` bersifat **opt-in** — log yang tidak memakainya **tidak** disensor otomatis.

```go
// ❌ BOCOR — nilai asli masuk log
logger.InfoCtx(ctx, "reset password attempt", "new_password", req.NewPassword)

// ✅ AMAN
logger.DebugCtx(ctx, "reset password attempt",
    logger.SanitizeArgs("token_preview", maskToken(req.Token), "new_password", req.NewPassword)...)
```

Deny-list memakai **pencocokan substring** (`isSensitiveKey`): key yang *mengandung* `password`,
`token`, `secret`, `api_key`, `apikey`, `credential`, `private_key` otomatis jadi `[REDACTED]`.
Ini krusial karena `current_password` / `new_password` / `reset_token` **lolos** pencocokan eksak —
dan itu benar-benar pernah membocorkan password user ke log.

**Jangan pernah** menaruh token mentah di log. Kalau butuh jejak, pakai `maskToken()` (8 karakter + `...`).

### 5b.6 Pola baku satu handler

```go
func (h *XHandler) Do(c echo.Context) error {
    // 1. Ambil input — JANGAN c.Get("user_id").(string), itu PANIC kalau middleware absen
    userID, ok := currentUserID(c)
    if !ok {
        return unauthorized(c)
    }

    ctx := c.Request().Context()

    // 2. DEBUG: jejak masuk (tidak tampil di production)
    logger.DebugCtx(ctx, "do attempt", "user_id", userID)

    // 3. Panggil service
    if err := h.svc.Do(ctx, userID); err != nil {
        // 4. WARN/ERROR: SEKALI, level sesuai keparahan
        h.logAuthError(c, "do failed", err, "user_id", userID)
        return h.mapError(c, err)
    }

    // 5. INFO: event bisnis berhasil
    logger.InfoCtx(ctx, "do success", "user_id", userID)
    return c.JSON(http.StatusOK, map[string]any{"status": "success"})
}
```

### 5b.7 Larangan keras

1. ❌ `fmt.Println`, `log.Printf`, `log.Fatal` di dalam modul — **selalu** lewat `logger.*`
2. ❌ `slog.Info(...)` langsung — pakai `logger.InfoCtx(ctx, ...)` supaya `trace_id`/`request_id` ikut
3. ❌ Log di `repository`
4. ❌ Log error yang di-`return` di `service`
5. ❌ Nilai sensitif tanpa `SanitizeArgs`
6. ❌ `ERROR` untuk status 4xx
7. ❌ Lebih dari **satu** baris `INFO` untuk satu request yang sukses

### 5b.8 Cara verifikasi (jangan asal percaya)

```powershell
# 1. Harus 0 hasil: tidak ada slog/fmt langsung di modul
Select-String -Path server/internal/modules/*/internal/*/*.go -Pattern "slog\.|fmt\.Print|log\.Print"

# 2. Service harus punya ErrorCtx JAUH lebih sedikit dari handler
#    (ideal: 0, kecuali fungsi void yang tidak bisa melaporkan error ke caller)
Select-String -Path server/internal/modules/*/internal/service/*.go -Pattern "logger.ErrorCtx"

# 3. Picu error yang WAJAR (salah password) — log harus WARN, bukan ERROR
$env:LOG_LEVEL="debug"; cd server; air
# terminal lain:
curl.exe -X POST http://localhost:8080/api/v1/auth/login `
  -H "Content-Type: application/json" -d '{\"email\":\"x@y.com\",\"password\":\"salah\"}'

# 4. Pastikan tidak ada password/token asli di log
Select-String -Path <log-file> -Pattern '"(new_password|current_password|reset_token)":"[^[]'
# harus 0 hasil
```

---

## 6. Infra lokal (Podman, Dual-Boot Windows & Debian 13)

Compose file: `deploy/podman/podman-compose.dev.yml`
Env file: `deploy/podman/.env` (**gitignored**, copy dari `.env.example`)

| Service | Image | Host Port |
|---|---|---|
| postgres | `docker.io/pgvector/pgvector:pg16` | **5436** → 5432 |
| redis | `docker.io/library/redis:7-alpine` | 6379 |
| rabbitmq | `docker.io/library/rabbitmq:3-management-alpine` | 5672 / 15672 |
| kafka | `docker.io/apache/kafka:latest` | 9092 |
| minio | **`ghcr.io/coollabsio/minio:latest`** | 9000 / 9001 |

- Database: `fluids_db`, user `fluids_admin`
- Extension terpasang otomatis: `uuid-ossp`, `vector`, `pgcrypto`, `pg_trgm`
- ⚠️ Port **5432 sudah dipakai** container project lain (`invora-postgres`). Fluids pakai 5436 — jangan diubah.
- ⚠️ **Object storage = MinIO** via community mirror **`ghcr.io/coollabsio/minio:latest`** karena MinIO menghapus image publik di Docker Hub (404) & `quay.io` (private). Konteks: https://github.com/minio/minio/issues/21647
- ⚠️ **Healthcheck MinIO (`unhealthy` false alarm):** `podman-compose.dev.yml` masih memakai `curl` yang tidak ada di image MinIO. Server tetap sehat; masuk antrean Hotfix (`test: ["CMD","mc","ready","local"]`).
- ⚠️ **Windows/WSL:** Podman machine **wajib rootful + cgroupfs** (06 Okt 2026): rootless bikin `cgroupControllers: []` kosong → gagal `crun: controller pids is not available`. Fix: `podman machine set --rootful` + `/etc/containers/containers.conf.d/99-cgroupfs.conf` (`cgroup_manager = "cgroupfs"`), lalu restart machine.
- ⚠️ **Debian 13 (Linux):** Podman berjalan native **rootless**. `podman-compose` versi Debian 1.3.0 punya bug path relatif → jalankan dari `deploy/podman/` atau pakai absolute path `-f "$PWD/deploy/podman/podman-compose.dev.yml"`.

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
- [x] Migrasi 5 modul jalan semua (**11 file migrasi**: user 5, content 1, social 1, notification 1, reco 3 — termasuk migrasi `0003` user)
- [x] 9 tabel bisnis: `users`, `posts`, `post_media`, `post_code_snippets`, `bookmarks`, `follows`, `notifications`, `user_embeddings`, `item_embeddings`
- [x] 5 tabel tracking: `schema_migrations_{user,content,social,notification,reco}`

### Verifikasi end-to-end (SELESAI)
- [x] Go API `:8080` — `NewPostgresPool` & `NewRedisClient` konek sukses, `/health` → `{"status":"UP"}`
- [x] Web `:3000` — Vite ready
- [x] **`POST /api/v1/auth/register` dan `/login` lewat proxy `:3000/api` sukses**, JWT keluar, row user tersimpan di Postgres

### Pekerjaan 15–18 Okt 2026 — SUDAH DI-COMMIT & SUDAH DI-MERGE KE `dev` (PR #24–#28)
Semua di bawah ini **sudah selesai, terverifikasi, dan sudah di-merge ke `dev`** (detail lengkap di `TASK_LOG.md` T-006 s/d T-021). Jangan kerjakan ulang.

| PR | Isi Utama |
|---|---|
| PR #24 (`59285ad`) | Structured logging `slog` + fix JWT middleware protected routes + switch MinIO + hapus redis provider duplikat `social` |
| PR #25 (`119e4e2`) | Koreksi seluruh file `.md` (T-010) |
| PR #26 (`e71bb1e`) | Fix image MinIO (`ghcr.io/coollabsio/minio`), Makefile kompatibel `cmd.exe`, **Step A** migrasi `0003` (`email_verified` + `deleted_at`), **Step B** extend `UserContract` jadi 6 method |
| PR #27 (`b1f3f08`) | Fix `PasswordHash` di `GetUserByID` (T-019), **Step C** sambungkan 5 stub auth ke `userContract`, **Step D** aturan logging §5b + sanitasi substring + SHA-256 `HashToken` + index Redis SET per-user + `currentUserID()`/`maskToken()`, aturan reminder PR §12b |
| PR #28 (`d350222`) | **Step E** 35 unit test & regresi (`platform/security`, `platform/logger`, `auth/internal/service` via `miniredis` + `testify`) + target `make test` & `make test-cover` |

---

## 8b. 🔴 REALITAS vs DOKUMEN — Audit Kode Terkini (24 Nov 2026)

**Selalu verifikasi ke kode aktual**, jangan percaya checklist lama. Auth Step A–E sudah tuntas, namun audit kode 24 Nov 2026 menemukan lubang & utang teknis nyata berikut:

| # | Temuan Terkonfirmasi | Bukti di Kode | Prioritas |
|---|---|---|---|
| 1 | **JWT expiry 24 jam, bukan 15 menit** (mismatch dengan `accessExpiry` 15m di `auth/service.go:444` & ADR-007) | `server/internal/platform/security/jwt.go:29` (`24 * 1 * time.Hour`) | 🔴 **Hotfix sekarang** |
| 2 | **IDOR pada `PATCH /api/v1/content/posts/:id`** — tidak cek `post.AuthorID != userID` | `content/internal/delivery/http/handler.go:95-123` | 🔴 **Hotfix sekarang** |
| 3 | **8× unsafe type assertion `c.Get("user_id").(string)` tanpa `, ok`** → potensi panic 500 | `content/internal/delivery/http/handler.go` (baris 32, 58, 106, 128, 159, 176, 193, 210) | 🔴 **Hotfix sekarang** |
| 4 | **Envelope `POST /api/v1/auth/register` flat** (`{token, user}`), sedangkan `Login`/`Refresh` wrapped `{"status":"success","data":...}` → Web `AuthFormCard.tsx:119` gagal simpan `fluids_token` saat register | `auth/internal/delivery/http/handler.go:131` vs `web/.../AuthFormCard.tsx:119` | 🔴 **Hotfix sekarang** |
| 5 | **Healthcheck MinIO pakai `curl`** (tidak ada di image → false alarm `unhealthy`) | `deploy/podman/podman-compose.dev.yml:84` | 🔴 **Hotfix sekarang** |
| 6 | **Endpoint profil user belum lengkap** — `user` baru punya `GET /me`; `App.tsx:115` memanggil `PUT /api/v1/users/profile` (404) & `platform/storage/` belum ada | `user/module.go:13-17`, `web/.../App.tsx:115` | 🟡 **Setelah Hotfix** |
| 7 | **2 `TODO(step-f)` RabbitMQ + log `dev token` DEBUG** di `auth/service.go` (`platform/messaging/` belum ada) | `auth/internal/service/service.go:236-239, 317-320` | 🟡 **Step F** |
| 8 | **Blacklist access token tidak ditegakkan** — `RevokeToken` menyimpan hash refresh token di `access_blacklist:`, dan `JWTMiddleWare` tidak mengeceknya | `auth/service.go:188`, `security/middleware.go` | 🟡 **Hardening lanjut** |
| 9 | **Refresh token belum pakai HttpOnly cookie di `Login`/`Register`/`Refresh`** (hanya `Logout` yang baca/clear cookie) | `auth/internal/delivery/http/handler.go:115-224` | 🟡 **Hardening lanjut** |
| 10 | **Logging drift di 5 modul non-`auth` + `UserIDMiddleware` tidak terpasang** (`LoggingMiddleware` juga menangkap `ctx` sebelum `next(c)`) | `logger/middleware.go:35,55`, `{user,content,social,notification,reco}/handler.go` | 🟡 **Bertahap per modul** |
| 11 | **Duplikasi sentinel error `auth/service.go` vs `auth/contracts/errors.go`** + `auth` belum punya `repository/` & `migrations/` | `auth/service.go:53-67`, `auth/contracts/errors.go` | ⚪ **Utang arsitektur** |
| 12 | **Coupling SQL lintas modul** (`social.sql:73` `UPDATE users`, `sqlc.yaml` share schema lintas modul) + `content` belum punya tabel `likes`/`comments` + N+1 di `ListFeed`/`GetFollowers` + `reco/handler.go:38` bocor `err.Error()` | `social.sql:71-82`, `content/service.go:167-240`, `reco/handler.go:38` | ⚪ **Utang arsitektur** |
| 13 | **`shared/openapi/openapi.yaml` usang** (baru 2 path dengan skema lama) & `reco` belum punya `contracts/` | `shared/openapi/openapi.yaml` | ⚪ **Sesuai roadmap** |

---

## 9. YANG BELUM DIKERJAKAN (roadmap — urut sesuai keputusan pemilik 24 Nov 2026)

1. **Hotfix Keamanan & Kontrak** *(sedang menjadi prioritas #1)*: JWT 15m, IDOR `UpdatePostCaption` + safe `user_id` di `content`, envelope `Register`, healthcheck MinIO.
2. **User Profile Endpoints + MinIO (`platform/storage/`)**: `GET /users/:username`, `PATCH /me` (selaraskan dengan `App.tsx`), `POST /me/avatar`, rapikan logging `user` §5b, unit test.
3. **Step F — RabbitMQ (`platform/messaging/`) + Email Worker**: topology idempotent, publisher/consumer (retry 3× + DLQ), sambungkan 2 `TODO(step-f)` di `auth` + welcome email, hapus `dev token` DEBUG.
4. **OpenAPI sync (`shared/openapi/`)** → generate TS client → integrasi frontend penuh.
5. **`reco/contracts/` + ML Two-Tower (`ml/`)** (FastAPI + PyTorch; `pyproject.toml` + `uv.lock` sudah ada).
6. **gRPC internal** (`shared/proto/`, `reco`, `chat`, `notification`), **GraphQL gateway** (**Web saja**, bukan mobile), **WebSocket hub** (`stories`, `notification`), **Webhook** outbound.
7. **Observability**: OpenTelemetry → Grafana Alloy → Loki (upgrade `slog`) + Tempo + Prometheus + Grafana dashboard.
8. **Mobile Flutter (`mobile/`)** & **Kafka event log** (`user.actions`, `embedding.updates`, `audit.log`).

---

## 10. Jebakan yang sudah terkonfirmasi — baca sebelum debug

1. **pnpm version mismatch.** Mesin punya pnpm 12.x global, tapi repo pin `pnpm@9.0.0`. Fitur auto-switch pnpm **gagal** (`did not materialize in the global virtual store`). **Solusi: selalu `npx -y pnpm@9.0.0 <cmd>`** di folder `web/`.
2. **GNU Make di Windows memakai `cmd.exe`, bukan bash.** GNU Make 3.81 sudah terpasang di `C:\Program Files (x86)\GnuWin32\bin` (masuk PATH). Karena pakai `cmd.exe`, **dilarang** menaruh `2>/dev/null`, `grep`/`awk`/`sed`, atau `sleep` di `Makefile` (lihat `TASK_LOG.md` T-014).
3. **`podman-compose` 1.3.0 di Debian 13** punya bug path relatif → jalankan dari `deploy/podman/` atau pakai absolute path `-f "$PWD/deploy/podman/podman-compose.dev.yml"`.
4. **Vite bind ke IPv6 `::1` saja.** `curl http://127.0.0.1:3000` GAGAL, `http://localhost:3000` SUKSES. Di browser selalu pakai `localhost`.
5. **Proses orphan (Windows).** `go run` dan `npx pnpm dev` meninggalkan proses anak kalau parent di-kill, sehingga port tetap terpakai. Bersihkan: `netstat -ano | findstr :3000` lalu `taskkill /PID <pid> /F`.
6. **`podman-compose` membaca `.env` dari folder file compose** (`deploy/podman/`), bukan dari root repo.
7. **CLI `migrate` wajib ada di PATH** untuk `server/scripts/migrate.sh` (Windows: `C:\Users\ferin\go\bin`; Debian: `~/go/bin/`).
8. **File `.env` tidak ada di repo** (gitignored). Kalau environment baru, wajib copy dari `.env.example` — kalau tidak, Go akan error `missing required database environment variables`. Jalankan `air` dari folder `server/` karena `godotenv.Load()` baca `.env` dari CWD.
9. **`server/tmp/`** dipakai air untuk binary hasil build. Jangan diedit.
10. **Banyak file Go belum rapi formatnya — tapi hati-hati saat merapikan.** `gofmt -l` menandai puluhan file (sebagian hanya karena CRLF Windows, sebagian masalah format asli).
    ⚠️ **JANGAN jalankan `gofmt -w .` di seluruh folder `server/`.** Format **hanya file yang kamu sentuh** supaya diff PR bersih dan mudah direview.

---

## 11. Aturan kerja untuk AI agent

> ⚠️ Baca juga **bagian 0** & **`aturanFluidsAi.md`** — pemilik project mengetik & menjalankan seluruh kode dan terminal sendiri.

1. **Jangan edit kode project secara otonom** (`server/`, `web/`, `ml/`, `deploy/`, `Makefile`, `shared/`). Berikan kode + langkah + penjelasan singkat; pemilik yang mengetik & menjalankan. **Pengecualian resmi:** file dokumentasi `.md` **boleh & wajib** diedit langsung oleh AI setelah task diverifikasi agar tidak stale saat pindah AI/OS.
2. **Jangan jalankan perintah terminal atas nama pemilik.** Tulis perintahnya, pemilik yang jalankan dan tempel output-nya.
3. Kerjakan semua perubahan di branch **`dev-zacky`**. Jangan commit/push langsung ke `dev` atau `main`.
4. **Jangan pernah** commit file `.env` atau kredensial apa pun.
5. **Jangan edit manual** file di `repository/gen/` — itu hasil generate `sqlc`. Ubah `queries/*.sql` lalu regenerate.
6. **Jangan `git add .`** — selalu `git add <file>` per file. Pernah terjadi file pribadi (`podman-error.txt`) nyaris ikut ter-commit.
7. Sebelum menyatakan selesai: minta pemilik jalankan `go build ./...` + `go test ./... -count=1` di `server/`, dan `npx -y pnpm@9.0.0 run build` di `web/` bila menyentuh frontend.
8. Untuk komponen UI, **wajib** ikut `.agents/rules/design-tokens.md`. **Desain `/web` sudah final — jangan redesign.**
9. Jangan hapus folder `.workbuddy-ai/` (berisi catatan kerja).
10. Jangan ubah port yang sudah ditentukan (5436 untuk Postgres, 3000 web, 8080 API).
11. Kalau butuh mengubah skema DB: bikin file migrasi baru di `internal/migrations` modul terkait — jangan ubah file migrasi yang sudah pernah dijalankan.
12. **Format Go:** setelah selesai mengedit, arahkan `gofmt -w` **hanya pada file yang diubah** — jangan pernah `gofmt -w .` di seluruh folder.
13. **Kalau bikin modul baru**, wajib ikut struktur di bagian 4: `contracts/{errors.go, <nama>_contract.go}` + `internal/{delivery/http, service, repository, migrations}` + `module.go`, lalu daftarkan modulnya di `server/cmd/api/main.go`.
14. **Sebelum mengecek pelanggaran arsitektur**, baca dulu bagian 4. Import Go yang diizinkan lintas modul **hanya** ke `contracts/`.
15. **Jangan percaya checklist `TODO.md`/`PLAN.md`** — verifikasi ke kode dulu.
16. **Logging wajib ikut bagian 5b.** Ringkasnya: log error **sekali** di handler, service hanya log **event**, `4xx` = `WARN` bukan `ERROR`, dan nilai sensitif wajib lewat `SanitizeArgs`.
17. **Setelah setiap `git push` → WAJIB ingatkan PR** beserta **judul** dan **body**-nya (bagian 12b). Jangan tutup respons dengan "selesai" tanpa menyebut PR. Push belum selesai sampai PR dibuat.

---

## 12. Konvensi commit & alur PR

Setiap task selesai → **review kode → sync `.md` → pandu pemilik project** menempuh alur ini (jangan skip):

```bash
# 1. Pastikan di branch dev-zacky & lihat apa yang berubah
git branch --show-current
git status --short
git diff

# 2. Commit PER LOGICAL UNIT (jangan git add .)
git add <file-yang-berubah>
git commit -m "fix(security): set JWT access token expiry to 15 minutes"

# 3. Push ke dev-zacky
git push origin dev-zacky

# 4. Buka PR: dev-zacky → dev (lewat GitHub UI / gh CLI)
gh pr create --base dev --head dev-zacky --title "..." --body "..."
```

**Format commit (Conventional Commits):** `feat:`, `fix:`, `refactor:`, `docs:`, `test:`, `chore:`, `perf:`. Pakai scope modul kalau relevan, contoh `fix(auth): ...`, `fix(content): ...`, `chore(infra): ...`.

**Aturan PR:**
- Harian: Base = `dev`, head = `dev-zacky`. **Jangan pernah** PR dari `dev-zacky` langsung ke `main`.
- Milestone stabil: Base = `main`, head = `dev`.
- Satu PR = satu concern. Jangan campur migrasi + refactor + docs dalam satu PR besar.
- Setelah PR merged ke `dev`: `git checkout dev && git pull --ff-only origin dev && git checkout dev-zacky && git merge dev && git push origin dev-zacky` (biar branch kerja tetap sinkron di Windows maupun Debian).

---

### 12b. 🔔 WAJIB: SETELAH `git push` → LANGSUNG INGATKAN PR + KASIH JUDUL & BODY

> **Aturan ini lahir dari kesalahan nyata (18 Okt 2026):** commit & push sudah jalan, tapi PR lupa
> dibuat. Akibatnya pekerjaan menumpuk di `dev-zacky` dan tidak masuk `dev`.

Setiap kali selesai `git push origin dev-zacky`, AI agent **WAJIB** langsung melakukan **5 hal** —
tanpa diminta, tanpa menunggu pertanyaan berikutnya:

| # | Wajib dilakukan |
|---|---|
| 1 | **Ingatkan eksplisit** — bukan sekadar menyebut. Contoh: *"⚠️ Sudah di-push. **Sekarang buka PR**: `dev-zacky` → `dev`."* |
| 2 | **Kasih link siap klik** → `https://github.com/AchmadZackyGZ/Fluids/compare/dev...dev-zacky?expand=1` |
| 3 | **Kasih JUDUL PR** dalam blok kode (tinggal copy-paste) |
| 4 | **Kasih BODY PR** dalam blok `markdown` lengkap (template di 12c) |
| 5 | **Sebut jumlah commit** yang akan masuk — jalankan `git log --oneline origin/dev..origin/dev-zacky` |

**Larangan keras:**
- ❌ Menutup respons dengan "selesai" tanpa menyebut PR.
- ❌ Judul/body PR generik (`update`, `fix bug`, `dev-zacky`) — judul harus menjelaskan **apa yang berubah**.
- ❌ Menganggap `push` = selesai. **Push belum selesai sampai PR dibuat.**
- ❌ Body PR yang hanya memuji hasil — sebutkan juga yang **belum** dikerjakan.

**Format judul PR:**
```
<tipe>(<scope>): <hasil, bukan aktivitas>
```

| ❌ Salah | ✅ Benar |
|---|---|
| `dev-zacky` | `feat(auth): complete auth flows (Step A–D)` |
| `update code` | `fix(logger): stop password leak in structured logs` |
| `fix bug` | `fix(user): map PasswordHash so change-password works` |

**Checklist sebelum klik "Create pull request":**
- [ ] Base = `dev`, compare = `dev-zacky`
- [ ] Judul spesifik (bukan nama branch)
- [ ] Body menyebut cara **verifikasi** (perintah + hasil)
- [ ] Body menyebut yang **belum** dikerjakan
- [ ] Daftar "files changed" bersih — tidak ada `.env`, `podman-error.txt`, atau file pribadi

---

### 12c. Template body PR

```markdown
## Ringkasan
<2–3 kalimat: masalahnya apa, apa yang diubah>

## Perubahan
- **<area>**: <poin konkret>
- ...

## Verifikasi
- [ ] `go build ./...` exit 0
- [ ] `gofmt -l` bersih pada file yang diubah
- [ ] <uji manual: perintah + hasil yang diamati>

## Catatan
- <yang belum dikerjakan / risiko / keputusan yang perlu direview>
```


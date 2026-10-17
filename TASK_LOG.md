# TASK_LOG.md — Riwayat Task Selesai (FLUIDS)

> **Peran dokumen ini:** catatan kronologis **setiap task yang sudah selesai** — apa yang
> dikerjakan, kenapa, bukti verifikasinya, dan commit-nya. Tujuannya supaya tidak ada
> pekerjaan yang diulang dan supaya progres bisa ditunjukkan ke recruiter/reviewer.
>
> **Bedanya dengan dokumen lain:**
> - `TODO.md` → apa yang **akan** dikerjakan (checklist ke depan)
> - `TASK_LOG.md` (**file ini**) → apa yang **sudah** dikerjakan (riwayat ke belakang)
> - `PLAN.md` → keputusan arsitektur + roadmap
> - `ARCHITECTURE_DOCUMENTATION.md` → referensi teknis aktual
> - `AGENTS.md` → aturan kerja + jebakan

---

## ⚙️ PROTOKOL WAJIB (untuk AI agent — jangan dilanggar)

Setiap kali pemilik project melaporkan **"task selesai"** dan minta konfirmasi, AI agent **WAJIB** menempuh 5 langkah ini secara berurutan:

| # | Langkah | Detail |
|---|---|---|
| 1 | **Review ke sumber aktual** | Baca kodenya langsung. Jangan percaya laporan/checklist. Jalankan `go build ./...`, `gofmt -l`. |
| 2 | **Perbaiki kalau ada yang salah** | Termasuk formatting (`gofmt -w` **hanya** file yang disentuh), sentinel error yang salah, query yang tidak aman. |
| 3 | **Commit per concern** | Jangan `git add .`. Satu concern = satu commit. Format Conventional Commits. |
| 4 | **Push ke `dev-zacky`** | **Jangan pernah** push langsung ke `dev` / `staging` / `main`. |
| 5 | **Update file ini** | Tambah entri baru di bagian "Detail per task" + baris di tabel Ringkasan. |

Kalau ada **keputusan arsitektur** atau **jebakan baru** yang ditemukan → update juga `PLAN.md` / `AGENTS.md` / `MEMORY.md`.

**Setelah PR merged**, jalankan sinkronisasi:
```bash
git checkout dev && git pull
git checkout dev-zacky && git merge dev
```
> ⚠️ Setelah `git merge dev`, VS Code **akan** menampilkan "Push N commits" — itu **normal dan aman**.
> Yang di-push adalah merge commit dari PR yang sudah ada di `dev`. Lihat catatan di T-017.

---

## Legenda

| Simbol | Arti |
|---|---|
| ✅ | Selesai & **terverifikasi ke kode** (build pass + dicek manual) |
| 🟡 | Sebagian — ada kode tapi masih stub / belum terverifikasi |
| ❌ | Dibatalkan / di-revert |
| 🔴 | Pernah salah ditandai selesai, sudah dikoreksi |

---

## Ringkasan

| ID | Tanggal | Task | Status | Commit | PR |
|---|---|---|---|---|---|
| T-001 | 2026-09-10 | Migrasi environment Windows → Linux | ✅ | `7f86121` | #21 |
| T-002 | 2026-09-19/20 | Setup environment lokal (Podman, .env, migrate CLI, pnpm) | ✅ | — | — |
| T-003 | 2026-09-27 | Init logging management (`slog`) + buat `PLAN.md` & `TODO.md` | ✅ | `1b79b07` | #22 |
| T-004 | 2026-09-27 | `logger/middleware.go` — ambil `echo.Context` | ✅ | `7f2b5ad` | #22 |
| T-005 | 2026-09-28 | Refactor seluruh `handler.go` ke pola log konsisten | ✅ | `22fbe21` | #23 |
| T-006 | 2026-10-15 | Structured logging `slog` + context propagation (final) | ✅ | `4d00ade` | #24 |
| T-007 | 2026-10-15 | **Fix bug**: JWT middleware tidak terpasang di protected routes | ✅ | `02038bf` | #24 |
| T-008 | 2026-10-15 | Object storage kembali ke MinIO | ✅ | `77011bb` | #24 |
| T-009 | 2026-10-15 | `refactor(social)`: hapus per-module redis provider | ✅ | `bffec42` | #24 |
| T-010 | 2026-10-15 | Koreksi seluruh file `.md` (AGENTS, PLAN, TODO, GEMINI, IDEA) | ✅ | `c82d261`, `4d5fd94`, `ebcbd3f` | #25 |
| T-011 | 2026-10-16 | **Fix**: image MinIO → `ghcr.io/coollabsio/minio` | ✅ | `022c76f` | #26 |
| T-012 | 2026-10-16 | Makefile: target baru (`migrate-status`, `help`, `infra-*`) | ✅ | `ff7bf98` | #26 |
| T-013 | 2026-10-16 | **Step A** — migrasi `email_verified` + `deleted_at` | ✅ | `85f8f37` | #26 |
| T-014 | 2026-10-16 | **Fix**: Makefile kompatibel `cmd.exe` | ✅ | `0233a5e` | #26 |
| T-015 | 2026-10-16 | **Step B** — buka `userContract` (3 method baru) | ✅ | `22aa2ca` | #26 |
| T-016 | 2026-10-16 | `style(user)`: apply gofmt | ✅ | `5916bed` | #26 |
| T-017 | 2026-10-17 | Sinkronisasi `dev` → `dev-zacky` setelah PR #26 merged | ✅ | `e71bb1e` | — |
| T-018 | 2026-10-17 | **Step C** — sambungkan 5 stub auth ke `userContract` | ✅ | `09c7e26` | — |
| T-019 | 2026-10-17 | 🔴 **Fix**: `PasswordHash` hilang di mapping `GetUserByID` | ✅ | `b050692` | — |
| T-020 | 2026-10-17 | **Step D** — aturan logging + hardening auth (SHA-256, index per-user, anti-panic) | ✅ | `bef1d55`, `b75a2fb`, `6cecb01` | — |

---

## Detail per task

### T-001 — Migrasi environment Windows → Linux
- **Tanggal:** 2026-09-10 · **Commit:** `7f86121` · **PR:** #21
- **Tujuan:** environment dev bisa jalan di Linux.
- **Verifikasi:** setup & config berhasil.
- **Catatan:** kemudian kembali dikerjakan di Windows (WSL) karena alasan praktis.

### T-002 — Setup environment lokal
- **Tanggal:** 2026-09-19/20 · **Status:** ✅ terverifikasi
- **Yang dikerjakan:**
  - `deploy/podman/.env` dibuat (15 variabel) — **gitignored**
  - `server/.env` dibuat dari `.env.example` — **gitignored**
  - Install `podman-compose` 1.6.0, CLI `migrate` (golang-migrate v4.20.1)
  - `go mod download` + `go build ./...` → sukses
  - `pnpm install` (143 paket) + `pnpm build` → sukses
- **Verifikasi:** 5 container UP; Postgres + `vector 0.8.6`; Redis `PING` → `PONG`;
  5 modul migrasi jalan; `register` + `login` lewat proxy `:3000/api` sukses, JWT keluar, row tersimpan.
- **Catatan:** commit untuk fase ini **tidak tercatat** di log (dikerjakan sebelum disiplin commit per-concern).

### T-003 — Init logging management + `PLAN.md` & `TODO.md`
- **Tanggal:** 2026-09-27 · **Commit:** `1b79b07` · **PR:** #22
- **Tujuan:** mulai pakai `slog` bawaan Go untuk logging terstruktur; sekaligus bikin `PLAN.md` + `TODO.md` supaya arah project terarah.
- **Catatan:** commit ini awal mula dokumen perencanaan di repo.

### T-004 — `logger/middleware.go`
- **Tanggal:** 2026-09-27 · **Commit:** `7f2b5ad` · **PR:** #22
- **Yang dikerjakan:** middleware untuk mengambil `echo.Context` lalu meneruskan ke handler.

### T-005 — Refactor seluruh handler ke pola log konsisten
- **Tanggal:** 2026-09-28 · **Commit:** `22fbe21` · **PR:** #23
- **Yang dikerjakan:** refactor log di **seluruh** `handler.go` tiap modul dengan pola "expect success" dan "expect error".

### T-006 — Structured logging `slog` + context propagation (final)
- **Tanggal:** 2026-10-15 · **Commit:** `4d00ade` · **PR:** #24
- **Yang dikerjakan:**
  - `platform/logger/logger.go` — `Init`, JSON handler + `ReplaceAttr` (`level`→`severity`, `time`→`timestamp`, tambah `source`), `SanitizeArgs()` deny-list 15 field sensitif, helper `InfoCtx`/`WarnCtx`/`ErrorCtx`
  - `platform/logger/middleware.go` — `RequestIDMiddleware`, `UserIDMiddleware`, `LoggingMiddleware`
  - Integrasi ke `cmd/api/main.go` — `logger.Init()` sebelum `fx.New()`
- **Verifikasi:** `go build ./...` exit 0; log JSON keluar dengan `request_id`.

### T-007 — 🔴 Fix bug: JWT middleware tidak terpasang
- **Tanggal:** 2026-10-15 · **Commit:** `02038bf` · **PR:** #24
- **Gejala:** `c.Get("user_id").(string)` di `Logout` / `ChangePassword` / `DeleteAccount` **panic**, bukan `401`.
- **Akar masalah:** `security.JWTMiddleWare` hanya dipasang di sebagian route `auth`.
- **Perbaikan:** route `auth` dipecah jadi dua `e.Group()` dengan prefix sama —
  `public` (register, login, refresh, forgot-password, verify-email, resend-verification, reset-password)
  dan `protected` (+ `JWTMiddleWare`: logout, change-password, account).
- **Pelajaran:** di Echo, route publik dan protected **harus** dipisah ke dua group. Kalau digabung satu group lalu `.Use(JWT)`, `/login` ikut menuntut token.

### T-008 — Object storage kembali ke MinIO
- **Tanggal:** 2026-10-15 · **Commit:** `77011bb` · **PR:** #24
- **Yang dikerjakan:** compose diubah dari SeaweedFS → MinIO; volume `minio_data`.

### T-009 — `refactor(social)`: hapus per-module redis provider
- **Tanggal:** 2026-10-15 · **Commit:** `bffec42` · **PR:** #24
- **Tujuan:** `NewRedisClient` sudah di-provide global di `main.go`, jadi provider per-modul itu duplikat.
- **Catatan:** awalnya tidak sengaja tercampur ke commit logging — dikeluarkan supaya satu commit = satu concern. Keputusan yang tepat.

### T-010 — Koreksi seluruh file `.md`
- **Tanggal:** 2026-10-15 · **Commit:** `c82d261`, `4d5fd94`, `ebcbd3f` · **PR:** #25
- **Tujuan:** selaraskan dokumen dengan visi pemilik project + hilangkan klaim palsu.
- **Temuan penting:**
  - `TODO.md` menandai `1.3.x` & `1.5.x` `[x]` padahal ada **6 `// TODO:`** di `auth/service.go`
  - `AGENTS.md` §8 bilang "BELUM DI-COMMIT" padahal sudah merged
  - `GEMINI.md` menunjuk path yang **tidak ada** (`d:/FOLDER_PROJECT_BESAR/Fluids/...`)
  - `ARCHITECTURE_DOCUMENTATION.md` berisi **penanda diff Git** yang tertinggal + arsitektur microservices yang tidak pernah ada
- **Perbaikan:** tulis ulang `ARCHITECTURE_DOCUMENTATION.md`; `AGENTS.md` +bagian 0 (aturan kerja), +8b (realitas vs dokumen), +12 (konvensi commit); `PLAN.md` +koreksi GraphQL bukan untuk mobile, +Webhook, +Observability, ADR 009–012; `TODO.md` status jujur.
- **Kendala yang dihormati:** desain `/web` **tidak diubah** (perintah eksplisit pemilik).

### T-011 — 🔴 Fix: image MinIO
- **Tanggal:** 2026-10-16 · **Commit:** `022c76f` · **PR:** #26
- **Gejala:** `podman-compose up` gagal → `unauthorized: access to the requested resource is not authorized` saat pull `quay.io/minio/minio:latest`.
- **Akar masalah:** MinIO menghapus **semua** image publiknya — Docker Hub `minio/minio` 404, dan `quay.io/minio/minio` sekarang **private**.
- **Perbaikan:** pakai community mirror `ghcr.io/coollabsio/minio:latest` (build otomatis dari source resmi, multi-arch, tanpa auth) + healthcheck.
- **Referensi:** https://github.com/minio/minio/issues/21647
- **Catatan:** Bitnami juga sudah komersial — tidak bisa dipakai gratis.
- **Sinkronisasi:** 8 referensi `quay.io/minio` di 3 file `.md` diperbaiki.

### T-012 — Makefile: target baru
- **Tanggal:** 2026-10-16 · **Commit:** `ff7bf98` · **PR:** #26
- **Yang ditambah:** variabel `COMPOSE_FILE`; target `help`, `infra-down`, `infra-logs`, `infra-status`, `migrate-status`, `migrate-create`, `build-all`; warning + delay di `clean`.

### T-013 — Step A: migrasi `email_verified` + `deleted_at`
- **Tanggal:** 2026-10-16 · **Commit:** `85f8f37` · **PR:** #26
- **File:** `server/internal/modules/user/internal/migrations/0003_add_email_verified_deleted_at.{up,down}.sql`
- **Isi:**
  - `email_verified BOOLEAN NOT NULL DEFAULT FALSE` — `DEFAULT` wajib supaya kolom `NOT NULL` bisa ditambah ke tabel yang sudah berisi data
  - `deleted_at TIMESTAMPTZ` — inti soft delete (`NULL` = aktif)
  - 2 partial index: `idx_users_deleted_at`, `idx_users_email_verified`
- **Verifikasi:**
  - `make migrate-status` → `user | 3 | f` (dirty=false)
  - `\d users` → kedua kolom + 2 index ada
- **Catatan:** **dikerjakan sendiri oleh pemilik project** (bukan AI) — sesuai mode mentor.

### T-014 — 🔴 Fix: Makefile tidak kompatibel `cmd.exe`
- **Tanggal:** 2026-10-16 · **Commit:** `0233a5e` · **PR:** #26
- **Gejala:** `make migrate-status` → `The system cannot find the path specified.` untuk tiap modul.
- **Akar masalah:** GNU Make di Windows memakai **`cmd.exe`**, bukan bash. Target versi pertama memakai `2>/dev/null` — cmd.exe tidak kenal `/dev/null`.
- **Aturan Makefile untuk environment ini:**
  - ❌ JANGAN `2>/dev/null`
  - ❌ JANGAN pipe POSIX (`grep`/`awk`/`sed`/`printf`)
  - ❌ JANGAN `sleep` → pakai `ping -n 6 127.0.0.1 > nul`
  - ✅ Abaikan error satu baris: prefix `-`
  - ✅ Baris kosong: `@echo.`
- **Perbaikan:** `migrate-status` → satu query `UNION` tanpa redirect; `migrate-create` dihapus (full POSIX); `clean` jadi aman, yang berbahaya pindah ke `destroy`; `help` tidak lagi pakai `grep`/`awk`.

### T-015 — Step B: buka `userContract`
- **Tanggal:** 2026-10-16 · **Commit:** `22aa2ca` · **PR:** #26
- **Tujuan:** akar masalah modul auth — `UserContract` hanya punya 3 method, sehingga 5 method auth jadi stub.
- **Yang dikerjakan:**
  - `contracts`: `EmailVerified` di `UserDTO` + 3 method baru (`UpdatePassword`, `UpdateEmailVerified`, `DeleteAccount`)
  - `queries`: `email_verified` ditambah ke SELECT; **filter `deleted_at IS NULL`** di semua SELECT supaya user terhapus tidak bisa login
  - `queries`: 3 query baru pakai **`:execrows`** supaya bisa deteksi 0 baris terpengaruh → `ErrUserNotFound` (bukan silent no-op)
  - `repository` + `service`: implementasi ketiganya; `rows == 0` → `ErrUserNotFound`
  - `service`: `GetUserByID` ganti `errors.New` ad-hoc → sentinel `contracts.ErrUserNotFound` (sebelumnya jatuh ke `500`, harusnya `404`)
- **Pelajaran sqlc:** sqlc mengembalikan tipe model tabel (`gen.User`) **hanya kalau query men-SELECT seluruh kolom tabel**. Tabel kini 11 kolom, query SELECT 10 → `GetUserByEmail` berubah dari `gen.User` → `gen.GetUserByEmailRow`.
- **Verifikasi:** `go build ./...` exit 0; tipe sqlc sesuai prediksi (`UpdateUserPasswordParams`, `SoftDeleteUser → int64`).
- **Catatan:** **dikerjakan sendiri oleh pemilik project**; AI hanya review + rapikan formatting.

### T-016 — `style(user)`: apply gofmt
- **Tanggal:** 2026-10-16 · **Commit:** `5916bed` · **PR:** #26
- **Temuan saat review:**
  - `service.go` — 3 blok struct literal `UserDTO` **alignment rusak** (karena `EmailVerified:` ditambah tanpa realign)
  - `postgres.go` — tidak ada newline di akhir file
  - `contracts/errors.go`, `handler.go`, `module.go` — newline / alignment
- **Perbaikan:** `gofmt -w` **hanya** pada 6 file di modul `user` (sesuai aturan `AGENTS.md` §11 — jangan `gofmt -w .`).

### T-017 — Sinkronisasi `dev` → `dev-zacky` setelah PR #26 merged
- **Tanggal:** 2026-10-17 · **Status:** ✅
- **Perintah yang dijalankan:**
  ```bash
  git checkout dev && git pull
  git checkout dev-zacky && git merge dev
  ```
- **Hasil:** `dev-zacky` sekarang berisi 5 merge commit dari `dev` (PR #22–#26).
- **⚠️ Pertanyaan yang muncul:** VS Code menampilkan **"Push 5 commits to origin/dev-zacky"** — apakah aman?
- **Jawaban: AMAN.** 5 commit itu adalah **merge commit milik PR yang sudah merged ke `dev`**:
  ```
  e71bb1e  Merge pull request #26
  119e4e2  Merge pull request #25
  59285ad  Merge pull request #24
  008873f  Merge pull request #23
  1803bb8  Merge pull request #22
  ```
  Mereka ada di `dev` tapi belum ada di `origin/dev-zacky`. Push ke `dev-zacky` **tidak mengubah `dev`** sama sekali
  — hanya menyamakan branch kerja dengan branch integrasi. Ini konsekuensi **normal** dari alur sinkronisasi.
- **Pelajaran:** "Push N commits" setelah `git merge dev` **bukan** tanda bahaya. Yang bahaya adalah kalau
  target push-nya `dev` / `staging` / `main`.

### T-018 — Step C: sambungkan 5 stub auth ke `userContract`
- **Tanggal:** 2026-10-17 · **Commit:** `09c7e26`
- **Tujuan:** 5 method di `auth/service.go` masih stub — password tidak pernah tersimpan, email tidak pernah ter-verified.
- **Yang dikerjakan:**
  - `VerifyEmail` → `userContract.UpdateEmailVerified(true)`. **Update DB dulu, baru hapus token** — kalau DB gagal, token tidak terbakar.
  - `ResetPassword` → pakai hasil hash (sebelumnya dibuang `_`), `UpdatePassword`, hapus token, revoke sesi.
  - `ChangePassword` → sama; ditambah catatan kenapa access token aktif belum di-blacklist (butuh token asli dari context).
  - `DeleteAccount` → `userContract.DeleteAccount` (soft delete) **dulu**, baru revoke sesi.
  - 2 TODO RabbitMQ → `TODO(step-f)` supaya jelas sengaja ditunda, bukan lupa.
  - **C5b** dev-only `logger.DebugCtx("dev token", "raw_token", ...)` di `RequestPasswordReset` & `ResendVerification` — agar alur bisa dites manual sebelum email worker ada. Aman: level DEBUG tidak tampil pada `LOG_LEVEL` default (`info`). **Wajib dihapus di Step F.**
- **Verifikasi end-to-end (dijalankan AI, server `LOG_LEVEL=debug`):**

| # | Endpoint | Payload | Hasil |
|---|---|---|---|
| 1 | `POST /api/v1/auth/register` | `{username, email, password:"Password123", full_name}` | 200, hash bcrypt tersimpan, `email_verified=f` |
| 2 | `POST /api/v1/auth/forgot-password` | `{email}` | 200, token masuk Redis, `raw_token` muncul di log DEBUG |
| 3 | `POST /api/v1/auth/reset-password` | `{token, new_password:"PasswordBaru456"}` | 200 — **hash DB berubah** `Li5Hmp3…` → `fWlVtza…` |
| 4 | `POST /api/v1/auth/login` (password baru) | `{email, password:"PasswordBaru456"}` | **200** |
| 5 | `POST /api/v1/auth/login` (password lama) | `{email, password:"Password123"}` | **401** |
| 6 | `POST /api/v1/auth/resend-verification` | `{email}` | 200, token di log DEBUG |
| 7 | `POST /api/v1/auth/verify-email` | `{token}` | 200 — `email_verified` **f → t** |
| 8 | `DELETE /api/v1/auth/account` | `{password}` + Bearer | 200 — `deleted_at` **terisi** |
| 9 | `POST /api/v1/auth/login` (setelah delete) | `{email, password}` | **401** |
| 10 | `PATCH /api/v1/auth/change-password` | `{current_password, new_password}` + Bearer | 200; login password baru **200**, lama **401** |

- **Catatan:** data user tes (`stepc.%@example.com`) dihapus lagi setelah pengujian.
- **Temuan sampingan (belum dikerjakan):** semua kegagalan auth dicatat `logger.ErrorCtx` di
  `auth/internal/delivery/http/handler.go` (11 tempat) — termasuk 401/404/409/429 yang **normal**.
  Seharusnya `WARN`. Kalau `ERROR` untuk salah password, alert produksi menyala terus dan tim
  berhenti mempercayainya. → kandidat task Step D.

### T-019 — 🔴 Fix: `PasswordHash` hilang di mapping `GetUserByID`
- **Tanggal:** 2026-10-17 · **Commit:** `b050692`
- **Gejala:** `DELETE /api/v1/auth/account` dan `PATCH /api/v1/auth/change-password` **selalu** gagal
  `{"error":"current password invalid"}` walau password yang dikirim benar. Login dengan password yang
  sama justru **200**.
- **Akar masalah:** `queries/users.sql` → `GetUserByID` **sudah** men-SELECT `password_hash`, dan
  `gen.GetUserByIDRow` **punya** field `PasswordHash`. Tapi `userService.GetUserByID` **tidak**
  memasukkannya ke `UserDTO` saat mapping. Jadi `UserDTO.PasswordHash` = `""`.
- **Perbaikan:** tambah `PasswordHash: u.PasswordHash` di mapping + komentar alasannya.
- **Kenapa `Login` tidak kena?** `Login` memakai `GetUserByEmail`, yang mapping-nya sudah menyertakan
  `PasswordHash`. Hanya jalur `GetUserByID` yang bocor.
- **Pelajaran:** compiler **tidak bisa** menangkap bug ini — kodenya valid, hanya nilainya kosong.
  Yang menangkapnya adalah **uji end-to-end**: login 200 tapi change-password 401 adalah kontradiksi
  yang mustahil dijelaskan selain oleh field yang hilang. **`go build` lolos ≠ aplikasi benar.**
- **Pelajaran kedua:** saat mapping struct → DTO, bandingkan **satu per satu** field query dengan field
  DTO. Field yang "ketinggalan" tidak memicu error apa pun.

### T-020 — Step D: aturan logging + hardening auth
- **Tanggal:** 2026-10-17 · **Commit:** `bef1d55` (docs), `b75a2fb` (logger), `6cecb01` (auth)
- **Latar belakang:** pemilik project menemukan **double-logging** di kode yang **saya sendiri berikan**
  (`ErrorCtx` di service **dan** handler). Sekaligus minta aturannya dikunci di `AGENTS.md`.
- **5 perbaikan:**

| # | Masalah | Perbaikan |
|---|---|---|
| 1 | `service.go` 19× `ErrorCtx` + `handler.go` 11× → satu kegagalan Redis tercatat 2 baris | Service **tidak** log error yang di-`return`; handler log **sekali** via `logAuthError()` |
| 2 | `login failed` (401) dicatat `ERROR`; `login attempt` + `login success` = 2 baris/request | `isExpectedAuthError()` → 4xx = `WARN`; `attempt` turun ke `DEBUG`; `mapError()` jadi murni tanpa log |
| 3 | `hashToken` = XOR manual 32→16 byte (collision) + **duplikat** di service & handler | `platform/security.HashToken()` SHA-256, satu sumber |
| 4 | `revokeAllUserTokens` = `SCAN refresh_token:*` seluruh keyspace (O(N)) | Redis SET `user_refresh_tokens:<userID>` (SAdd/SRem) → O(k) |
| 5 | `c.Get("user_id").(string)` & `req.Token[:8]` → **panic** | `currentUserID()` + `maskToken()` |

- **🔴 Bonus temuan — kebocoran kredensial:** deny-list `SanitizeArgs` hanya cocok **eksak**, jadi
  `current_password` & `new_password` **lolos**. Terbukti di log server:
  ```
  "current_password":"Password123"
  "new_password":"PasswordGanti789"
  ```
  Perbaikan: `isSensitiveKey()` mencocokkan **substring** (`password`, `token`, `secret`, `api_key`,
  `apikey`, `credential`, `private_key`).
- **🔴 Bonus temuan — logout tidak mencabut apa pun:** `RevokeToken()` menghash **ulang** `tokenHash`
  yang dari handler **sudah** berupa hash → key tidak pernah cocok. Sekarang pakai hash apa adanya.
- **Verifikasi (server `LOG_LEVEL=debug`):**

| Uji | Hasil |
|---|---|
| Login password salah | `401`, log `severity=WARN` (bukan ERROR) |
| `login attempt` | `severity=DEBUG` |
| Ringkasan severity run | `DEBUG 3 · INFO 5 · WARN 1 · ERROR 0` |
| `PATCH /change-password` | 200; log `"current_password":"[REDACTED]"`, `"new_password":"[REDACTED]"`; `grep Password123\|NewPass456` = **0** |
| `POST /logout` lalu `POST /refresh` dengan token yang sama | **401** (dulu tetap 200) |
| Redis index setelah login | `EXISTS=1`, `SCARD=1`, `TTL≈86400` |
| `refresh` setelah change-password | **401** (semua sesi dicabut via index) |

- **Dokumentasi:** `AGENTS.md` bagian **5b** (aturan logging lengkap: prinsip, tabel layer, tabel level,
  anti-pattern, sanitasi, pola baku handler, 7 larangan, cara verifikasi) + aturan #15 di bagian 11.
- **Pelajaran:** aturan yang hanya diucapkan di chat **mudah hilang**. Yang bertahan adalah aturan yang
  **ditulis di repo** dan **punya perintah verifikasi**. Karena itu 5b.8 berisi `Select-String` yang bisa
  dijalankan siapa pun untuk membuktikan kepatuhannya.
- **Pelajaran kedua:** saya sendiri melanggar aturan yang saya ajarkan. Review harus mengecek **kode yang
  baru ditulis**, bukan hanya kode orang lain.

---

## Template entri baru (copy-paste)

```markdown
### T-0XX — <judul singkat>
- **Tanggal:** YYYY-MM-DD · **Commit:** `<sha>` · **PR:** #NN
- **Tujuan:** <kenapa dikerjakan>
- **Yang dikerjakan:**
  - <poin>
- **Verifikasi:**
  - <bukti: perintah + hasil>
- **Pelajaran / catatan:** <opsional>
```

---

*Terakhir diperbarui: 2026-10-17 — tambahkan entri setiap task selesai & terverifikasi.*

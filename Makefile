# ============================================================================
# FLUIDS — Makefile
# ----------------------------------------------------------------------------
# ⚠️ PENTING (Windows): GNU Make di Windows memakai **cmd.exe** sebagai shell,
#    BUKAN bash. Jadi semua perintah di bawah wajib kompatibel dengan cmd.exe.
#
#    ❌ JANGAN pakai redirect `2>/dev/null`
#       -> cmd.exe error: "The system cannot find the path specified."
#    ❌ JANGAN pakai pipe POSIX (grep / awk / sed / printf) -> tidak ada di cmd.exe
#    ❌ JANGAN pakai `sleep` -> tidak ada di cmd.exe (pakai `ping -n`)
#    ✅ Untuk mengabaikan error satu baris, pakai prefix `-` (fitur make sendiri)
#    ✅ Baris kosong di cmd: `@echo.`  (bukan `@echo ""`)
#
#    `make migrate-status` pernah gagal karena melanggar aturan di atas. Sudah diperbaiki.
# ============================================================================

# Database Connection URL
DB_URL=postgres://fluids_admin:fluids_password@127.0.0.1:5436/fluids_db?sslmode=disable

# Path & nama yang dipakai berulang
COMPOSE_FILE=deploy/podman/podman-compose.dev.yml
PG_CONTAINER=fluids-postgres
PG_USER=fluids_admin
PG_DB=fluids_db

.PHONY: help dev-infra infra-down infra-logs infra-status dev-server dev-web dev-ml gen migrate-up migrate-down migrate-status build-all clean destroy

# ---------------------------------------------------------------------------
# Bantuan
# ---------------------------------------------------------------------------

help:
	@echo FLUIDS - daftar perintah
	@echo ------------------------------------------
	@echo [Infrastruktur]
	@echo   make dev-infra        Nyalakan 5 container
	@echo   make infra-status     Cek container yang jalan
	@echo   make infra-logs       Lihat log (make infra-logs svc=postgres)
	@echo   make infra-down       Matikan container (data tetap aman)
	@echo.
	@echo [Development]
	@echo   make dev-server       Backend Go + hot reload (air)
	@echo   make dev-web          Frontend Vite
	@echo.
	@echo [Database]
	@echo   make migrate-up       Jalankan semua migrasi
	@echo   make migrate-down     Rollback semua migrasi
	@echo   make migrate-status   Lihat versi migrasi tiap modul
	@echo   make gen              Generate kode SQLC
	@echo.
	@echo [Verifikasi]
	@echo   make build-all        Build backend + frontend
	@echo.
	@echo [Hati-hati]
	@echo   make clean            Matikan container (data AMAN)
	@echo   make destroy          Matikan + HAPUS SEMUA DATA

# ---------------------------------------------------------------------------
# Infrastruktur (Podman)
# ---------------------------------------------------------------------------

dev-infra:
	podman-compose -f $(COMPOSE_FILE) up -d
	@echo.
	@echo Selesai. Cek dengan: make infra-status

infra-down:
	podman-compose -f $(COMPOSE_FILE) down

infra-logs:
	podman-compose -f $(COMPOSE_FILE) logs -f $(svc)

infra-status:
	@podman ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

# ---------------------------------------------------------------------------
# Development server
# ---------------------------------------------------------------------------

dev-server:
	cd server && air

dev-web:
	cd web && npx -y pnpm@9.0.0 dev

dev-ml:
	cd ml && uv run uvicorn neonml.serving.app:app --reload --port 8000

# ---------------------------------------------------------------------------
# Database
# ---------------------------------------------------------------------------

migrate-up:
	bash server/scripts/migrate.sh up "$(DB_URL)"

migrate-down:
	bash server/scripts/migrate.sh down "$(DB_URL)"

# Satu query UNION -> satu tabel output, tanpa redirect sama sekali.
# Syarat: migrasi sudah pernah dijalankan (tabel schema_migrations_* sudah ada).
migrate-status:
	@podman exec $(PG_CONTAINER) psql -U $(PG_USER) -d $(PG_DB) -c "SELECT 'user' AS modul, version, dirty FROM schema_migrations_user UNION ALL SELECT 'content', version, dirty FROM schema_migrations_content UNION ALL SELECT 'social', version, dirty FROM schema_migrations_social UNION ALL SELECT 'notification', version, dirty FROM schema_migrations_notification UNION ALL SELECT 'reco', version, dirty FROM schema_migrations_reco ORDER BY modul;"

gen:
	@echo Generating SQLC code...
	cd server && go run github.com/sqlc-dev/sqlc/cmd/sqlc@latest generate

# ---------------------------------------------------------------------------
# Build & verifikasi
# ---------------------------------------------------------------------------

build-all:
	@echo === Backend: go build ===
	cd server && go build ./...
	@echo === Backend: go vet ===
	-cd server && go vet ./...
	@echo === Frontend: pnpm build ===
	cd web && npx -y pnpm@9.0.0 run build
	@echo.
	@echo Semua build OK.

# ---------------------------------------------------------------------------
# Berbahaya — baca dulu
# ---------------------------------------------------------------------------

clean:
	podman-compose -f $(COMPOSE_FILE) down
	@echo Container dimatikan. Data (volume) masih aman.

destroy:
	@echo ================================================================
	@echo  PERINGATAN: semua data Postgres, Redis, dan MinIO akan DIHAPUS.
	@echo  Tekan Ctrl+C dalam 5 detik untuk membatalkan...
	@echo ================================================================
	@ping -n 6 127.0.0.1 > nul
	podman-compose -f $(COMPOSE_FILE) down -v
	@echo Selesai. Semua volume dihapus.

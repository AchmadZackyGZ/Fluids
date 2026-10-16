# Database Connection URL
DB_URL=postgres://fluids_admin:fluids_password@127.0.0.1:5436/fluids_db?sslmode=disable

# Path ke file compose (dipakai berulang di target di bawah)
COMPOSE_FILE=deploy/podman/podman-compose.dev.yml

# Nama branch kerja (validasi cepat sebelum commit)
WORK_BRANCH=dev-zacky

.PHONY: help dev-infra infra-down infra-logs infra-status dev-server dev-web dev-ml gen migrate-up migrate-down migrate-status migrate-create build-all clean reset-db

## ---------------------------------------------------------------------------
## Bantuan
## ---------------------------------------------------------------------------

help: ## Tampilkan daftar perintah yang tersedia
	@echo "FLUIDS — daftar perintah:"
	@echo ""
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-18s\033[0m %s\n", $$1, $$2}'
	@echo ""
	@echo "  Contoh: make dev-infra  ->  make migrate-up"

## ---------------------------------------------------------------------------
## Infrastruktur (Podman)
## ---------------------------------------------------------------------------

dev-infra: ## Nyalakan 5 container (postgres, redis, rabbitmq, kafka, minio)
	podman-compose -f $(COMPOSE_FILE) up -d
	@echo ""
	@echo "Menunggu Postgres siap..."
	@sleep 3
	@podman exec fluids-postgres pg_isready -U fluids_admin -d fluids_db || echo "Postgres belum siap, tunggu beberapa detik lagi."

infra-down: ## Matikan container (volume/data TETAP aman)
	podman-compose -f $(COMPOSE_FILE) down

infra-logs: ## Lihat log semua container (ikuti dengan: make infra-logs svc=postgres)
	podman-compose -f $(COMPOSE_FILE) logs -f $(svc)

infra-status: ## Cek container yang sedang jalan
	podman ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

## ---------------------------------------------------------------------------
## Development server
## ---------------------------------------------------------------------------

dev-server: ## Jalankan backend Go dengan hot-reload (air)
	cd server && air

dev-web: ## Jalankan frontend Vite
	cd web && npx -y pnpm@9.0.0 dev

dev-ml: ## Jalankan ML service (belum disetup)
	cd ml && uv run uvicorn neonml.serving.app:app --reload --port 8000

## ---------------------------------------------------------------------------
## Database
## ---------------------------------------------------------------------------

migrate-up: ## Jalankan semua migrasi (urutan: user -> content -> social -> notification -> reco)
	bash server/scripts/migrate.sh up "$(DB_URL)"

migrate-down: ## Rollback semua migrasi (urutan dibalik)
	bash server/scripts/migrate.sh down "$(DB_URL)"

migrate-status: ## Lihat tabel tracking migrasi tiap modul
	@echo "=== schema_migrations_user ==="
	@podman exec fluids-postgres psql -U fluids_admin -d fluids_db -c "SELECT version, dirty FROM schema_migrations_user ORDER BY version;" 2>/dev/null || echo "(belum ada)"
	@echo "=== schema_migrations_content ==="
	@podman exec fluids-postgres psql -U fluids_admin -d fluids_db -c "SELECT version, dirty FROM schema_migrations_content ORDER BY version;" 2>/dev/null || echo "(belum ada)"
	@echo "=== schema_migrations_social ==="
	@podman exec fluids-postgres psql -U fluids_admin -d fluids_db -c "SELECT version, dirty FROM schema_migrations_social ORDER BY version;" 2>/dev/null || echo "(belum ada)"
	@echo "=== schema_migrations_notification ==="
	@podman exec fluids-postgres psql -U fluids_admin -d fluids_db -c "SELECT version, dirty FROM schema_migrations_notification ORDER BY version;" 2>/dev/null || echo "(belum ada)"
	@echo "=== schema_migrations_reco ==="
	@podman exec fluids-postgres psql -U fluids_admin -d fluids_db -c "SELECT version, dirty FROM schema_migrations_reco ORDER BY version;" 2>/dev/null || echo "(belum ada)"

## Buat file migrasi baru. Contoh:
##   make migrate-create mod=user name=add_email_verified
migrate-create: ## Buat pasangan file migrasi baru (wajib: mod=<modul> name=<nama>)
	@if [ -z "$(mod)" ] || [ -z "$(name)" ]; then \
		echo "ERROR: wajib isi mod dan name."; \
		echo "Contoh: make migrate-create mod=user name=add_email_verified"; \
		exit 1; \
	fi
	@DIR="server/internal/modules/$(mod)/internal/migrations"; \
	if [ ! -d "$$DIR" ]; then echo "ERROR: folder $$DIR tidak ada."; exit 1; fi; \
	NEXT=$$(ls "$$DIR"/*.sql 2>/dev/null | sed -E 's#.*/([0-9]+)_.*#\1#' | sort -n | tail -1); \
	NEXT=$$(printf "%04d" $$((10#$${NEXT:-0} + 1))); \
	FILE="$$DIR/$${NEXT}_$(name)"; \
	touch "$${FILE}.up.sql" "$${FILE}.down.sql"; \
	echo "Dibuat:"; echo "  $${FILE}.up.sql"; echo "  $${FILE}.down.sql"

gen: ## Generate kode SQLC dari queries/*.sql
	@echo "Generating SQLC code..."
	cd server && go run github.com/sqlc-dev/sqlc/cmd/sqlc@latest generate

## ---------------------------------------------------------------------------
## Build & verifikasi
## ---------------------------------------------------------------------------

build-all: ## Verifikasi build backend + frontend
	@echo "=== Backend: go build ==="
	cd server && go build ./...
	@echo "=== Backend: go vet ==="
	cd server && go vet ./... || echo "(go vet ada warning — review manual)"
	@echo "=== Frontend: pnpm build ==="
	cd web && npx -y pnpm@9.0.0 run build
	@echo ""
	@echo "Semua build OK."

## ---------------------------------------------------------------------------
## Berbahaya — baca dulu
## ---------------------------------------------------------------------------

clean: ## ⚠️ Matikan container + HAPUS SEMUA VOLUME (data hilang permanen)
	@echo "⚠️  Ini akan MENGHAPUS semua data Postgres/Redis/MinIO."
	@echo "    Tekan Ctrl+C dalam 5 detik untuk membatalkan..."
	@sleep 5
	podman-compose -f $(COMPOSE_FILE) down -v
	@echo "Selesai. Volume dihapus."

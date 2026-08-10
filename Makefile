# Database Connection URL
DB_URL=postgres://fluids_admin:fluids_password@127.0.0.1:5436/fluids_db?sslmode=disable

.PHONY: dev-infra dev-server dev-web dev-ml build-all gen migrate-up migrate-down clean

dev-infra:
	podman-compose -f deploy/podman/podman-compose.dev.yml up -d

dev-server:
	cd server && air

dev-web:
	cd web && pnpm dev

dev-ml:
	cd ml && uv run uvicorn neonml.serving.app:app --reload --port 8000

gen:
	@echo "Generating SQLC code..."
	cd server && go run github.com/sqlc-dev/sqlc/cmd/sqlc@latest generate

migrate-up:
	@powershell -ExecutionPolicy Bypass -File ./server/scripts/migrate.ps1 -Action up -DbUrl "$(DB_URL)"

migrate-down:
	@powershell -ExecutionPolicy Bypass -File ./server/scripts/migrate.ps1 -Action down -DbUrl "$(DB_URL)"

clean:
	podman-compose -f deploy/podman/podman-compose.dev.yml down -v
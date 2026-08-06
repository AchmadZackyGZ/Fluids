.PHONY: dev-infra dev-server dev-web dev-ml build-all gen migrate clean

dev-infra:
	podman-compose -f deploy/podman/podman-compose.dev.yml up -d

dev-server:
	cd server && go run cmd/api/main.go

dev-web:
	cd web && pnpm dev

dev-ml:
	cd ml && uv run uvicorn neonml.serving.app:app --reload --port 8000

gen:
	@echo "Generating OpenAPI, SQLC, and Orval targets..."
	cd server && oapi-codegen --config oapi-codegen.yaml ../shared/openapi/openapi.yaml
	cd server && sqlc generate
	cd web && pnpm build:api

migrate-up:
	cd server && go run cmd/tasks/main.go migrate up

clean:
	podman-compose -f deploy/podman/podman-compose.dev.yml down -v
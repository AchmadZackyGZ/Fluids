#!/bin/bash
set -e

ACTION="${1:-up}"
DB_URL="${2:-postgres://fluids_admin:fluids_password@127.0.0.1:5436/fluids_db?sslmode=disable}"

BASE_PATH="server/internal/modules"
if [ ! -d "$BASE_PATH" ]; then
    BASE_PATH="internal/modules"
fi

# Urutan dependensi wajib: user -> content -> social -> notification -> reco
if [ "$ACTION" == "down" ]; then
    # Jika rollback (down), urutan dibalik dari belakang
    MODULE_ORDER=("reco" "notification" "social" "content" "user")
else
    MODULE_ORDER=("user" "content" "social" "notification" "reco")
fi

echo -e "\e[36m[INFO] Scanning module migrations in order: ${MODULE_ORDER[*]}\e[0m"

for MODULE_NAME in "${MODULE_ORDER[@]}"; do
    MIGRATION_PATH="$BASE_PATH/$MODULE_NAME/internal/migrations"

    if [ -d "$MIGRATION_PATH" ] && compgen -G "$MIGRATION_PATH/*.sql" > /dev/null; then
        SEP="?"
        if [[ "$DB_URL" == *"?"* ]]; then
            SEP="&"
        fi
        MODULE_DB_URL="${DB_URL}${SEP}x-migrations-table=schema_migrations_${MODULE_NAME}"

        echo -e "\e[33m[MIGRATE] Running [$ACTION] for module [$MODULE_NAME] -> $MIGRATION_PATH\e[0m"
        migrate -path "$MIGRATION_PATH" -database "$MODULE_DB_URL" "$ACTION"
    fi
done

echo -e "\e[32m[SUCCESS] All module database migrations completed!\e[0m"
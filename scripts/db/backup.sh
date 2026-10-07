#!/usr/bin/env bash
# Dump the database to backups/<timestamp>.sql.gz
# Usage: scripts/db/backup.sh [compose-file]
set -euo pipefail
cd "$(dirname "$0")/../.."

COMPOSE="${1:-infrastructure/compose/docker-compose.dev.yml}"
mkdir -p backups
FILE="backups/pdas-$(date +%Y%m%d-%H%M%S).sql.gz"

docker compose -f "$COMPOSE" exec -T postgres sh -c 'pg_dump -U "$POSTGRES_USER" "$POSTGRES_DB"' | gzip > "$FILE"
echo "✔ $FILE"

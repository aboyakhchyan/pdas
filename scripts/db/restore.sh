#!/usr/bin/env bash
# Restore a dump created by backup.sh. DESTRUCTIVE for the target database.
# Usage: scripts/db/restore.sh backups/<file>.sql.gz [compose-file]
set -euo pipefail
cd "$(dirname "$0")/../.."

FILE="${1:?usage: restore.sh <file.sql.gz> [compose-file]}"
COMPOSE="${2:-infrastructure/compose/docker-compose.dev.yml}"

read -r -p "Restore $FILE into $COMPOSE postgres? [y/N] " ok
[ "$ok" = "y" ] || exit 1

gunzip -c "$FILE" | docker compose -f "$COMPOSE" exec -T postgres sh -c 'psql -U "$POSTGRES_USER" "$POSTGRES_DB"'
echo "✔ restored"

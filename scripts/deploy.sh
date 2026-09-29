#!/usr/bin/env bash
# Deploy a tagged release to the production server via docker compose.
# Usage: DEPLOY_HOST=deploy@1.2.3.4 scripts/deploy.sh <tag>
set -euo pipefail
cd "$(dirname "$0")/.."

TAG="${1:?usage: deploy.sh <tag>}"
HOST="${DEPLOY_HOST:?set DEPLOY_HOST, e.g. deploy@1.2.3.4}"
DIR="${DEPLOY_DIR:-/opt/hyework}"
COMPOSE="infrastructure/compose/docker-compose.prod.yml"

rsync -azR "$COMPOSE" infrastructure/nginx "$HOST:$DIR/"

ssh "$HOST" "cd $DIR && \
  TAG=$TAG docker compose -f $COMPOSE pull && \
  TAG=$TAG docker compose -f $COMPOSE up -d --remove-orphans && \
  docker image prune -f"

echo "✔ deployed $TAG to $HOST"

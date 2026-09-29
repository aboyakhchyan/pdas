#!/usr/bin/env bash
# Generate typed API clients from the running API's OpenAPI spec.
set -euo pipefail
cd "$(dirname "$0")/.."

API_URL="${API_URL:-http://localhost:4000}"
OUT=packages/api-client

curl -fsS "$API_URL/docs/openapi.json" -o "$OUT/openapi.json"
echo "✔ fetched spec"

(cd "$OUT" && pnpm dlx @hey-api/openapi-ts -i openapi.json -o src/generated)
echo "✔ TypeScript client → $OUT/src/generated"

if command -v openapi-generator-cli >/dev/null; then
  openapi-generator-cli generate -i "$OUT/openapi.json" -g dart-dio -o apps/mobile/packages/api_client
  echo "✔ Dart client → apps/mobile/packages/api_client"
else
  echo "openapi-generator-cli not found — skipping Dart client"
fi

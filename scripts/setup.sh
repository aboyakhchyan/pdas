#!/usr/bin/env bash
# First-time local setup.
set -euo pipefail
cd "$(dirname "$0")/.."

corepack enable
pnpm install

for example in apps/*/.env.example; do
  target="${example%.example}"
  [ -f "$target" ] || { cp "$example" "$target"; echo "created $target"; }
done

pnpm infra:up

if [ "$(uname)" = "Darwin" ] && command -v pod >/dev/null; then
  pnpm --filter @pdas/mobile pods
else
  echo "CocoaPods not found — skipping iOS pods"
fi

echo "✔ Ready. Run: pnpm dev"

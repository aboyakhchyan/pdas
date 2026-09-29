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

if command -v flutter >/dev/null; then
  (cd apps/mobile && flutter pub get)
else
  echo "flutter not found — skipping mobile setup"
fi

echo "✔ Ready. Run: pnpm dev"

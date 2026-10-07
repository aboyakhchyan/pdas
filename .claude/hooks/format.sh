#!/usr/bin/env bash
# Auto-format a file after Claude edits it. Never blocks Claude (always exits 0).
command -v jq >/dev/null || exit 0
f=$(jq -r '.tool_input.file_path // empty')
[ -z "$f" ] || [ ! -f "$f" ] && exit 0
case "$f" in
  *.ts|*.tsx|*.js|*.mjs|*.json|*.css|*.md|*.yml|*.yaml)
    cd "$CLAUDE_PROJECT_DIR" && pnpm exec prettier --write --ignore-unknown "$f" >/dev/null 2>&1 ;;
esac
exit 0

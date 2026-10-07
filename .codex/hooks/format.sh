#!/usr/bin/env bash
# Formats files Codex changed with apply_patch. Never blocks Codex (always exits 0).
# apply_patch has no file_path field: paths are read from the patch headers in tool_input.command.
command -v jq >/dev/null || exit 0
root=$(git rev-parse --show-toplevel 2>/dev/null) || exit 0

jq -r '.tool_input.command // empty' |
    sed -n -E 's/^\*\*\* (Add File|Update File|Move to): (.+)$/\2/p' |
    while IFS= read -r file; do
        case "$file" in
            /*) path=$file ;;
            *) path=$PWD/$file ;;
        esac
        [ -f "$path" ] || continue
        case "$path" in
            *.ts | *.tsx | *.js | *.mjs | *.json | *.css | *.md | *.yml | *.yaml)
                (cd "$root" && pnpm exec prettier --write --ignore-unknown "$path" >/dev/null 2>&1) ;;
        esac
    done

exit 0

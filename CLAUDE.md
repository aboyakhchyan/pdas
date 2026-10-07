@AGENTS.md

## Claude Code

Project instructions live in `AGENTS.md` (shared with Codex) — edit them there, not here. This
section holds only what is specific to Claude Code.

- Path-scoped rules in `.claude/rules/` load automatically when you read or edit matching files:
  `api/` (one file per DDD layer, with code templates), `core-contracts.md`, `testing.md`.
- Skills: `/nest-module` (new bounded context), `/nest-use-case` (new endpoint or use case in an
  existing context), `/db-migration`, `/next-feature`, `/mobile-feature`, `/ship-check`.
- Subagents: `backend-architect`, `frontend-engineer`, `mobile-engineer`; run `code-reviewer`
  after a non-trivial change.
- A PostToolUse hook formats every edited file with Prettier — don't run Prettier by hand.
- Look up library docs (NestJS, Next.js, firebase-admin, zod) with the context7 MCP server before
  relying on memory; versions here are newer than most training data.

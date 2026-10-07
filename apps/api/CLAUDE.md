@AGENTS.md

## Claude Code

- The layer templates in `.claude/rules/api/` load automatically when you touch files of that
  layer — follow them instead of inventing a new shape.
- New bounded context → `/nest-module`. New endpoint or use case in an existing context →
  `/nest-use-case`. Firestore shape or index change → `/db-migration`.
- For design questions across contexts (events, queues, AI/PDF pipeline) delegate to the
  `backend-architect` subagent; finish non-trivial changes with `code-reviewer`.

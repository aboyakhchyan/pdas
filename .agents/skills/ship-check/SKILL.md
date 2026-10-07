---
name: ship-check
description: Run all quality checks on the monorepo (lint, typecheck, test) and summarize failures without fixing them.
---

# Ship check

Run `pnpm check`.

Summarize: which packages failed, the first error of each, and a proposed fix. Do not fix
anything unless the user asks.

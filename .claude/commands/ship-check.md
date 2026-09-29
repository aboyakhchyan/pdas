---
description: Run all quality checks on the monorepo and summarize failures
---
Run `pnpm check`. If `apps/mobile` changed (`git diff --name-only`), also run
`flutter analyze && flutter test` in apps/mobile.

Summarize: which packages failed, the first error of each, and a proposed fix. Do not fix anything
unless I ask.

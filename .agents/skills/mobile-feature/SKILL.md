---
name: mobile-feature
description: Add a new feature or screen to the React Native app in apps/mobile (feature-first folders, api-client, i18n, navigation).
---

# New feature / screen in apps/mobile

Read `apps/mobile/AGENTS.md` first.

1. Create `apps/mobile/src/features/<feature>/{api,model,screens,components}/`.
2. `api/` — calls through `@pdas/api-client`, types from `@pdas/core`.
3. `model/` — hooks and state for the feature; no UI here.
4. `screens/` + `components/` — UI only, consumes the model hooks. Strings via i18n
   (`src/shared/i18n/messages/{hy,en,ru}/<namespace>.json`).
5. Register the screen in the navigator under `src/app/`.
6. Run `pnpm --filter @pdas/mobile lint typecheck test`.

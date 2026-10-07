---
name: mobile-feature
description: Add a new feature/screen to the React Native app in apps/mobile.
---

1. Create `apps/mobile/src/features/<feature>/{api,model,screens,components}/`.
2. `api/` — calls through `@pdas/api-client`, types from `@pdas/core`.
3. `model/` — hooks and state for the feature; no UI here.
4. `screens/` + `components/` — UI only, consumes the model hooks. Strings via i18n (hy, en, ru).
5. Register the screen in the navigator under `src/app/`.
6. Run `pnpm --filter @pdas/mobile lint typecheck test`.

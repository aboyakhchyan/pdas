# apps/mobile — React Native (iOS / Android)

React Native latest stable, TypeScript strict.

- Feature-first: `src/features/<feature>/{api,model,screens,components}/`.
- `src/app/` — app root, navigation, theme. `src/shared/` — network, storage, i18n (`src/shared/i18n/messages/<locale>/<namespace>.json`), ui primitives.
- Types and validation from `@pdas/core`; HTTP only through `@pdas/api-client`.
- i18n: hy (default), en, ru — no hardcoded strings.
- Documents are PDF only: view in-app, share/save as PDF.
- Auth via Firebase Auth (planned, not integrated yet).
- API base URL from env config, never hardcoded.
- Before finishing: `pnpm --filter @pdas/mobile lint typecheck test`.

---
name: next-feature
description: Add a new page/feature to apps/web or apps/admin following the repo structure.
---

Read `apps/web/AGENTS.md` (and `apps/admin/AGENTS.md` for admin) first.

1. Route file in `src/app/[locale]/<route>/page.tsx` — keep it thin, only compose feature
   components.
2. Feature code in `src/features/<feature>/` (components, hooks, server actions, queries).
3. Shared components used by web and admin go to `packages/ui/src/` and export from its index.
   Icons only through `@pdas/ui/icons`.
4. Messages: `messages/{hy,en,ru}/<namespace>.json` and add the namespace to `NAMESPACES` in
   `src/i18n/request.ts`. No hardcoded strings.
5. Add `generateMetadata` for public pages; private pages are `noindex`.
6. Run `pnpm turbo run lint typecheck test --filter=@pdas/<web|admin>...`.

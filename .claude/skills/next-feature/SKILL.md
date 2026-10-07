---
name: next-feature
description: Add a new page/feature to apps/web or apps/admin following the repo structure.
---
1. Route file in `src/app/<route>/page.tsx` — keep it thin, only compose feature components.
2. Feature code in `src/features/<feature>/` (components, hooks, server actions, queries).
3. Shared components used by web and admin go to `packages/ui/src/` and export from its index.
4. Add `generateMetadata` for public pages.
5. Run `pnpm --filter @pdas/<web|admin>... check`.

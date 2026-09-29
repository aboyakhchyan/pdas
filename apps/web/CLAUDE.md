# apps/web — public site (hyework.am)

Next.js 16 App Router, React 19, Tailwind 4. Port 3000.

- `src/app/` — routes only, keep thin. `src/features/<feature>/` — feature code.
- `src/components/` — app-specific components; shared with admin → `packages/ui`.
- SEO matters: public pages (job, freelancer profile) are Server Components with `generateMetadata`.
- i18n via next-intl: locales hy (default, no URL prefix), ru, en under `src/app/[locale]/`.
  Messages live in `messages/<locale>/<namespace>.json` — one file per feature/page per locale
  (e.g. `messages/en/home.json`), not one giant file. New page → create `<namespace>.json` under
  `hy/`, `ru/`, `en/` and add `"<namespace>"` to the `NAMESPACES` array in `src/i18n/request.ts`
  (they get merged into one `messages` object at request time). Use `useTranslations()` and the
  locale-aware `Link`/`useRouter`/`redirect` from `src/i18n/navigation.ts` (never `next/link`,
  `next/navigation`).
- Icons: `import { Icon, SearchIcon } from "@hyework/ui/icons"` — never import
  `@hugeicons/core-free-icons` or `@hugeicons/react` directly. Missing icon → add it to
  `packages/ui/src/icons/index.ts` first (see that file's header comment), then use it here.
- API calls via `@hyework/api-client`; base URL from `NEXT_PUBLIC_API_URL`.

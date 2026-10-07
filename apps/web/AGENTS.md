# apps/web — public site (pdas.am)

Next.js 16 App Router, React 19, Tailwind 4. Port 3000.

- `src/app/` — routes only, keep thin. `src/features/<feature>/` — feature code.
- `src/components/` — app-specific components; shared with admin → `packages/ui`.
- SEO matters: public pages (document catalog, document type pages, guides) are Server Components
  with `generateMetadata`. The user's own documents are private and `noindex`.
- Documents are PDF only: preview in the browser, download as PDF. No other export formats.
- i18n via next-intl: locales hy (default, no URL prefix), en, ru under `src/app/[locale]/`.
  Messages live in `messages/<locale>/<namespace>.json` — one file per feature/page per locale
  (e.g. `messages/en/home.json`), not one giant file. New page → create `<namespace>.json` under
  `hy/`, `en/`, `ru/` and add `"<namespace>"` to the `NAMESPACES` array in `src/i18n/request.ts`
  (they get merged into one `messages` object at request time). Use `useTranslations()` and the
  locale-aware `Link`/`useRouter`/`redirect` from `src/i18n/navigation.ts` (never `next/link`,
  `next/navigation`).
- Icons: `import { Icon, SearchIcon } from "@pdas/ui/icons"` — never import
  `@hugeicons/core-free-icons` or `@hugeicons/react` directly. Missing icon → add it to
  `packages/ui/src/icons/index.ts` first, then use it here.
- API calls via `@pdas/api-client`; base URL from `NEXT_PUBLIC_API_URL`.

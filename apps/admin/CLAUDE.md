# apps/admin — admin panel (admin.hyework.am)

Next.js 16 App Router, React 19, Tailwind 4. Port 3001.

- Internal tool: no SEO, `robots: noindex`. Every route must require an admin session.
- Moderation, disputes, payouts, user management. Destructive actions need a confirm dialog + audit log.
- Same folder conventions as apps/web, including i18n via next-intl and icons via
  `@hyework/ui/icons` (see apps/web/CLAUDE.md).

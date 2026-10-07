# apps/admin — admin panel (admin.pdas.am)

Next.js 16 App Router, React 19, Tailwind 4. Port 3001.

- Internal tool: no SEO, `robots: noindex`. Every route requires the `admin` role.
- Manages document types and versioned templates, legal sources (hartak.am, moj.gov.am),
  users and roles, AI generation logs and quality review of generated PDFs.
- Publishing a template version or a legal source change is audited. Destructive actions need a
  confirm dialog + audit log.
- Same folder conventions as apps/web, including i18n via next-intl and icons via
  `@pdas/ui/icons` (see apps/web/AGENTS.md).

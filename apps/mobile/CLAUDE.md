# apps/mobile — Flutter (iOS / Android)

Riverpod (state), go_router (navigation), dio (HTTP).

- Feature-first: `lib/features/<feature>/{data,domain,presentation}/`
- `lib/app/` — app root, router, theme. `lib/core/` — network, storage, errors.
- Always `package:hyework_mobile/...` imports (no relative imports).
- API base URL via `--dart-define=API_URL=...`.
- Planned: Dart API client generated from OpenAPI (`pnpm gen:api`).
- Before finishing: `flutter analyze && flutter test`.

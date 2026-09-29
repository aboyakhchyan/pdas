---
name: flutter-feature
description: Add a new feature/screen to the Flutter app in apps/mobile.
---
1. Create `apps/mobile/lib/features/<feature>/{data,domain,presentation}/`.
2. `data/` — repository using the dio provider from `lib/core/network/api_client.dart`.
3. `domain/` — models (immutable) and use-case providers.
4. `presentation/` — screens and widgets that `ref.watch` providers.
5. Register the route in `lib/app/router.dart`.
6. Run `flutter analyze && flutter test` in apps/mobile.

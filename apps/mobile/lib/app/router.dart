import 'package:go_router/go_router.dart';
import 'package:hyework_mobile/features/home/presentation/home_screen.dart';

final router = GoRouter(
  routes: [
    GoRoute(path: '/', builder: (context, state) => const HomeScreen()),
  ],
);

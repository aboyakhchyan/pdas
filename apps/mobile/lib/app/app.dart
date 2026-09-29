import 'package:flutter/material.dart';
import 'package:hyework_mobile/app/router.dart';

class HyeWorkApp extends StatelessWidget {
  const HyeWorkApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp.router(
      title: 'HyeWork',
      theme: ThemeData(colorSchemeSeed: const Color(0xFF2563EB), useMaterial3: true),
      routerConfig: router,
    );
  }
}

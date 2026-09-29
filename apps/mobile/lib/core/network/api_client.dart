import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

/// Override with: flutter run --dart-define=API_URL=https://api.hyework.am/v1
/// 10.0.2.2 = host machine from the Android emulator.
const apiUrl = String.fromEnvironment('API_URL', defaultValue: 'http://10.0.2.2:4000/v1');

final dioProvider = Provider<Dio>((ref) {
  return Dio(
    BaseOptions(
      baseUrl: apiUrl,
      connectTimeout: const Duration(seconds: 10),
      receiveTimeout: const Duration(seconds: 20),
    ),
  );
});

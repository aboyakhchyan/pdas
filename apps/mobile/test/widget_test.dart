import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:hyework_mobile/app/app.dart';

void main() {
  testWidgets('shows home screen', (tester) async {
    await tester.pumpWidget(const ProviderScope(child: HyeWorkApp()));
    await tester.pumpAndSettle();
    expect(find.text('HyeWork'), findsOneWidget);
  });
}

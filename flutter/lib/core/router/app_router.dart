import 'package:go_router/go_router.dart';
import 'package:real_estate_app/features/auth/presentation/pages/confim_email_page.dart';
import 'package:real_estate_app/features/auth/presentation/pages/forget_password_page.dart';

import '../../features/auth/presentation/pages/login_page.dart';
import '../../features/auth/presentation/pages/register_page.dart';
import '../../features/auth/presentation/pages/reset_password_page.dart';
import '../../features/auth/presentation/pages/reset_success_page.dart';
import '../../features/navigation/presentation/pages/main_navigation_page.dart';
import '../../features/splash/presentation/pages/splash_page.dart';

class AppRouter {
  AppRouter._();

  static final GoRouter router = GoRouter(
    initialLocation: '/splash',
    routes: [
      GoRoute(path: '/splash', builder: (context, state) => const SplashPage()),
      GoRoute(path: '/login', builder: (context, state) => const LoginPage()),
      GoRoute(
          path: '/register', builder: (context, state) => const RegisterPage()),
      GoRoute(
        path: '/confirm-email',
        builder: (context, state) =>
            ConfirmEmailPage(email: state.extra as String? ?? ''),
      ),
      GoRoute(
          path: '/forgot-password',
          builder: (context, state) => const ForgotPasswordPage()),
      GoRoute(
          path: '/reset-password',
          builder: (context, state) => const ResetPasswordPage()),
      GoRoute(
          path: '/reset-success',
          builder: (context, state) => const ResetSuccessPage()),
      GoRoute(
          path: '/home',
          builder: (context, state) => const MainNavigationPage()),
    ],
  );
}

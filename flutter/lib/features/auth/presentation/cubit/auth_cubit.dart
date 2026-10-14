import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:real_estate_app/features/auth/domain/usecases/forgot_password_usecase.dart';
import 'package:real_estate_app/features/auth/domain/usecases/resend_confirmation_usecase.dart';
import 'package:real_estate_app/features/auth/domain/usecases/reset_password_usecase.dart';

import '../../domain/entities/user_entity.dart';
import '../../domain/usecases/confirm_email_usecase.dart';
import '../../domain/usecases/get_persisted_user_usecase.dart';
import '../../domain/usecases/login_usecase.dart';
import '../../domain/usecases/register_usecase.dart';
import 'auth_state.dart';

class AuthCubit extends Cubit<AuthState> {
  final LoginUseCase loginUseCase;
  final RegisterUseCase registerUseCase;
  final ConfirmEmailUseCase confirmEmailUseCase;
  final GetPersistedUserUseCase getPersistedUserUseCase;
  final ResendConfirmationUseCase resendConfirmationUseCase;
  final ForgotPasswordUseCase forgotPasswordUseCase;
  final ResetPasswordUseCase resetPasswordUseCase;

  AuthCubit({
    required this.loginUseCase,
    required this.registerUseCase,
    required this.confirmEmailUseCase,
    required this.getPersistedUserUseCase,
    required this.resendConfirmationUseCase,
    required this.forgotPasswordUseCase,
    required this.resetPasswordUseCase,
  }) : super(AuthInitial());

  Future<void> login({required String email, required String password}) async {
    emit(AuthLoading());
    final result =
        await loginUseCase(LoginParams(email: email, password: password));
    result.fold(
      (failure) => emit(AuthError(failure.message)),
      (user) => emit(AuthAuthenticated(user)),
    );
  }

  Future<void> register({
    required String username,
    required String email,
    required String password,
    required UserRole role,
  }) async {
    emit(AuthLoading());
    final result = await registerUseCase(
      RegisterParams(
          username: username, email: email, password: password, role: role),
    );
    result.fold(
      (failure) => emit(AuthError(failure.message)),
      (message) =>
          emit(AuthRegistrationPending(email: email, message: message)),
    );
  }

  Future<void> confirmEmail(
      {required String email, required String otp}) async {
    emit(AuthLoading());
    final result =
        await confirmEmailUseCase(ConfirmEmailParams(email: email, otp: otp));
    result.fold(
      (failure) => emit(AuthError(failure.message)),
      (message) => emit(AuthEmailConfirmed(message)),
    );
  }

  Future<void> resendConfirmation({required String email}) async {
    emit(AuthLoading());
    final result = await resendConfirmationUseCase(EmailParams(email));
    result.fold(
      (failure) => emit(AuthError(failure.message)),
      (message) => emit(AuthOtpResent(message)),
    );
  }

  Future<void> forgotPassword({required String email}) async {
    emit(AuthLoading());
    final result = await forgotPasswordUseCase(EmailParams(email));
    result.fold(
      (failure) => emit(AuthError(failure.message)),
      (message) =>
          emit(AuthForgotPasswordOtpSent(email: email, message: message)),
    );
  }

  Future<void> resetPassword({
    required String email,
    required String otp,
    required String newPassword,
  }) async {
    emit(AuthLoading());
    final result = await resetPasswordUseCase(
        ResetPasswordParams(email: email, otp: otp, newPassword: newPassword));
    result.fold(
      (failure) => emit(AuthError(failure.message)),
      (message) => emit(AuthPasswordResetSuccess(message)),
    );
  }

  Future<void> checkAuthStatus() async {
    emit(AuthLoading());
    final user = await getPersistedUserUseCase();
    if (user != null) {
      emit(AuthAuthenticated(user));
    } else {
      emit(AuthUnauthenticated());
    }
  }
}

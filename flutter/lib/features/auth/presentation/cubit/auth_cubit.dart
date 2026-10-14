import 'package:flutter_bloc/flutter_bloc.dart';

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

  AuthCubit({
    required this.loginUseCase,
    required this.registerUseCase,
    required this.confirmEmailUseCase,
    required this.getPersistedUserUseCase,
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

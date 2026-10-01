import 'package:flutter_bloc/flutter_bloc.dart';
import '../../../../core/usecase/usecase.dart';
import '../../domain/usecases/get_current_user_usecase.dart';
import '../../domain/usecases/login_usecase.dart';
import '../../domain/usecases/register_usecase.dart';
import 'auth_state.dart';

class AuthCubit extends Cubit<AuthState> {
  final LoginUseCase loginUseCase;
  final RegisterUseCase registerUseCase;
  final GetCurrentUserUseCase getCurrentUserUseCase;

  AuthCubit({
    required this.loginUseCase,
    required this.registerUseCase,
    required this.getCurrentUserUseCase,
  }) : super(AuthInitial());

  Future<void> login({required String email, required String password}) async {
    emit(AuthLoading());
    final result = await loginUseCase(LoginParams(email: email, password: password));
    result.fold(
      (failure) => emit(AuthError(failure.message)),
      (user) => emit(AuthAuthenticated(user)),
    );
  }

  Future<void> register({required String name, required String email, required String password}) async {
    emit(AuthLoading());
    final result = await registerUseCase(RegisterParams(name: name, email: email, password: password));
    result.fold(
      (failure) => emit(AuthError(failure.message)),
      (user) => emit(AuthAuthenticated(user)),
    );
  }

  Future<void> checkAuthStatus() async {
    emit(AuthLoading());
    final result = await getCurrentUserUseCase(const NoParams());
    result.fold(
      (failure) => emit(AuthUnauthenticated()),
      (user) => emit(AuthAuthenticated(user)),
    );
  }
}

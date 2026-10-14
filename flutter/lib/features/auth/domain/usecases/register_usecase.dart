import 'package:dartz/dartz.dart';
import 'package:equatable/equatable.dart';

import '../../../../core/error/failures.dart';
import '../../../../core/usecase/usecase.dart';
import '../entities/user_entity.dart';
import '../repositories/auth_repository.dart';

class RegisterUseCase implements UseCase<String, RegisterParams> {
  final AuthRepository repository;
  RegisterUseCase(this.repository);

  @override
  Future<Either<Failure, String>> call(RegisterParams params) {
    return repository.register(
      username: params.username,
      email: params.email,
      password: params.password,
      role: params.role,
    );
  }
}

class RegisterParams extends Equatable {
  final String username;
  final String email;
  final String password;
  final UserRole role;
  const RegisterParams({
    required this.username,
    required this.email,
    required this.password,
    this.role = UserRole.customer,
  });

  @override
  List<Object?> get props => [username, email, password, role];
}

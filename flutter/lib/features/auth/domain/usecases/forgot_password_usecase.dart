import 'package:dartz/dartz.dart';
import 'package:equatable/equatable.dart';
import 'package:real_estate_app/core/error/failures.dart';
import 'package:real_estate_app/core/usecase/usecase.dart';
import 'package:real_estate_app/features/auth/domain/repositories/auth_repository.dart';

class ForgotPasswordUseCase implements UseCase<String, EmailParams> {
  final AuthRepository repository;
  ForgotPasswordUseCase(this.repository);

  @override
  Future<Either<Failure, String>> call(EmailParams params) =>
      repository.forgotPassword(email: params.email);
}

class EmailParams extends Equatable {
  final String email;
  const EmailParams(this.email);
  @override
  List<Object?> get props => [email];
}

import 'package:dartz/dartz.dart';
import 'package:real_estate_app/core/error/failures.dart';
import 'package:real_estate_app/core/usecase/usecase.dart';
import 'package:real_estate_app/features/auth/domain/repositories/auth_repository.dart';
import 'package:real_estate_app/features/auth/domain/usecases/forgot_password_usecase.dart';

class ResendConfirmationUseCase implements UseCase<String, EmailParams> {
  final AuthRepository repository;
  ResendConfirmationUseCase(this.repository);

  @override
  Future<Either<Failure, String>> call(EmailParams params) =>
      repository.resendConfirmation(email: params.email);
}

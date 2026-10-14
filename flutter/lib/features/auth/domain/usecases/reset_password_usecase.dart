import 'package:dartz/dartz.dart';
import 'package:equatable/equatable.dart';
import 'package:real_estate_app/core/error/failures.dart';
import 'package:real_estate_app/core/usecase/usecase.dart';
import 'package:real_estate_app/features/auth/domain/repositories/auth_repository.dart';

class ResetPasswordUseCase implements UseCase<String, ResetPasswordParams> {
  final AuthRepository repository;
  ResetPasswordUseCase(this.repository);

  @override
  Future<Either<Failure, String>> call(ResetPasswordParams p) => repository
      .resetPassword(email: p.email, otp: p.otp, newPassword: p.newPassword);
}

class ResetPasswordParams extends Equatable {
  final String email;
  final String otp;
  final String newPassword;
  const ResetPasswordParams(
      {required this.email, required this.otp, required this.newPassword});
  @override
  List<Object?> get props => [email, otp, newPassword];
}

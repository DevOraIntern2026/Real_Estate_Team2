import 'package:dartz/dartz.dart';
import 'package:equatable/equatable.dart';
import '../../../../core/error/failures.dart';
import '../../../../core/usecase/usecase.dart';
import '../repositories/auth_repository.dart';

class ConfirmEmailUseCase implements UseCase<String, ConfirmEmailParams> {
  final AuthRepository repository;
  ConfirmEmailUseCase(this.repository);

  @override
  Future<Either<Failure, String>> call(ConfirmEmailParams params) {
    return repository.confirmEmail(email: params.email, otp: params.otp);
  }
}

class ConfirmEmailParams extends Equatable {
  final String email;
  final String otp;
  const ConfirmEmailParams({required this.email, required this.otp});

  @override
  List<Object?> get props => [email, otp];
}
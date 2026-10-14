import 'package:dartz/dartz.dart';

import '../../../../core/error/failures.dart';
import '../entities/user_entity.dart';

abstract class AuthRepository {
  Future<Either<Failure, UserEntity>> login({
    required String email,
    required String password,
  });

  Future<Either<Failure, String>> register({
    required String username,
    required String email,
    required String password,
    required UserRole role,
  });

  Future<Either<Failure, String>> confirmEmail({
    required String email,
    required String otp,
  });

  Future<UserEntity?> getPersistedUser();
  
  Future<Either<Failure, String>> resendConfirmation({required String email});
  Future<Either<Failure, String>> forgotPassword({required String email});
  Future<Either<Failure, String>> resetPassword({
    required String email,
    required String otp,
    required String newPassword,
  });
  Future<Either<Failure, void>> logout();
}

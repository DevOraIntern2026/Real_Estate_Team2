import 'package:dartz/dartz.dart';
import 'package:real_estate_app/core/helper/jwt_decoder.dart';
import 'package:real_estate_app/core/helper/token_storage.dart';

import '../../../../core/error/exceptions.dart';
import '../../../../core/error/failures.dart';
import '../../../../core/network/network_info.dart';
import '../../domain/entities/user_entity.dart';
import '../../domain/repositories/auth_repository.dart';
import '../datasources/auth_remote_data_source.dart';
import '../models/user_model.dart';

class AuthRepositoryImpl implements AuthRepository {
  final AuthRemoteDataSource remoteDataSource;
  final NetworkInfo networkInfo;
  final TokenStorage tokenStorage;

  AuthRepositoryImpl({
    required this.remoteDataSource,
    required this.networkInfo,
    required this.tokenStorage,
  });

  @override
  Future<Either<Failure, UserEntity>> login(
      {required String email, required String password}) async {
    if (!await networkInfo.isConnected) return const Left(NetworkFailure());
    try {
      final tokens =
          await remoteDataSource.login(email: email, password: password);
      await tokenStorage.saveTokens(
        accessToken: tokens['accessToken']!,
        refreshToken: tokens['refreshToken']!,
      );
      final claims = decodeJwtPayload(tokens['accessToken']!);
      return Right(UserModel.fromJwtClaims(claims));
    } on ServerException catch (e) {
      return Left(ServerFailure(e.message));
    }
  }

  @override
  Future<Either<Failure, String>> register({
    required String username,
    required String email,
    required String password,
    required UserRole role,
  }) async {
    if (!await networkInfo.isConnected) return const Left(NetworkFailure());
    try {
      final message = await remoteDataSource.register(
        username: username,
        email: email,
        password: password,
        role: role,
      );
      return Right(message);
    } on ServerException catch (e) {
      return Left(ServerFailure(e.message));
    }
  }

  @override
  Future<Either<Failure, String>> confirmEmail(
      {required String email, required String otp}) async {
    if (!await networkInfo.isConnected) return const Left(NetworkFailure());
    try {
      final message =
          await remoteDataSource.confirmEmail(email: email, otp: otp);
      return Right(message);
    } on ServerException catch (e) {
      return Left(ServerFailure(e.message));
    }
  }

  @override
  Future<UserEntity?> getPersistedUser() async {
    final token = await tokenStorage.getAccessToken();
    if (token == null) return null;
    final claims = decodeJwtPayload(token);
    if (claims.isEmpty) return null;
    return UserModel.fromJwtClaims(claims);
  }

  @override
  Future<Either<Failure, String>> resendConfirmation(
      {required String email}) async {
    if (!await networkInfo.isConnected) return const Left(NetworkFailure());
    try {
      return Right(await remoteDataSource.resendConfirmation(email: email));
    } on ServerException catch (e) {
      return Left(ServerFailure(e.message));
    }
  }

  @override
  Future<Either<Failure, String>> forgotPassword(
      {required String email}) async {
    if (!await networkInfo.isConnected) return const Left(NetworkFailure());
    try {
      return Right(await remoteDataSource.forgotPassword(email: email));
    } on ServerException catch (e) {
      return Left(ServerFailure(e.message));
    }
  }

  @override
  Future<Either<Failure, String>> resetPassword({
    required String email,
    required String otp,
    required String newPassword,
  }) async {
    if (!await networkInfo.isConnected) return const Left(NetworkFailure());
    try {
      return Right(await remoteDataSource.resetPassword(
          email: email, otp: otp, newPassword: newPassword));
    } on ServerException catch (e) {
      return Left(ServerFailure(e.message));
    }
  }

  @override
  Future<Either<Failure, void>> logout() async {
    await tokenStorage.clear();
    return const Right(null);
  }
}

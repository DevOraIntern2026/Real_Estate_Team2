import 'package:dartz/dartz.dart';
import '../../../../core/error/exceptions.dart';
import '../../../../core/error/failures.dart';
import '../../../../core/network/network_info.dart';
import '../../domain/entities/user_entity.dart';
import '../../domain/repositories/auth_repository.dart';
import '../datasources/auth_remote_data_source.dart';

class AuthRepositoryImpl implements AuthRepository {
  final AuthRemoteDataSource remoteDataSource;
  final NetworkInfo networkInfo;

  AuthRepositoryImpl({required this.remoteDataSource, required this.networkInfo});

  @override
  Future<Either<Failure, UserEntity>> login({required String email, required String password}) async {
    if (!await networkInfo.isConnected) return const Left(NetworkFailure());
    try {
      final user = await remoteDataSource.login(email: email, password: password);
      return Right(user);
    } on ServerException catch (e) {
      return Left(ServerFailure(e.message));
    }
  }

  @override
  Future<Either<Failure, UserEntity>> register({required String name, required String email, required String password}) async {
    if (!await networkInfo.isConnected) return const Left(NetworkFailure());
    try {
      final user = await remoteDataSource.register(name: name, email: email, password: password);
      return Right(user);
    } on ServerException catch (e) {
      return Left(ServerFailure(e.message));
    }
  }

  @override
  Future<Either<Failure, UserEntity>> getCurrentUser() async {
    if (!await networkInfo.isConnected) return const Left(NetworkFailure());
    try {
      final user = await remoteDataSource.getCurrentUser();
      return Right(user);
    } on ServerException catch (e) {
      return Left(ServerFailure(e.message));
    }
  }

  @override
  Future<Either<Failure, void>> logout() async {
    // TODO: clear the stored token via a local data source once implemented
    return const Right(null);
  }
}

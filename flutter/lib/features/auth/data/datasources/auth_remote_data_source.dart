import 'package:dio/dio.dart';
import '../../../../core/error/exceptions.dart';
import '../../../../core/network/dio_client.dart';
import '../../domain/entities/user_entity.dart';
import '../models/user_model.dart';

abstract class AuthRemoteDataSource {
  Future<UserModel> login({required String email, required String password});
  Future<UserModel> register({
    required String name,
    required String email,
    required String password,
    required UserRole role,
  });
  Future<UserModel> getCurrentUser();
}

class AuthRemoteDataSourceImpl implements AuthRemoteDataSource {
  final DioClient dioClient;
  AuthRemoteDataSourceImpl(this.dioClient);

  @override
  Future<UserModel> login({required String email, required String password}) async {
    try {
      final response = await dioClient.dio.post('/authentication/login', data: {
        'email': email,
        'password': password,
      });
      // TODO: adjust once Backend 1 confirms the exact response shape,
      // and save the returned token via a local data source (SharedPreferences).
      return UserModel.fromJson(response.data['user'] ?? response.data);
    } on DioException catch (e) {
      throw ServerException(e.message ?? 'Login failed');
    }
  }

  @override
  Future<UserModel> register({
    required String name,
    required String email,
    required String password,
    required UserRole role,
  }) async {
    try {
      final response = await dioClient.dio.post('/authentication/register', data: {
        'name': name,
        'email': email,
        'password': password,
        // TODO: confirm the exact field name/values Backend 1 expects for role
        'role': role.name,
      });
      return UserModel.fromJson(response.data['user'] ?? response.data);
    } on DioException catch (e) {
      throw ServerException(e.message ?? 'Registration failed');
    }
  }

  @override
  Future<UserModel> getCurrentUser() async {
    try {
      final response = await dioClient.dio.get('/users/me');
      return UserModel.fromJson(response.data['user'] ?? response.data);
    } on DioException catch (e) {
      throw ServerException(e.message ?? 'Failed to load user');
    }
  }
}
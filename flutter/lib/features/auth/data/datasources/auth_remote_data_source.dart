import 'package:dio/dio.dart';

import '../../../../core/error/exceptions.dart';
import '../../../../core/network/dio_client.dart';
import '../../domain/entities/user_entity.dart';

abstract class AuthRemoteDataSource {
  Future<Map<String, String>> login(
      {required String email, required String password});

  Future<String> register({
    required String username,
    required String email,
    required String password,
    required UserRole role,
  });

  Future<String> confirmEmail({required String email, required String otp});
}

class AuthRemoteDataSourceImpl implements AuthRemoteDataSource {
  final DioClient dioClient;
  AuthRemoteDataSourceImpl(this.dioClient);

  static const Map<UserRole, String> _roleCodes = {
    UserRole.customer: '2',
    UserRole.owner: '1',
    UserRole.agent: '3',
    UserRole.admin: '4',
  };

  @override
  Future<Map<String, String>> login(
      {required String email, required String password}) async {
    try {
      final response = await dioClient.dio.post('/auth/login', data: {
        'email': email,
        'password': password,
      });
      final data = response.data['data'] as Map<String, dynamic>;
      return {
        'accessToken': data['accessToken'] as String,
        'refreshToken': data['refreshToken'] as String,
      };
    } on DioException catch (e) {
      throw ServerException(_extractMessage(e) ?? 'Login failed');
    }
  }

  @override
  Future<String> register({
    required String username,
    required String email,
    required String password,
    required UserRole role,
  }) async {
    try {
      final response = await dioClient.dio.post('/auth/signup', data: {
        'username': username,
        'email': email,
        'password': password,
        'role': _roleCodes[role],
      });
      return (response.data['message'] ?? 'Account created') as String;
    } on DioException catch (e) {
      throw ServerException(_extractMessage(e) ?? 'Registration failed');
    }
  }

  @override
  Future<String> confirmEmail(
      {required String email, required String otp}) async {
    try {
      final response = await dioClient.dio.patch('/auth/confirmEmail', data: {
        'email': email,
        'otp': otp,
      });
      return (response.data['message'] ?? 'Email confirmed') as String;
    } on DioException catch (e) {
      throw ServerException(_extractMessage(e) ?? 'Confirmation failed');
    }
  }

  String? _extractMessage(DioException e) {
    final data = e.response?.data;
    if (data is Map) {
      if (data['message'] is String) return data['message'] as String;
      if (data['Error'] is String) return data['Error'] as String;
    }
    return e.message;
  }
}

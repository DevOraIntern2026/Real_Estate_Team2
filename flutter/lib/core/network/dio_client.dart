import 'package:dio/dio.dart';
import 'package:real_estate_app/core/helper/token_storage.dart';
import 'package:real_estate_app/core/network/api_constants.dart';

class DioClient {
  final Dio dio;

  DioClient._internal(this.dio);

  factory DioClient(TokenStorage tokenStorage) {
    final dio = Dio(
      BaseOptions(
        baseUrl: ApiConstants.baseUrl,
        connectTimeout: const Duration(seconds: 15),
        receiveTimeout: const Duration(seconds: 15),
        headers: {'Content-Type': 'application/json'},
      ),
    );

    dio.interceptors.add(
      InterceptorsWrapper(
        onRequest: (options, handler) async {
          final token = await tokenStorage.getAccessToken();
          if (token != null) {
            options.headers['Authorization'] = 'Bearer $token';
          }
          return handler.next(options);
        },
        onError: (error, handler) {
          // TODO: hook up a refresh-token flow on 401 once Backend 1
          // confirms a /auth/refresh endpoint.
          return handler.next(error);
        },
      ),
    );

    dio.interceptors.add(LogInterceptor(requestBody: true, responseBody: true));

    return DioClient._internal(dio);
  }
}

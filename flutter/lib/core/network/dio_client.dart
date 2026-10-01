import 'package:dio/dio.dart';
import 'package:shared_preferences/shared_preferences.dart';

class DioClient {
  final Dio dio;

  DioClient._internal(this.dio);

  factory DioClient() {
    final dio = Dio(
      BaseOptions(
        // TODO: replace with the real API base URL once Backend team publishes it (see brief: /api groups)
        baseUrl: 'https://api.devora-realestate.com/api',
        connectTimeout: const Duration(seconds: 15),
        receiveTimeout: const Duration(seconds: 15),
        headers: {'Content-Type': 'application/json'},
      ),
    );

    dio.interceptors.add(
      InterceptorsWrapper(
        onRequest: (options, handler) async {
          final prefs = await SharedPreferences.getInstance();
          final token = prefs.getString('auth_token');
          if (token != null) {
            options.headers['Authorization'] = 'Bearer $token';
          }
          return handler.next(options);
        },
        onError: (error, handler) {
          // TODO: centralize 401/refresh-token handling here once auth API is ready
          return handler.next(error);
        },
      ),
    );

    dio.interceptors.add(LogInterceptor(requestBody: true, responseBody: true));

    return DioClient._internal(dio);
  }
}

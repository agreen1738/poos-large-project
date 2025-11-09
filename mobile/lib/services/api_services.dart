// services/api_service.dart - Base API configuration
import 'package:dio/dio.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:flutter/foundation.dart';

class ApiService {
  static final ApiService _instance = ApiService._internal();
  factory ApiService() => _instance;

  late final Dio _dio;
  
  
  static const String apiBaseUrl = 'http://10.0.48.191:5050/api';
  /*String.fromEnvironment(
    'API_URL',
    defaultValue: 'http://localhost:5050/api',
  );*/

  ApiService._internal() {
    _dio = Dio(
      BaseOptions(
        baseUrl: apiBaseUrl,
        headers: {
          'Content-Type': 'application/json',
        },
        connectTimeout: const Duration(seconds: 10),
        receiveTimeout: const Duration(seconds: 10),
      ),
    );

    // Request interceptor to add auth token
    _dio.interceptors.add(
      InterceptorsWrapper(
        onRequest: (options, handler) async {
          final prefs = await SharedPreferences.getInstance();
          final token = prefs.getString('auth_token');
          if (token != null) {
            options.headers['Authorization'] = 'Bearer $token';
          }
          return handler.next(options);
        },
        onError: (error, handler) async {
          // Handle 401 Unauthorized - redirect to login
          if (error.response?.statusCode == 401) {
            final url = error.requestOptions.path;
            final method = error.requestOptions.method.toLowerCase();

            // Don't auto-logout for these specific scenarios:
            // 1. POST /login - Login attempt with wrong credentials
            // 2. POST /register - Registration (shouldn't get 401, but just in case)
            // 3. DELETE /me - Account deletion with wrong password
            // 4. PUT /me/password - Password change with wrong current password
            final isLoginAttempt = url.contains('/login') && method == 'post';
            final isRegisterAttempt = url.contains('/register') && method == 'post';
            final isAccountDeletion = url.contains('/me') && method == 'delete';
            final isPasswordChange = url.contains('/me/password') && method == 'put';

            if (!isLoginAttempt && 
                !isRegisterAttempt && 
                !isAccountDeletion && 
                !isPasswordChange) {
              // Auto-logout only for unexpected 401 errors (expired token, etc.)
              final prefs = await SharedPreferences.getInstance();
              await prefs.remove('auth_token');
              await prefs.remove('user_data');
              
              // Note: Navigation should be handled in the UI layer
              // You can throw a specific exception here that the UI can catch
              return handler.reject(
                DioException(
                  requestOptions: error.requestOptions,
                  error: 'Session expired. Please login again.',
                  type: DioExceptionType.connectionTimeout,
                ),
              );
            }
          }
          return handler.next(error);
        },
      ),
    );

    // Add logging interceptor in debug mode
    if (kDebugMode) {
      _dio.interceptors.add(
        LogInterceptor(
          requestBody: true,
          responseBody: true,
          error: true,
          requestHeader: true,
          responseHeader: false,
        ),
      );
    }
  }

  // GET request
  Future<Response> get(
    String path, {
    Map<String, dynamic>? queryParameters,
    Options? options,
  }) async {
    return await _dio.get(
      path,
      queryParameters: queryParameters,
      options: options,
    );
  }

  // POST request
  Future<Response> post(
    String path, {
    dynamic data,
    Map<String, dynamic>? queryParameters,
    Options? options,
  }) async {
    return await _dio.post(
      path,
      data: data,
      queryParameters: queryParameters,
      options: options,
    );
  }

  // PUT request
  Future<Response> put(
    String path, {
    dynamic data,
    Map<String, dynamic>? queryParameters,
    Options? options,
  }) async {
    return await _dio.put(
      path,
      data: data,
      queryParameters: queryParameters,
      options: options,
    );
  }

  // DELETE request
  Future<Response> delete(
    String path, {
    dynamic data,
    Map<String, dynamic>? queryParameters,
    Options? options,
  }) async {
    return await _dio.delete(
      path,
      data: data,
      queryParameters: queryParameters,
      options: options,
    );
  }

  // PATCH request
  Future<Response> patch(
    String path, {
    dynamic data,
    Map<String, dynamic>? queryParameters,
    Options? options,
  }) async {
    return await _dio.patch(
      path,
      data: data,
      queryParameters: queryParameters,
      options: options,
    );
  }

  // Get the Dio instance if needed for advanced usage
  Dio get dio => _dio;
}

// Export a singleton instance
final apiService = ApiService();
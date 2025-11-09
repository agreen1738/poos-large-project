import 'dart:convert';
import 'package:dio/dio.dart';
import 'package:shared_preferences/shared_preferences.dart';
import './api_services.dart';

class User {
  final String id;
  final String firstName;
  final String lastName;
  final String email;
  final String? phone;
  final String createdAt;
  final String? status;

  User({
    required this.id,
    required this.firstName,
    required this.lastName,
    required this.email,
    this.phone,
    required this.createdAt,
    this.status,
  });

  factory User.fromJson(Map<String, dynamic> json) {
    return User(
      id: json['_id'] ?? '',
      firstName: json['firstName'] ?? '',
      lastName: json['lastName'] ?? '',
      email: json['email'] ?? '',
      phone: json['phone'],
      createdAt: json['createdAt'] ?? '',
      status: json['status'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      '_id': id,
      'firstName': firstName,
      'lastName': lastName,
      'email': email,
      'phone': phone,
      'createdAt': createdAt,
      'status': status,
    };
  }
}

class RegisterData {
  final String firstName;
  final String lastName;
  final String email;
  final String phone;
  final String password;
  final String confirmPassword;

  RegisterData({
    required this.firstName,
    required this.lastName,
    required this.email,
    required this.phone,
    required this.password,
    required this.confirmPassword,
  });

  Map<String, dynamic> toJson() {
    return {
      'firstName': firstName,
      'lastName': lastName,
      'email': email,
      'phone': phone,
      'password': password,
      'confirmPassword': confirmPassword,
    };
  }
}

class LoginCredentials {
  final String login;
  final String password;

  LoginCredentials({
    required this.login,
    required this.password,
  });

  Map<String, dynamic> toJson() {
    return {
      'login': login,
      'password': password,
    };
  }
}

class AuthService {
  final ApiService _apiService = apiService;
  
  // Register new user
  Future<void> register(RegisterData data) async {
    try {
      print('Sending registration request with data: ${data.toJson()}');
      print('Number of fields: ${data.toJson().keys.length}');

      final response = await _apiService.post(
        '/register',
        data: data.toJson(),
      );

      print('Registration response status: ${response.statusCode}');
      print('Registration response body: ${response.data}');

      if (response.statusCode == 200 || response.statusCode == 201) {
        print('Registration successful');
        return;
      } else {
        final errorData = response.data;
        final errorMessage = errorData['error'] ?? 
                           errorData['message'] ?? 
                           'Registration failed';
        throw Exception(errorMessage);
      }
    } on DioException catch (e) {
      print('Registration error: $e');
      final errorMessage = e.response?.data['error'] ?? 
                          e.response?.data['message'] ?? 
                          'Registration failed';
      throw Exception(errorMessage);
    } catch (error) {
      print('Registration error: $error');
      if (error is Exception) {
        rethrow;
      }
      throw Exception('Registration failed: $error');
    }
  }

  // Login user 
  Future<User> login(LoginCredentials credentials) async {
    try {
      print('Sending login request');
      print('Login payload: ${credentials.toJson()}');

      final response = await _apiService.post(
        '/login',
        data: credentials.toJson(),
      );

      print('Login response status: ${response.statusCode}');
      print('Login response body: ${response.data}');

      if (response.statusCode == 200) {
        final responseData = response.data;
        final token = responseData['token'];

        if (token == null || token.isEmpty) {
          throw Exception('No token received from server');
        }

        // Step 2: Store token
        final prefs = await SharedPreferences.getInstance();
        await prefs.setString('auth_token', token);
        print('Token stored successfully');

        // Step 3: Try to fetch user details
        try {
          print('Attempting to fetch user data from /me endpoint...');
          final user = await getCurrentUserFromAPI();
          print('User data received: ${user.toJson()}');
          await prefs.setString('user_data', jsonEncode(user.toJson()));
          return user;
        } catch (meError) {
          print('/me endpoint not available, creating temporary user data');
          // If /me doesn't exist, create temporary user data
          final tempUser = User(
            id: 'temp',
            firstName: credentials.login.split('@')[0],
            lastName: 'User',
            email: credentials.login,
            createdAt: DateTime.now().toIso8601String(),
          );
          await prefs.setString('user_data', jsonEncode(tempUser.toJson()));
          return tempUser;
        }
      } else if (response.statusCode == 401) {
        final errorData = response.data;
        final errorMessage = errorData['error'] ?? '';
        
        // Check if it's an email verification error
        if (errorMessage.contains('not verified')) {
          throw Exception('Please verify your email before logging in. Check your inbox for the verification link.');
        } else {
          throw Exception('Invalid email or password');
        }
      } else {
        final errorData = response.data;
        final errorMessage = errorData['error'] ?? 
                           errorData['message'] ?? 
                           'Login failed';
        throw Exception(errorMessage);
      }
    } on DioException catch (e) {
      print('Login DioException: $e');
      
      // Clear any stored data on error
      final prefs = await SharedPreferences.getInstance();
      await prefs.remove('auth_token');
      await prefs.remove('user_data');
      
      if (e.response?.statusCode == 401) {
        final errorData = e.response?.data;
        final errorMessage = errorData?['error'] ?? '';
        
        if (errorMessage.contains('not verified')) {
          throw Exception('Please verify your email before logging in. Check your inbox for the verification link.');
        } else {
          throw Exception('Invalid email or password');
        }
      }
      
      final errorMessage = e.response?.data['error'] ?? 
                          e.response?.data['message'] ?? 
                          'Login failed';
      throw Exception(errorMessage);
    } catch (error) {
      print('Login error: $error');
      
      // Clear any stored data on error
      final prefs = await SharedPreferences.getInstance();
      await prefs.remove('auth_token');
      await prefs.remove('user_data');
      
      if (error is Exception) {
        rethrow;
      }
      throw Exception('Login failed: $error');
    }
  }

  // Fetch current user from /me endpoint
  Future<User> getCurrentUserFromAPI() async {
    try {
      final token = await getToken();
      if (token == null) {
        throw Exception('No authentication token found');
      }

      final response = await _apiService.get('/me');

      if (response.statusCode == 200) {
        final userData = response.data;
        final user = User.fromJson(userData);
      
        final prefs = await SharedPreferences.getInstance();
        await prefs.setString('user_data', jsonEncode(user.toJson()));
      
        return user;
      } else {
        final errorData = response.data;
        final errorMessage = errorData['error'] ?? 
                           errorData['message'] ?? 
                           'Failed to fetch user data';
        throw Exception(errorMessage);
      }
    } on DioException catch (e) {
      print('Get current user DioException: $e');
      final errorMessage = e.response?.data['error'] ?? 
                          e.response?.data['message'] ?? 
                          'Failed to fetch user data';
      throw Exception(errorMessage);
    } catch (error) {
      print('Get current user error: $error');
      if (error is Exception) {
        rethrow;
      }
      throw Exception('Failed to fetch user data: $error');
    }
  }

  // Logout user
  Future<void> logout() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('auth_token');
    await prefs.remove('user_data');
  }

  // Check if user is authenticated
  Future<bool> isAuthenticated() async {
    final token = await getToken();
    return token != null && token.isNotEmpty;
  }

  // Get current user data from SharedPreferences
  Future<User?> getCurrentUser() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final userData = prefs.getString('user_data');
      if (userData != null) {
        return User.fromJson(jsonDecode(userData));
      }
      return null;
    } catch (error) {
      print('Get current user error: $error');
      return null;
    }
  }

  // Get auth token
  Future<String?> getToken() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString('auth_token');
  }
}

final authService = AuthService();
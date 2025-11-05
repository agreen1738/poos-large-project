import 'package:dio/dio.dart';
import 'package:shared_preferences/shared_preferences.dart';
import './api_services.dart';

class UpdateUserData {
  final String? firstName;
  final String? lastName;
  final String? email;
  final String? phone;

  UpdateUserData({
    this.firstName,
    this.lastName,
    this.email,
    this.phone,
  });

  Map<String, dynamic> toJson() {
    final Map<String, dynamic> data = {};
    if (firstName != null) data['firstName'] = firstName;
    if (lastName != null) data['lastName'] = lastName;
    if (email != null) data['email'] = email;
    if (phone != null) data['phone'] = phone;
    return data;
  }
}

class ChangePasswordData {
  final String currentPassword;
  final String newPassword;

  ChangePasswordData({
    required this.currentPassword,
    required this.newPassword,
  });

  Map<String, dynamic> toJson() {
    return {
      'currentPassword': currentPassword,
      'newPassword': newPassword,
    };
  }
}

class UserService {
  final ApiService _apiService = apiService;

  // Get current user information
  Future<Map<String, dynamic>> getUserInfo() async {
    try {
      final response = await _apiService.get('/me');

      print('Get user info response status: ${response.statusCode}');
      print('Get user info response body: ${response.data}');

      if (response.statusCode == 200) {
        return response.data;
      } else {
        final errorData = response.data;
        final errorMessage = errorData['error'] ?? 
                           errorData['message'] ?? 
                           'Failed to fetch user info';
        throw Exception(errorMessage);
      }
    } on DioException catch (e) {
      print('Get user info DioException: $e');
      final errorMessage = e.response?.data['error'] ?? 
                          e.response?.data['message'] ?? 
                          'Failed to fetch user info';
      throw Exception(errorMessage);
    } catch (error) {
      print('Get user info error: $error');
      if (error is Exception) {
        rethrow;
      }
      throw Exception('Failed to fetch user info: $error');
    }
  }

  // Update user information
  Future<void> updateUserInfo(UpdateUserData data) async {
    try {
      print('Updating user info with data: ${data.toJson()}');

      final response = await _apiService.put(
        '/me',
        data: data.toJson(),
      );

      print('Update user info response status: ${response.statusCode}');
      print('Update user info response body: ${response.data}');

      if (response.statusCode == 200 || response.statusCode == 204) {
        print('User info updated successfully');
        return;
      } else {
        final errorData = response.data;
        final errorMessage = errorData['error'] ?? 
                           errorData['message'] ?? 
                           'Failed to update user info';
        throw Exception(errorMessage);
      }
    } on DioException catch (e) {
      print('Update user info DioException: $e');
      final errorMessage = e.response?.data['error'] ?? 
                          e.response?.data['message'] ?? 
                          'Failed to update user info';
      throw Exception(errorMessage);
    } catch (error) {
      print('Update user info error: $error');
      if (error is Exception) {
        rethrow;
      }
      throw Exception('Failed to update user info: $error');
    }
  }

  // Change password
  Future<void> changePassword(ChangePasswordData data) async {
    try {
      print('Changing password...');

      final response = await _apiService.put(
        '/me/password',
        data: data.toJson(),
      );

      print('Change password response status: ${response.statusCode}');
      print('Change password response body: ${response.data}');

      if (response.statusCode == 200 || response.statusCode == 204) {
        print('Password changed successfully');
        return;
      } else {
        final errorData = response.data;
        final errorMessage = errorData['error'] ?? 
                           errorData['message'] ?? 
                           'Failed to change password';
        throw Exception(errorMessage);
      }
    } on DioException catch (e) {
      print('Change password DioException: $e');
      final errorMessage = e.response?.data['error'] ?? 
                          e.response?.data['message'] ?? 
                          'Failed to change password';
      throw Exception(errorMessage);
    } catch (error) {
      print('Change password error: $error');
      if (error is Exception) {
        rethrow;
      }
      throw Exception('Failed to change password: $error');
    }
  }

  // Delete user account 
  Future<void> deleteAccount(String password) async {
    try {
      print('Deleting account...');

      final response = await _apiService.delete(
        '/me',
        data: {'password': password},
      );

      print('Delete account response status: ${response.statusCode}');
      print('Delete account response body: ${response.data}');

      if (response.statusCode == 200 || response.statusCode == 204) {
        print('Account deleted successfully');
        
        // Clear local data
        final prefs = await SharedPreferences.getInstance();
        await prefs.remove('auth_token');
        await prefs.remove('user_data');
        
        return;
      } else {
        final errorData = response.data;
        final errorMessage = errorData['error'] ?? 
                           errorData['message'] ?? 
                           'Failed to delete account';
        throw Exception(errorMessage);
      }
    } on DioException catch (e) {
      print('Delete account DioException: $e');
      final errorMessage = e.response?.data['error'] ?? 
                          e.response?.data['message'] ?? 
                          'Failed to delete account';
      throw Exception(errorMessage);
    } catch (error) {
      print('Delete account error: $error');
      if (error is Exception) {
        rethrow;
      }
      throw Exception('Failed to delete account: $error');
    }
  }

  // Send forgot password email
  Future<void> sendForgotPasswordEmail(String email) async {
    try {
      print('Sending password reset request for email: $email');
      
      final response = await _apiService.post(
        '/forgot-password',
        data: {'email': email},
      );

      print('Password reset response status: ${response.statusCode}');
      print('Password reset response body: ${response.data}');

      if (response.statusCode == 200 || response.statusCode == 201) {
        print('Password reset email sent successfully');
        return;
      } else {
        final errorData = response.data;
        final errorMessage = errorData['error'] ?? 
                           errorData['message'] ?? 
                           'Failed to send reset link';
        throw Exception(errorMessage);
      }
    } on DioException catch (e) {
      print('Password reset DioException: $e');
      final errorMessage = e.response?.data['error'] ?? 
                          e.response?.data['message'] ?? 
                          'Failed to send reset link';
      throw Exception(errorMessage);
    } catch (error) {
      print('Password reset error: $error');
      if (error is Exception) {
        rethrow;
      }
      throw Exception('Failed to send reset link: $error');
    }
  }

  // Logout user
  Future<void> logout() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.remove('auth_token');
      await prefs.remove('user_data');
      print('User logged out successfully');
    } catch (error) {
      print('Logout error: $error');
      throw Exception('Failed to logout: $error');
    }
  }
}

final userService = UserService();
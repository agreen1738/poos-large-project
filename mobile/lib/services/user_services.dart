import 'package:http/http.dart' as http;
import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';

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
  static const String baseUrl = 'http://10.0.2.2:5050/api';

  // Get auth token
  Future<String?> _getToken() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString('auth_token');
  }

  // Get current user information
  Future<Map<String, dynamic>> getUserInfo() async {
    try {
      final token = await _getToken();
      if (token == null) {
        throw Exception('No authentication token found');
      }

      final response = await http.get(
        Uri.parse('$baseUrl/me'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
      );

      print('Get user info response status: ${response.statusCode}');
      print('Get user info response body: ${response.body}');

      if (response.statusCode == 200) {
        return jsonDecode(response.body);
      } else {
        final errorData = jsonDecode(response.body);
        final errorMessage = errorData['error'] ?? 
                           errorData['message'] ?? 
                           'Failed to fetch user info';
        throw Exception(errorMessage);
      }
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
      final token = await _getToken();
      if (token == null) {
        throw Exception('No authentication token found');
      }

      print('Updating user info with data: ${data.toJson()}');

      final response = await http.put(
        Uri.parse('$baseUrl/me'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
        body: jsonEncode(data.toJson()),
      );

      print('Update user info response status: ${response.statusCode}');
      print('Update user info response body: ${response.body}');

      if (response.statusCode == 200 || response.statusCode == 204) {
        // Update successful
        print('User info updated successfully');
        return;
      } else {
        final errorData = jsonDecode(response.body);
        final errorMessage = errorData['error'] ?? 
                           errorData['message'] ?? 
                           'Failed to update user info';
        throw Exception(errorMessage);
      }
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
      final token = await _getToken();
      if (token == null) {
        throw Exception('No authentication token found');
      }

      print('Changing password...');

      final response = await http.put(
        Uri.parse('$baseUrl/me/password'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
        body: jsonEncode(data.toJson()),
      );

      print('Change password response status: ${response.statusCode}');
      print('Change password response body: ${response.body}');

      if (response.statusCode == 200 || response.statusCode == 204) {
        // Password changed successfully
        print('Password changed successfully');
        return;
      } else {
        final errorData = jsonDecode(response.body);
        final errorMessage = errorData['error'] ?? 
                           errorData['message'] ?? 
                           'Failed to change password';
        throw Exception(errorMessage);
      }
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
      final token = await _getToken();
      if (token == null) {
        throw Exception('No authentication token found');
      }

      print('Deleting account...');

      final response = await http.delete(
        Uri.parse('$baseUrl/me'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
        body: jsonEncode({'password': password}),
      );

      print('Delete account response status: ${response.statusCode}');
      print('Delete account response body: ${response.body}');

      if (response.statusCode == 200 || response.statusCode == 204) {
        // Account deleted successfully
        print('Account deleted successfully');
        
        // Clear local data
        final prefs = await SharedPreferences.getInstance();
        await prefs.remove('auth_token');
        await prefs.remove('user_data');
        
        return;
      } else {
        final errorData = jsonDecode(response.body);
        final errorMessage = errorData['error'] ?? 
                           errorData['message'] ?? 
                           'Failed to delete account';
        throw Exception(errorMessage);
      }
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
      
      final response = await http.post(
        Uri.parse('$baseUrl/forgot-password'),
        headers: {
          'Content-Type': 'application/json',
        },
        body: jsonEncode({
          'email': email,
        }),
      );

      print('Password reset response status: ${response.statusCode}');
      print('Password reset response body: ${response.body}');

      if (response.statusCode == 200 || response.statusCode == 201) {
        // Success
        print('Password reset email sent successfully');
        return;
      } else {
        final errorData = jsonDecode(response.body);
        final errorMessage = errorData['error'] ?? 
                           errorData['message'] ?? 
                           'Failed to send reset link';
        throw Exception(errorMessage);
      }
    } catch (error) {
      print('Password reset error: $error');
      if (error is Exception) {
        rethrow;
      }
      throw Exception('Failed to send reset link: $error');
    }
  }

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
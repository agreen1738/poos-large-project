import 'dart:convert';
import 'package:http/http.dart' as http;


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

class AuthService {
  // url for android emulator
  static const String baseUrl = 'http://10.0.2.2:5050/api';
  
  // register new user
  Future<void> register(RegisterData data) async {
    try {
      print('Sending registration request with data: ${data.toJson()}');
      
      final response = await http.post(
        Uri.parse('$baseUrl/register'),
        headers: {
          'Content-Type': 'application/json',
        },
        body: jsonEncode(data.toJson()),
      );

      print('Registration response status: ${response.statusCode}');
      print('Registration response body: ${response.body}');

      if (response.statusCode == 200 || response.statusCode == 201) {
        // Registration successful
        print('Registration successful');
        return;
      } else {
        // Handle error
        final errorData = jsonDecode(response.body);
        final errorMessage = errorData['error'] ?? 
                           errorData['message'] ?? 
                           'Registration failed';
        throw Exception(errorMessage);
      }
    } catch (error) {
      print('Registration error: $error');
      if (error is Exception) {
        rethrow;
      }
      throw Exception('Registration failed: $error');
    }
  }
}

final authService = AuthService();
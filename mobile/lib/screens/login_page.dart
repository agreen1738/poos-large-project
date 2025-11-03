import 'package:flutter/material.dart';
import 'register_page.dart';
import 'dashboard_page.dart';

class LoginPage extends StatefulWidget {
  const LoginPage({super.key});

  @override
  State<LoginPage> createState() => _LoginPageState();
}

class _LoginPageState extends State<LoginPage> {
  final TextEditingController _loginController = TextEditingController();
  final TextEditingController _passwordController = TextEditingController();

  /*String _errorMessage = '';
  bool _isLoading = false;

  //TODO: replace with actual API call

  Future<void> _login() async{
    setState(() {
      _isLoading = true; 
      _errorMessage = ''; 
    });

    try{
      // Send a POST request to the login API endpoint
      final response = await http.post(
        Uri.parse('http://cop4331-5.com:5000/api/login'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'login': _loginController.text,
          'password': _passwordController.text,
        }),
      );

      // If the server returns a success response
      if (response.statusCode == 200) {
        final data = jsonDecode(response.body); // Convert JSON to a map

        // If there’s no error in the response, login succeeded
        if (data['error'] == null || data['error'].isEmpty) {
          if (mounted) {
            Navigator.pushReplacement(
              context,
              MaterialPageRoute(
                builder: (context) => CardManagerPage(
                  userId: data['id'],
                  firstName: data['firstName'],
                  lastName: data['lastName'],
                ),
              ),
            );
          }
        } else {
          // Show server-provided error message
          setState(() {
            _errorMessage = data['error'];
          });
        }
      } else {
        // Non-200 response means login failed
        setState(() {
          _errorMessage = 'Login failed. Please try again.';
        });
      }
    } catch (e) {
      // Handles network issues or unexpected errors
      setState(() {
        _errorMessage = 'Network error. Please check your connection.';
      });
    } finally {
      // Stop showing the loading spinner no matter what happens
      setState(() {
        _isLoading = false;
      });
    }
  }*/

  // UI of login page
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      // background
      body: Container(
        decoration: const BoxDecoration(
          gradient: LinearGradient(
            colors: [Color(0xFF695EE8), Color(0xFF836AE0)],
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
          ),
        ),
        child: Center(
          child: SingleChildScrollView(
            padding: const EdgeInsets.symmetric(
              horizontal: 32.0,
              vertical: 40.0,
            ),
            child: Container(
              padding: const EdgeInsets.all(40.0),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(24),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withValues(alpha: 0.2),
                    blurRadius: 20,
                    offset: const Offset(0, 10),
                  ),
                ],
              ),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  // Title
                  const Text(
                    'Wealth\nTracker',
                    style: TextStyle(
                      fontSize: 48,
                      fontWeight: FontWeight.w900,
                      color: Color(0xFF2D2D2D),
                      height: 1.1,
                    ),
                    textAlign: TextAlign.center,
                  ),
                  const SizedBox(height: 16),

                  // Subtitle
                  const Text(
                    'Manage Your Financial Assets',
                    style: TextStyle(
                      fontSize: 16,
                      color: Color(0xFF757575),
                    ),
                    textAlign: TextAlign.center,
                  ),
                  const SizedBox(height: 40),

                  // Email Address
                  TextField(
                    controller: _loginController,
                    decoration: InputDecoration(
                      hintText: 'Email Address',
                      hintStyle: TextStyle(
                        color: Colors.grey[500],
                      ),
                      filled: true,
                      fillColor: const Color(0xFF3D3D3D),
                      contentPadding: const EdgeInsets.symmetric(
                        horizontal: 20,
                        vertical: 18,
                      ),
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(8),
                        borderSide: BorderSide.none,
                      ),
                    ),
                    style: const TextStyle(color: Colors.white),
                  ),
                  const SizedBox(height: 16),

                  // Password
                  TextField(
                    controller: _passwordController,
                    obscureText: true,
                    decoration: InputDecoration(
                      hintText: 'Password',
                      hintStyle: TextStyle(
                        color: Colors.grey[500],
                      ),
                      filled: true,
                      fillColor: const Color(0xFF3D3D3D),
                      contentPadding: const EdgeInsets.symmetric(
                        horizontal: 20,
                        vertical: 18,
                      ),
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(8),
                        borderSide: BorderSide.none,
                      ),
                    ),
                    style: const TextStyle(color: Colors.white),
                  ),
                  const SizedBox(height: 4),

                  // Forgot Password
                  Align(
                    alignment: Alignment.centerRight,
                    child: TextButton(
                      onPressed: () {
                        print('Forgot password pressed');
                      },
                      child: const Text(
                        'Forgot Password?',
                        style: TextStyle(
                          color: Color(0xFF6E7BF2),
                          fontSize: 14,
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(height: 4),

                  // Login button
                  ElevatedButton(
                    onPressed: () {
                      print('login button pressed');
                    },
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFF6E7BF2),
                      foregroundColor: Colors.white,
                      padding: const EdgeInsets.symmetric(vertical: 18),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(8),
                      ),
                      elevation: 0,
                    ),
                    child: const Text(
                      'Login',
                      style: TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ),
                  const SizedBox(height: 24),

                  // Create account link
                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      const Text(
                        "Don't have an account? ",
                        style: TextStyle(
                          color: Color(0xFF757575),
                          fontSize: 14,
                        ),
                      ),
                      TextButton(
                        onPressed: () {
                          Navigator.push(
                            context,
                            MaterialPageRoute(builder: (context) => const RegisterPage(),
                            ),
                          );
                        },
                        style: TextButton.styleFrom(
                          padding: EdgeInsets.zero,
                          minimumSize: const Size(0, 0),
                          tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                        ),
                        child: const Text(
                          'Create one here',
                          style: TextStyle(
                            color: Color(0xFF6E7BF2),
                            fontSize: 14,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
  @override
  void dispose() {
    _loginController.dispose();
    _passwordController.dispose();
    super.dispose();
  }
}
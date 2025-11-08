import 'package:flutter/material.dart';
import 'package:mobile/screens/forgotpassword_page.dart';
import 'register_page.dart';
import 'dashboard_page.dart';
import '../services/auth_services.dart';

class LoginPage extends StatefulWidget {
  const LoginPage({super.key});

  @override
  State<LoginPage> createState() => _LoginPageState();
}

class _LoginPageState extends State<LoginPage> {
  final _formKey = GlobalKey<FormState>();
  final TextEditingController _loginController = TextEditingController();
  final TextEditingController _passwordController = TextEditingController();

  bool _isLoading = false;

  String? _validateEmail(String? value){
    if (value == null || value.isEmpty){
      return 'Email is required';
    }
    final emailRegex = RegExp(r'^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$');
    if (!emailRegex.hasMatch(value)) {
      return 'Enter a valid email address';
    }
    return null;
  }

  String? _validatePassword(String? value){
    if (value == null || value.isEmpty){
      return 'Password is required';
    }
    if(value.length < 6){
      return 'Password must be at least 6 characters';
    }
    return null;
  }

  // handle login
  Future<void> _handleLogin() async {
    if(_formKey.currentState!.validate()){
      setState(() {
        _isLoading = true;
      });

      try{
        // create login credentials
        final credentials = LoginCredentials(
          login: _loginController.text.trim(),
          password: _passwordController.text,
        );

        // call login api
        final user = await authService.login(credentials);

        // show success message
        if(mounted){
          // go to dashboard
          Navigator.pushReplacement(
            context, 
            MaterialPageRoute(builder: (context) => const DashboardPage()),
          );
        }
      } catch(e){
        // show error message
        if(mounted){
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text(e.toString().replaceAll('Exception: ', '')),
              backgroundColor: Colors.red,
              duration: const Duration(seconds: 4),
            )
          );
        }
      } finally{
        if(mounted){
          setState((){
            _isLoading = false;
          });
        }
      }
    }
  }
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
              child: Form(
                key: _formKey,
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
                    TextFormField(
                      controller: _loginController,
                      validator: _validateEmail,
                      keyboardType: TextInputType.emailAddress,
                      enabled: !_isLoading,
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
                        errorStyle: const TextStyle(color: Colors.redAccent),
                      ),
                      style: const TextStyle(color: Colors.white),
                    ),
                    const SizedBox(height: 16),

                    // Password
                    TextFormField(
                      controller: _passwordController,
                      validator: _validatePassword,
                      obscureText: true,
                      enabled: !_isLoading,
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
                        errorStyle: const TextStyle(color: Colors.redAccent),
                      ),
                      style: const TextStyle(color: Colors.white),
                    ),
                    const SizedBox(height: 4),

                    // Forgot Password
                    Align(
                      alignment: Alignment.centerRight,
                      child: TextButton(
                        onPressed: _isLoading
                            ? null
                            : () {
                                Navigator.pushReplacement(
                                    context,
                                    MaterialPageRoute(
                                      builder: (context) => const ForgotPasswordPage(),
                                    ),
                                  );
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
                      onPressed: _isLoading ? null : _handleLogin,
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFF6E7BF2),
                        foregroundColor: Colors.white,
                        padding: const EdgeInsets.symmetric(vertical: 18),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(8),
                        ),
                        elevation: 0,
                        disabledBackgroundColor: Colors.grey,
                      ),
                      child: _isLoading
                          ? const SizedBox(
                              height: 20,
                              width: 20,
                              child: CircularProgressIndicator(
                                strokeWidth: 2,
                                valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
                              ),
                            )
                          : const Text(
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
                          onPressed: _isLoading
                              ? null
                              : () {
                                  Navigator.pushReplacement(
                                    context,
                                    MaterialPageRoute(
                                      builder: (context) => const RegisterPage(),
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
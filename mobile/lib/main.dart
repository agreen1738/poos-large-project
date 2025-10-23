import 'package:flutter/material.dart';
//import 'package:http/http.dart' as http;
//import 'dart:convert';

void main() {
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Wealth Tracker',
      home: const LoginPage(),
    );
  }
}

class LoginPage extends StatefulWidget{
  const LoginPage({super.key});

  @override
  State<LoginPage> createState() => _LoginPageState();
}

class _LoginPageState extends State<LoginPage>{
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
  Widget build(BuildContext context){
    return Scaffold(
      backgroundColor: const Color(0xFF695EE8),
      body: Center(
        child: Padding(
          padding: const EdgeInsets.all(32.0),
          child: Container(
            padding: const EdgeInsets.all(16.0),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(16),
              boxShadow: [
                BoxShadow(
                  color: const Color(0x33000000),
                  blurRadius:10,
                  offset: const Offset(0,5)
                )
              ],
            ),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              const Text(
                'Wealth Tracker',
                style: TextStyle(
                  fontSize: 32,
                  fontWeight: FontWeight.bold,
                ),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 40),

              // username input field
              TextField(
                controller: _loginController,
                decoration: const InputDecoration(
                  labelText: 'Username',
                  border: OutlineInputBorder(),
                ),
              ),
              const SizedBox(height: 16),

              //password input field
              TextField(
                controller: _passwordController,
                obscureText: true, // hides text
                decoration: const InputDecoration(
                  labelText:'Password',
                  border: OutlineInputBorder(),
                ),
              ),
              const SizedBox(height:24),

              // login button
              ElevatedButton(
                //onPressed: _isLoading ? null : _login;
                onPressed: (){
                  print('login button pressed');
                },
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF695EE8),
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(vertical: 16),
          
                ),
                child: const Text('Login'),
              ),
              const SizedBox(height: 16),
            ],
          ),
          ),
        ),
      )
    );
  }

  @override
  void dispose(){
    _loginController.dispose();
    _passwordController.dispose();
    super.dispose();
  }
}
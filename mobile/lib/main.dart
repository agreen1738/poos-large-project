import 'package:flutter/material.dart';
import 'package:mobile/screens/dashboard_page.dart';
import 'screens/login_page.dart';
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
      theme: ThemeData(useMaterial3: true),
      home: const LoginPage(),
    );
  }
}
import 'package:http/http.dart' as http;
import 'dart:convert';
import 'auth_services.dart';

class Transaction {
  final String? id;
  final String? userId;
  final String? accountId;
  final double amount;
  final String category;
  final String type;
  final String date;
  final String? name;

  Transaction({
    this.id,
    this.userId,
    this.accountId,
    required this.amount,
    required this.category,
    required this.type,
    required this.date,
    this.name,
  });

  factory Transaction.fromJson(Map<String, dynamic> json) {
    return Transaction(
      id: json['_id'],
      userId: json['userId'],
      accountId: json['accountId'],
      amount: (json['amount'] as num).toDouble(),
      category: json['category'],
      type: json['type'],
      date: json['date'],
      name: json['name'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      if (id != null) '_id': id,
      if (userId != null) 'userId': userId,
      if (accountId != null) 'accountId': accountId,
      'amount': amount,
      'category': category,
      'type': type,
      'date': date,
      if (name != null) 'name': name,
    };
  }
}

class CreateTransactionData {
  final String name;
  final double amount;
  final String category;
  final String type;
  final DateTime date;

  CreateTransactionData({
    required this.name,
    required this.amount,
    required this.category,
    required this.type,
    required this.date,
  });

  Map<String, dynamic> toJson() {
    return {
      'name': name,
      'amount': amount,
      'category': category,
      'type': type,
      'date': date.toIso8601String(),
    };
  }
}

class TransactionService {

  //static const String baseUrl = 'http://159.203.128.240:5050/api';
  static const String baseUrl = 'http://10.0.2.2:5050/api';
  
  // Get all transactions for the logged-in user
  Future<List<Transaction>> getTransactions() async {
    try {
      final token = await authService.getToken();
      if (token == null) {
        throw Exception('No authentication token found');
      }

      final response = await http.get(
        Uri.parse('$baseUrl/transactions'),
        headers: {
          'Authorization': 'Bearer $token',
          'Content-Type': 'application/json',
        },
      );

      if (response.statusCode == 200) {
        final List<dynamic> data = json.decode(response.body);
        return data.map((json) => Transaction.fromJson(json)).toList();
      } else {
        final errorData = json.decode(response.body);
        throw Exception(errorData['error'] ?? errorData['message'] ?? 'Failed to fetch transactions');
      }
    } catch (e) {
      throw Exception('Failed to fetch transactions: $e');
    }
  }

  // Get transactions for a specific account
  Future<List<Transaction>> getAccountTransactions(String accountId) async {
    try {
      final token = await authService.getToken();
      if (token == null) {
        throw Exception('No authentication token found');
      }

      final response = await http.get(
        Uri.parse('$baseUrl/transactions/$accountId'),
        headers: {
          'Authorization': 'Bearer $token',
          'Content-Type': 'application/json',
        },
      );

      if (response.statusCode == 200) {
        final List<dynamic> data = json.decode(response.body);
        return data.map((json) => Transaction.fromJson(json)).toList();
      } else {
        final errorData = json.decode(response.body);
        throw Exception(errorData['error'] ?? errorData['message'] ?? 'Failed to fetch account transactions');
      }
    } catch (e) {
      throw Exception('Failed to fetch account transactions: $e');
    }
  }

  // Get a single transaction
  Future<Transaction> getTransaction(String accountId, String transactionId) async {
    try {
      final token = await authService.getToken();
      if (token == null) {
        throw Exception('No authentication token found');
      }

      final response = await http.get(
        Uri.parse('$baseUrl/transactions/$accountId/$transactionId'),
        headers: {
          'Authorization': 'Bearer $token',
          'Content-Type': 'application/json',
        },
      );

      if (response.statusCode == 200) {
        return Transaction.fromJson(json.decode(response.body));
      } else {
        final errorData = json.decode(response.body);
        throw Exception(errorData['error'] ?? errorData['message'] ?? 'Failed to fetch transaction');
      }
    } catch (e) {
      throw Exception('Failed to fetch transaction: $e');
    }
  }

  // Create a new transaction and update account balance
  Future<void> createTransaction(String accountId, CreateTransactionData data) async {
    try {
      final token = await authService.getToken();
      if (token == null) {
        throw Exception('No authentication token found');
      }

      final response = await http.post(
        Uri.parse('$baseUrl/transactions/$accountId'),
        headers: {
          'Authorization': 'Bearer $token',
          'Content-Type': 'application/json',
        },
        body: json.encode(data.toJson()),
      );

      if (response.statusCode != 200 && response.statusCode != 201) {
        final errorData = json.decode(response.body);
        throw Exception(errorData['error'] ?? errorData['message'] ?? 'Failed to create transaction');
      }
    } catch (e) {
      throw Exception('Failed to create transaction: $e');
    }
  }

  // Delete a transaction and restore account balance
  Future<void> deleteTransaction(String accountId, String transactionId) async {
    try {
      final token = await authService.getToken();
      if (token == null) {
        throw Exception('No authentication token found');
      }

      final response = await http.delete(
        Uri.parse('$baseUrl/transactions/$accountId/$transactionId'),
        headers: {
          'Authorization': 'Bearer $token',
          'Content-Type': 'application/json',
        },
      );

      if (response.statusCode != 200 && response.statusCode != 204) {
        final errorData = json.decode(response.body);
        throw Exception(errorData['error'] ?? errorData['message'] ?? 'Failed to delete transaction');
      }
    } catch (e) {
      throw Exception('Failed to delete transaction: $e');
    }
  }
}

final transactionService = TransactionService();
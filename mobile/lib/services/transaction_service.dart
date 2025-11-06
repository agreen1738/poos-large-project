import 'package:dio/dio.dart';
import './api_services.dart';

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
    // Backend expects exactly these 5 fields: name, amount, category, type, date
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
  final ApiService _apiService = apiService;
  
  // Get all transactions for the logged-in user
  Future<List<Transaction>> getTransactions() async {
    try {
      final response = await _apiService.get('/transactions');

      if (response.statusCode == 200) {
        final List<dynamic> data = response.data;
        return data.map((json) => Transaction.fromJson(json)).toList();
      } else {
        final errorData = response.data;
        throw Exception(errorData['error'] ?? errorData['message'] ?? 'Failed to fetch transactions');
      }
    } on DioException catch (e) {
      final errorMessage = e.response?.data['error'] ?? 
                          e.response?.data['message'] ?? 
                          'Failed to fetch transactions';
      throw Exception(errorMessage);
    } catch (e) {
      throw Exception('Failed to fetch transactions: $e');
    }
  }

  // Get transactions for a specific account
  Future<List<Transaction>> getAccountTransactions(String accountId) async {
    try {
      final response = await _apiService.get('/transactions/$accountId');

      if (response.statusCode == 200) {
        final List<dynamic> data = response.data;
        return data.map((json) => Transaction.fromJson(json)).toList();
      } else {
        final errorData = response.data;
        throw Exception(errorData['error'] ?? errorData['message'] ?? 'Failed to fetch account transactions');
      }
    } on DioException catch (e) {
      final errorMessage = e.response?.data['error'] ?? 
                          e.response?.data['message'] ?? 
                          'Failed to fetch account transactions';
      throw Exception(errorMessage);
    } catch (e) {
      throw Exception('Failed to fetch account transactions: $e');
    }
  }

  // Get a single transaction
  Future<Transaction> getTransaction(String accountId, String transactionId) async {
    try {
      final response = await _apiService.get('/transactions/$accountId/$transactionId');

      if (response.statusCode == 200) {
        return Transaction.fromJson(response.data);
      } else {
        final errorData = response.data;
        throw Exception(errorData['error'] ?? errorData['message'] ?? 'Failed to fetch transaction');
      }
    } on DioException catch (e) {
      final errorMessage = e.response?.data['error'] ?? 
                          e.response?.data['message'] ?? 
                          'Failed to fetch transaction';
      throw Exception(errorMessage);
    } catch (e) {
      throw Exception('Failed to fetch transaction: $e');
    }
  }

  // Create a new transaction and update account balance
  // Backend expects exactly 5 fields: name, amount, category, type, date
  Future<void> createTransaction(String accountId, CreateTransactionData data) async {
    try {
      final response = await _apiService.post(
        '/transactions/$accountId',
        data: data.toJson(),
      );

      if (response.statusCode != 200 && response.statusCode != 201) {
        final errorData = response.data;
        throw Exception(errorData['error'] ?? errorData['message'] ?? 'Failed to create transaction');
      }
      // Backend automatically updates the account balance
    } on DioException catch (e) {
      final errorMessage = e.response?.data['error'] ?? 
                          e.response?.data['message'] ?? 
                          'Failed to create transaction';
      throw Exception(errorMessage);
    } catch (e) {
      throw Exception('Failed to create transaction: $e');
    }
  }

  // Delete a transaction and restore account balance
  Future<void> deleteTransaction(String accountId, String transactionId) async {
    try {
      final response = await _apiService.delete('/transactions/$accountId/$transactionId');

      if (response.statusCode != 200 && response.statusCode != 204) {
        final errorData = response.data;
        throw Exception(errorData['error'] ?? errorData['message'] ?? 'Failed to delete transaction');
      }
      // Backend automatically restores the account balance
    } on DioException catch (e) {
      final errorMessage = e.response?.data['error'] ?? 
                          e.response?.data['message'] ?? 
                          'Failed to delete transaction';
      throw Exception(errorMessage);
    } catch (e) {
      throw Exception('Failed to delete transaction: $e');
    }
  }
}

final transactionService = TransactionService();
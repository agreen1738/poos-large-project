import 'package:dio/dio.dart';
import './api_services.dart';

class Account {
  final String id;
  final String userId;
  final String accountName;
  final String accountType;
  final String? accountNumber;
  final String? institution;
  final double balance;
  final String currency;
  final bool isActive;
  final String createdAt;
  final String updatedAt;

  Account({
    required this.id,
    required this.userId,
    required this.accountName,
    required this.accountType,
    this.accountNumber,
    this.institution,
    required this.balance,
    required this.currency,
    required this.isActive,
    required this.createdAt,
    required this.updatedAt,
  });

  factory Account.fromJson(Map<String, dynamic> json) {
    return Account(
      id: json['_id'] ?? '',
      userId: json['userId'] ?? '',
      accountName: json['accountName'] ?? 'Unnamed Account',
      accountType: json['accountType'] ?? 'Other',
      accountNumber: json['accountNumber']?.toString(),
      institution: json['accountInstitution'],
      balance: (json['balanace'] as num).toDouble(), // Backend typo when reading
      currency: json['currency'] ?? 'USD',
      isActive: json['isActive'] ?? true,
      createdAt: json['createdAt'] ?? '',
      updatedAt: json['updatedAt'] ?? '',
    );
  }

  Map<String, dynamic> toJson() {
    return {
      '_id': id,
      'userId': userId,
      'accountName': accountName,
      'accountType': accountType,
      if (accountNumber != null) 'accountNumber': accountNumber,
      if (institution != null) 'accountInstitution': institution,
      'balanace': balance,
      'currency': currency,
      'isActive': isActive,
      'createdAt': createdAt,
      'updatedAt': updatedAt,
    };
  }
}

class CreateAccountData {
  final String accountName;
  final String accountType;
  final int accountNumber;
  final String accountInstitution;
  final double balance;

  CreateAccountData({
    required this.accountName,
    required this.accountType,
    required this.accountNumber,
    required this.accountInstitution,
    required this.balance,
  });

  Map<String, dynamic> toJson() {
    // Backend expects "balance" 
    return {
      'accountName': accountName,
      'accountType': accountType,
      'accountNumber': accountNumber,
      'accountInstitution': accountInstitution,
      'balance': balance, // Correct spelling for creation
    };
  }
}

class UpdateAccountData {
  final String? accountName;
  final String? accountType;
  final double? balance;
  final String? currency;
  final bool? isActive;

  UpdateAccountData({
    this.accountName,
    this.accountType,
    this.balance,
    this.currency,
    this.isActive,
  });

  Map<String, dynamic> toJson() {
    final Map<String, dynamic> data = {};
    if (accountName != null) data['accountName'] = accountName;
    if (accountType != null) data['accountType'] = accountType;
    if (balance != null) data['balanace'] = balance; // Typo for updates
    if (currency != null) data['currency'] = currency;
    if (isActive != null) data['isActive'] = isActive;
    return data;
  }
}

class AccountService {
  final ApiService _apiService = apiService;

  // Get all accounts for the logged-in user
  Future<List<Account>> getAccounts() async {
    try {
      final response = await _apiService.get('/accounts');

      if (response.statusCode == 200) {
        final List<dynamic> data = response.data;
        return data.map((json) => Account.fromJson(json)).toList();
      } else {
        final errorData = response.data;
        throw Exception(errorData['error'] ?? errorData['message'] ?? 'Failed to fetch accounts');
      }
    } on DioException catch (e) {
      final errorMessage = e.response?.data['error'] ?? 
                          e.response?.data['message'] ?? 
                          'Failed to fetch accounts';
      throw Exception(errorMessage);
    } catch (e) {
      throw Exception('Failed to fetch accounts: $e');
    }
  }

  // Create a new account
  Future<void> createAccount(
    String accountName,
    String accountType,
    double balance,
    int accountNumber,
    String accountInstitution,
  ) async {
    try {
      final data = CreateAccountData(
        accountName: accountName,
        accountType: accountType,
        accountNumber: accountNumber,
        accountInstitution: accountInstitution,
        balance: balance,
      );

      final response = await _apiService.post(
        '/account',
        data: data.toJson(),
      );

      if (response.statusCode != 200 && response.statusCode != 201) {
        final errorData = response.data;
        throw Exception(errorData['error'] ?? errorData['message'] ?? 'Failed to create account');
      }
    } on DioException catch (e) {
      final errorMessage = e.response?.data['error'] ?? 
                          e.response?.data['message'] ?? 
                          'Failed to create account';
      throw Exception(errorMessage);
    } catch (e) {
      throw Exception('Failed to create account: $e');
    }
  }

  // Update an existing account
  Future<void> updateAccount(String id, UpdateAccountData data) async {
    try {
      final response = await _apiService.put(
        '/account/$id',
        data: data.toJson(),
      );

      if (response.statusCode != 200) {
        final errorData = response.data;
        throw Exception(errorData['error'] ?? errorData['message'] ?? 'Failed to update account');
      }
    } on DioException catch (e) {
      final errorMessage = e.response?.data['error'] ?? 
                          e.response?.data['message'] ?? 
                          'Failed to update account';
      throw Exception(errorMessage);
    } catch (e) {
      throw Exception('Failed to update account: $e');
    }
  }

  // Delete an account
  Future<void> deleteAccount(String id) async {
    try {
      final response = await _apiService.delete('/account/$id');

      if (response.statusCode != 200 && response.statusCode != 204) {
        final errorData = response.data;
        throw Exception(errorData['error'] ?? errorData['message'] ?? 'Failed to delete account');
      }
    } on DioException catch (e) {
      final errorMessage = e.response?.data['error'] ?? 
                          e.response?.data['message'] ?? 
                          'Failed to delete account';
      throw Exception(errorMessage);
    } catch (e) {
      throw Exception('Failed to delete account: $e');
    }
  }
}

final accountService = AccountService();
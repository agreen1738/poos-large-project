import 'package:flutter/material.dart';
import 'package:mobile/screens/settings_page.dart';
import 'package:table_calendar/table_calendar.dart';
import 'dashboard_page.dart';
import 'accounts_page.dart';
import 'analytics_page.dart';
import '../services/auth_services.dart';
import '../services/user_services.dart';
import '../services/transaction_service.dart';
import '../services/account_services.dart';
import './login_page.dart';

class TransactionsPage extends StatefulWidget {
  const TransactionsPage({super.key});

  @override
  State<TransactionsPage> createState() => _TransactionsPageState();
}

class _TransactionsPageState extends State<TransactionsPage> {
  DateTime _focusedDay = DateTime.now();
  DateTime? _selectedDay;
  User? _currentUser;
  bool _isLoading = true;
  List<Transaction> _transactions = [];
  List<Account> _accounts = [];
  String? _selectedAccountId;

  @override
  void initState() {
    super.initState();
    _loadUserData();
    _loadAccounts();
    _loadTransactions();
    _selectedDay = _focusedDay;
  }

  Future<void> _loadUserData() async {
    try {
      final user = await authService.getCurrentUser();
      setState(() {
        _currentUser = user;
      });
    } catch (e) {
      print('Error loading user data: $e');
    }
  }

  Future<void> _loadAccounts() async {
    try {
      final accounts = await accountService.getAccounts();
      setState(() {
        _accounts = accounts;
        if (accounts.isNotEmpty) {
          _selectedAccountId = accounts[0].id;
        }
      });
    } catch (e) {
      print('Error loading accounts: $e');
    }
  }

  Future<void> _loadTransactions() async {
    setState(() {
      _isLoading = true;
    });

    try {
      final transactions = await transactionService.getTransactions();
      setState(() {
        _transactions = transactions;
        _isLoading = false;
      });
    } catch (e) {
      print('Error loading transactions: $e');
      setState(() {
        _isLoading = false;
      });
    }
  }

  List<Transaction> _getTransactionsForDate(DateTime date) {
    return _transactions.where((t) {
      try {
        final transDate = DateTime.parse(t.date);
        return transDate.year == date.year &&
            transDate.month == date.month &&
            transDate.day == date.day;
      } catch (e) {
        print('Error parsing date ${t.date}: $e');
        return false;
      }
    }).toList();
  }

  List<Transaction> _getFilteredTransactions() {
    if (_selectedDay == null) {
      // Show transactions for the current month
      return _transactions.where((t) {
        final transDate = DateTime.parse(t.date);
        return transDate.year == _focusedDay.year &&
            transDate.month == _focusedDay.month;
      }).toList();
    } else {
      return _getTransactionsForDate(_selectedDay!);
    }
  }

  void _showAddTransactionDialog() {
    final nameController = TextEditingController();
    final amountController = TextEditingController();
    String? selectedCategory = 'living';
    String? selectedAccountId = _selectedAccountId;
    DateTime selectedDate = _selectedDay ?? DateTime.now();

    showDialog(
      context: context,
      builder: (BuildContext context) {
        return StatefulBuilder(
          builder: (context, setDialogState) {
            return Dialog(
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(16),
              ),
              child: Container(
                width: MediaQuery.of(context).size.width * 0.9,
                padding: const EdgeInsets.all(24),
                child: SingleChildScrollView(
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          const Text(
                            'Add Transaction',
                            style: TextStyle(
                              fontSize: 21,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                          IconButton(
                            icon: const Icon(Icons.close, size: 28),
                            onPressed: () => Navigator.of(context).pop(),
                            padding: EdgeInsets.zero,
                            constraints: const BoxConstraints(),
                          ),
                        ],
                      ),
                      const SizedBox(height: 24),
                      const Divider(height: 1),
                      const SizedBox(height: 24),
                      const Text(
                        'Account',
                        style: TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      const SizedBox(height: 8),
                      DropdownButtonFormField<String>(
                        value: selectedAccountId,
                        decoration: InputDecoration(
                          filled: true,
                          fillColor: Colors.grey[100],
                          border: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(8),
                            borderSide: BorderSide(color: Colors.grey[300]!),
                          ),
                          enabledBorder: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(8),
                            borderSide: BorderSide(color: Colors.grey[300]!),
                          ),
                          focusedBorder: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(8),
                            borderSide: const BorderSide(
                              color: Color(0xFF695EE8),
                            ),
                          ),
                        ),
                        items: _accounts.map((account) {
                          return DropdownMenuItem(
                            value: account.id,
                            child: Text(
                              '${account.accountName} (\$${account.balance.toStringAsFixed(2)})',
                            ),
                          );
                        }).toList(),
                        onChanged: (value) {
                          setDialogState(() {
                            selectedAccountId = value;
                          });
                        },
                      ),
                      const SizedBox(height: 20),
                      const Text(
                        'Transaction Name',
                        style: TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      const SizedBox(height: 8),
                      TextField(
                        controller: nameController,
                        decoration: InputDecoration(
                          hintText: 'e.g., Grocery Store',
                          hintStyle: TextStyle(color: Colors.grey[400]),
                          filled: true,
                          fillColor: Colors.grey[100],
                          border: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(8),
                            borderSide: BorderSide(color: Colors.grey[300]!),
                          ),
                          enabledBorder: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(8),
                            borderSide: BorderSide(color: Colors.grey[300]!),
                          ),
                          focusedBorder: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(8),
                            borderSide: const BorderSide(
                              color: Color(0xFF695EE8),
                            ),
                          ),
                        ),
                      ),
                      const SizedBox(height: 20),
                      const Text(
                        'Amount (will be deducted from account)',
                        style: TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      const SizedBox(height: 8),
                      TextField(
                        controller: amountController,
                        keyboardType: const TextInputType.numberWithOptions(
                          decimal: true,
                        ),
                        decoration: InputDecoration(
                          hintText: '0.00',
                          hintStyle: TextStyle(color: Colors.grey[400]),
                          filled: true,
                          fillColor: Colors.grey[100],
                          border: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(8),
                            borderSide: BorderSide(color: Colors.grey[300]!),
                          ),
                          enabledBorder: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(8),
                            borderSide: BorderSide(color: Colors.grey[300]!),
                          ),
                          focusedBorder: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(8),
                            borderSide: const BorderSide(
                              color: Color(0xFF695EE8),
                            ),
                          ),
                        ),
                      ),
                      const SizedBox(height: 8),
                      Text(
                        'Enter positive number - will be automatically deducted',
                        style: TextStyle(fontSize: 14, color: Colors.grey[600]),
                      ),
                      const SizedBox(height: 20),
                      const Text(
                        'Category',
                        style: TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      const SizedBox(height: 8),
                      DropdownButtonFormField<String>(
                        value: selectedCategory,
                        decoration: InputDecoration(
                          filled: true,
                          fillColor: Colors.grey[100],
                          border: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(8),
                            borderSide: const BorderSide(
                              color: Color(0xFF695EE8),
                              width: 2,
                            ),
                          ),
                          enabledBorder: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(8),
                            borderSide: const BorderSide(
                              color: Color(0xFF695EE8),
                              width: 2,
                            ),
                          ),
                          focusedBorder: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(8),
                            borderSide: const BorderSide(
                              color: Color(0xFF695EE8),
                              width: 2,
                            ),
                          ),
                        ),
                        items: ['savings', 'living', 'hobbies', 'gambling']
                            .map(
                              (category) => DropdownMenuItem(
                                value: category,
                                child: Text(
                                  category[0].toUpperCase() +
                                      category.substring(1),
                                ),
                              ),
                            )
                            .toList(),
                        onChanged: (value) {
                          setDialogState(() {
                            selectedCategory = value;
                          });
                        },
                      ),
                      const SizedBox(height: 20),
                      const Text(
                        'Date',
                        style: TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      const SizedBox(height: 8),
                      TextField(
                        readOnly: true,
                        decoration: InputDecoration(
                          hintText:
                              '${selectedDate.month}/${selectedDate.day}/${selectedDate.year}',
                          hintStyle: const TextStyle(color: Colors.black),
                          filled: true,
                          fillColor: Colors.grey[100],
                          suffixIcon: const Icon(Icons.calendar_today),
                          border: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(8),
                            borderSide: BorderSide(color: Colors.grey[300]!),
                          ),
                          enabledBorder: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(8),
                            borderSide: BorderSide(color: Colors.grey[300]!),
                          ),
                          focusedBorder: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(8),
                            borderSide: const BorderSide(
                              color: Color(0xFF695EE8),
                            ),
                          ),
                        ),
                        onTap: () async {
                          final DateTime? picked = await showDatePicker(
                            context: context,
                            initialDate: selectedDate,
                            firstDate: DateTime(2020),
                            lastDate: DateTime(2030),
                          );
                          if (picked != null) {
                            setDialogState(() {
                              selectedDate = picked;
                            });
                          }
                        },
                      ),
                      const SizedBox(height: 32),
                      Row(
                        children: [
                          Expanded(
                            child: TextButton(
                              onPressed: () => Navigator.of(context).pop(),
                              style: TextButton.styleFrom(
                                backgroundColor: Colors.grey[200],
                                padding: const EdgeInsets.symmetric(
                                  vertical: 16,
                                ),
                                shape: RoundedRectangleBorder(
                                  borderRadius: BorderRadius.circular(8),
                                ),
                              ),
                              child: const Text(
                                'Cancel',
                                style: TextStyle(
                                  fontSize: 18,
                                  color: Colors.black54,
                                  fontWeight: FontWeight.w600,
                                ),
                              ),
                            ),
                          ),
                          const SizedBox(width: 12),
                          Expanded(
                            child: ElevatedButton(
                              onPressed: () async {
                                if (selectedAccountId == null) {
                                  ScaffoldMessenger.of(context).showSnackBar(
                                    const SnackBar(
                                      content: Text('Please select an account'),
                                      backgroundColor: Colors.red,
                                    ),
                                  );
                                  return;
                                }

                                if (nameController.text.isEmpty) {
                                  ScaffoldMessenger.of(context).showSnackBar(
                                    const SnackBar(
                                      content: Text(
                                        'Please enter a transaction name',
                                      ),
                                      backgroundColor: Colors.red,
                                    ),
                                  );
                                  return;
                                }

                                if (amountController.text.isEmpty) {
                                  ScaffoldMessenger.of(context).showSnackBar(
                                    const SnackBar(
                                      content: Text('Please enter an amount'),
                                      backgroundColor: Colors.red,
                                    ),
                                  );
                                  return;
                                }

                                try {
                                  final amount = double.parse(
                                    amountController.text,
                                  );
                                  final negativeAmount = amount.abs() * -1;

                                  await transactionService.createTransaction(
                                    selectedAccountId!,
                                    CreateTransactionData(
                                      name: nameController.text,
                                      amount: negativeAmount,
                                      category:
                                          selectedCategory![0].toUpperCase() +
                                          selectedCategory!.substring(1),
                                      type: 'expense',
                                      date: selectedDate,
                                    ),
                                  );

                                  Navigator.of(context).pop();

                                  if (mounted) {
                                    ScaffoldMessenger.of(context).showSnackBar(
                                      const SnackBar(
                                        content: Text(
                                          'Transaction added successfully!',
                                        ),
                                        backgroundColor: Colors.green,
                                      ),
                                    );
                                  }

                                  await _loadTransactions();
                                  await _loadAccounts();
                                } catch (e) {
                                  if (mounted) {
                                    ScaffoldMessenger.of(context).showSnackBar(
                                      SnackBar(
                                        content: Text(
                                          'Failed to add transaction: ${e.toString()}',
                                        ),
                                        backgroundColor: Colors.red,
                                      ),
                                    );
                                  }
                                }
                              },
                              style: ElevatedButton.styleFrom(
                                backgroundColor: const Color(0xFF695EE8),
                                padding: const EdgeInsets.symmetric(
                                  vertical: 16,
                                ),
                                shape: RoundedRectangleBorder(
                                  borderRadius: BorderRadius.circular(8),
                                ),
                              ),
                              child: const Text(
                                'Add Transaction',
                                textAlign: TextAlign.center,
                                style: TextStyle(
                                  fontSize: 14,
                                  color: Colors.white,
                                  fontWeight: FontWeight.w600,
                                ),
                              ),
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              ),
            );
          },
        );
      },
    );
  }

  Future<void> _handleLogout() async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (BuildContext context) {
        return AlertDialog(
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(16),
          ),
          title: const Text('Logout'),
          content: const Text('Are you sure you want to logout?'),
          actions: [
            TextButton(
              onPressed: () => Navigator.of(context).pop(false),
              child: const Text('Cancel', style: TextStyle(color: Colors.grey)),
            ),
            TextButton(
              onPressed: () => Navigator.of(context).pop(true),
              style: TextButton.styleFrom(foregroundColor: Colors.red),
              child: const Text('Logout'),
            ),
          ],
        );
      },
    );

    if (confirmed == true && mounted) {
      try {
        await userService.logout();

        if (mounted) {
          Navigator.of(context).pushAndRemoveUntil(
            MaterialPageRoute(builder: (context) => const LoginPage()),
            (Route<dynamic> route) => false,
          );
        }
      } catch (error) {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text('Logout failed: ${error.toString()}'),
              backgroundColor: Colors.red,
            ),
          );
        }
      }
    }
  }

  Future<void> _deleteTransaction(
    String accountId,
    String transactionId,
  ) async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (BuildContext context) {
        return AlertDialog(
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(16),
          ),
          title: const Text('Delete Transaction'),
          content: const Text(
            'Are you sure you want to delete this transaction?',
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.of(context).pop(false),
              child: const Text('Cancel', style: TextStyle(color: Colors.grey)),
            ),
            TextButton(
              onPressed: () => Navigator.of(context).pop(true),
              style: TextButton.styleFrom(foregroundColor: Colors.red),
              child: const Text('Delete'),
            ),
          ],
        );
      },
    );

    if (confirmed == true) {
      try {
        await transactionService.deleteTransaction(accountId, transactionId);

        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('Transaction deleted successfully!'),
              backgroundColor: Colors.green,
            ),
          );
        }

        await _loadTransactions();
        await _loadAccounts();
      } catch (e) {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text('Failed to delete transaction: ${e.toString()}'),
              backgroundColor: Colors.red,
            ),
          );
        }
      }
    }
  }

  void _showProfileDialog() async {
    try {
      // Load fresh data
      final user = await authService.getCurrentUser();
      final accounts = await accountService.getAccounts();

      final totalBalance = accounts.fold<double>(
        0,
        (sum, account) => sum + account.balance,
      );

      if (!mounted) return;

      showDialog(
        context: context,
        builder: (BuildContext context) {
          return Dialog(
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(20),
            ),
            child: Container(
              padding: const EdgeInsets.all(32),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(20),
              ),
              child: SingleChildScrollView(
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    // Header with close button
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Text(
                          'Profile',
                          style: TextStyle(
                            fontSize: 24,
                            fontWeight: FontWeight.bold,
                            color: Colors.black,
                          ),
                        ),
                        IconButton(
                          icon: const Icon(
                            Icons.close,
                            size: 28,
                            color: Colors.grey,
                          ),
                          onPressed: () => Navigator.of(context).pop(),
                          padding: EdgeInsets.zero,
                          constraints: const BoxConstraints(),
                        ),
                      ],
                    ),
                    const SizedBox(height: 24),
                    // User Information
                    _buildProfileField(
                      'First Name',
                      user?.firstName ?? 'N/A',
                      Icons.person_outline,
                    ),
                    const SizedBox(height: 16),
                    _buildProfileField(
                      'Last Name',
                      user?.lastName ?? 'N/A',
                      Icons.person_outline,
                    ),
                    const SizedBox(height: 16),
                    _buildProfileField(
                      'Email',
                      user?.email ?? 'N/A',
                      Icons.email_outlined,
                    ),
                    const SizedBox(height: 16),
                    _buildProfileField(
                      'Phone Number',
                      user?.phone ?? 'N/A',
                      Icons.phone_outlined,
                    ),
                    const SizedBox(height: 16),
                    const Divider(),
                    const SizedBox(height: 16),
                    // Account Summary
                    _buildProfileField(
                      'Number of Accounts',
                      '${accounts.length}',
                      Icons.account_balance_outlined,
                    ),
                    const SizedBox(height: 16),
                    _buildProfileField(
                      'Total Balance',
                      '\$${totalBalance.toStringAsFixed(2)}',
                      Icons.account_balance_wallet_outlined,
                      valueColor: totalBalance >= 0 ? Colors.green : Colors.red,
                    ),
                    const SizedBox(height: 24),
                    // Close Button
                    SizedBox(
                      width: double.infinity,
                      child: ElevatedButton(
                        onPressed: () => Navigator.of(context).pop(),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: const Color(0xFF695EE8),
                          foregroundColor: Colors.white,
                          padding: const EdgeInsets.symmetric(vertical: 16),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(12),
                          ),
                        ),
                        child: const Text(
                          'Close',
                          style: TextStyle(
                            fontSize: 18,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          );
        },
      );
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Failed to load profile: ${e.toString()}'),
            backgroundColor: Colors.red,
          ),
        );
      }
    }
  }

  Widget _buildProfileField(
    String label,
    String value,
    IconData icon, {
    Color? valueColor,
  }) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.grey[100],
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: Colors.grey[300]!),
      ),
      child: Row(
        children: [
          Icon(icon, color: const Color(0xFF695EE8), size: 24),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  label,
                  style: TextStyle(
                    fontSize: 12,
                    color: Colors.grey[600],
                    fontWeight: FontWeight.w500,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  value,
                  style: TextStyle(
                    fontSize: 16,
                    color: valueColor ?? Colors.black,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final filteredTransactions = _getFilteredTransactions();

    return Scaffold(
      drawer: Drawer(
        child: Container(
          color: Colors.grey[200],
          child: Column(
            children: [
              Container(
                padding: const EdgeInsets.all(20),
                decoration: const BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.only(
                    bottomLeft: Radius.circular(20),
                    bottomRight: Radius.circular(20),
                  ),
                ),
                child: SafeArea(
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text(
                        'Wealth Tracker',
                        style: TextStyle(
                          fontSize: 17,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      Row(
                        children: [
                          IconButton(
                            icon: const Icon(Icons.notifications_outlined),
                            onPressed: () {},
                          ),
                          IconButton(
                            icon: const Icon(Icons.settings_outlined),
                            onPressed: () {
                              Navigator.pop(context);
                              Navigator.pushReplacement(
                                context,
                                MaterialPageRoute(
                                  builder: (context) => const SettingsPage(),
                                ),
                              );
                            },
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 1),
              Padding(
                padding: const EdgeInsets.all(20),
                child: Column(
                  children: [
                    _buildDrawerButton(
                      'Dashboard',
                      false,
                      onTap: () {
                        Navigator.pop(context);
                        Navigator.pushReplacement(
                          context,
                          MaterialPageRoute(
                            builder: (context) => const DashboardPage(),
                          ),
                        );
                      },
                    ),
                    const SizedBox(height: 10),
                    _buildDrawerButton('Transactions', true),
                    const SizedBox(height: 10),
                    _buildDrawerButton(
                      'Accounts',
                      false,
                      onTap: () {
                        Navigator.pop(context);
                        Navigator.pushReplacement(
                          context,
                          MaterialPageRoute(
                            builder: (context) => const AccountsPage(),
                          ),
                        );
                      },
                    ),
                    const SizedBox(height: 10),
                    _buildDrawerButton(
                      'Analytics',
                      false,
                      onTap: () {
                        Navigator.pop(context);
                        Navigator.pushReplacement(
                          context,
                          MaterialPageRoute(
                            builder: (context) => const AnalyticsPage(),
                          ),
                        );
                      },
                    ),
                    const SizedBox(height: 10),
                    _buildDrawerButton(
                      'Settings',
                      false,
                      onTap: () {
                        Navigator.pop(context);
                        Navigator.pushReplacement(
                          context,
                          MaterialPageRoute(
                            builder: (context) => const SettingsPage(),
                          ),
                        );
                      },
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
      body: Container(
        decoration: const BoxDecoration(
          gradient: LinearGradient(
            colors: [Color(0xFF695EE8), Color(0xFF836AE0)],
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
          ),
        ),
        child: SafeArea(
          child: Column(
            children: [
              // Header
              Stack(
                children: [
                  Positioned(
                    top: 0,
                    left: 0,
                    right: 0,
                    child: Container(
                      height: 105,
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.only(
                          topLeft: Radius.circular(10),
                          topRight: Radius.circular(10),
                        ),
                        boxShadow: [
                          BoxShadow(
                            color: Colors.black.withOpacity(0.1),
                            blurRadius: 10,
                            spreadRadius: 2,
                          ),
                        ],
                      ),
                    ),
                  ),
                  Padding(
                    padding: const EdgeInsets.all(16.0),
                    child: Row(
                      children: [
                        Builder(
                          builder: (context) => IconButton(
                            icon: const Icon(
                              Icons.menu,
                              color: Colors.black,
                              size: 30,
                            ),
                            onPressed: () {
                              Scaffold.of(context).openDrawer();
                            },
                          ),
                        ),
                        const Spacer(),
                        Column(
                          children: [
                            Text(
                              _isLoading
                                  ? 'Hello!'
                                  : 'Hello ${_currentUser?.firstName ?? 'User'}!',
                              style: const TextStyle(
                                fontSize: 24,
                                fontWeight: FontWeight.bold,
                                color: Colors.black,
                              ),
                            ),
                            const Text(
                              'Transactions',
                              style: TextStyle(
                                fontSize: 16,
                                color: Colors.black,
                              ),
                            ),
                          ],
                        ),
                        const Spacer(),
                        GestureDetector(
                          onTap: () => _showProfileDialog(),
                          child: Container(
                            width: 50,
                            height: 50,
                            decoration: const BoxDecoration(
                              color: Colors.white,
                              shape: BoxShape.circle,
                            ),
                            child: const Icon(
                              Icons.person,
                              size: 30,
                              color: Colors.black,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
              // Main content
              Expanded(
                child: Stack(
                  children: [
                    Container(
                      decoration: const BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.only(
                          topLeft: Radius.circular(1),
                          topRight: Radius.circular(1),
                          bottomLeft: Radius.circular(10),
                          bottomRight: Radius.circular(10),
                        ),
                      ),
                      child: SingleChildScrollView(
                        padding: const EdgeInsets.fromLTRB(20, 20, 20, 80),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            // Calendar section
                            Container(
                              padding: const EdgeInsets.all(16),
                              decoration: BoxDecoration(
                                color: Colors.grey[200],
                                border: Border.all(color: Colors.grey[300]!),
                                borderRadius: BorderRadius.circular(8),
                              ),
                              child: TableCalendar(
                                firstDay: DateTime.utc(2020, 1, 1),
                                lastDay: DateTime.utc(2030, 12, 31),
                                focusedDay: _focusedDay,
                                selectedDayPredicate: (day) {
                                  return isSameDay(_selectedDay, day);
                                },
                                onDaySelected: (selectedDay, focusedDay) {
                                  setState(() {
                                    _selectedDay =
                                        isSameDay(_selectedDay, selectedDay)
                                        ? null
                                        : selectedDay;
                                    _focusedDay = focusedDay;
                                  });
                                },
                                onPageChanged: (focusedDay) {
                                  setState(() {
                                    _focusedDay = focusedDay;
                                    _selectedDay = null;
                                  });
                                },
                                calendarFormat: CalendarFormat.month,
                                headerStyle: const HeaderStyle(
                                  formatButtonVisible: false,
                                  titleCentered: true,
                                  titleTextStyle: TextStyle(
                                    fontSize: 16,
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                                calendarStyle: CalendarStyle(
                                  selectedDecoration: const BoxDecoration(
                                    color: Color(0xFF5DA5DA),
                                    shape: BoxShape.circle,
                                  ),
                                  selectedTextStyle: const TextStyle(
                                    color: Colors.white,
                                    fontSize: 16,
                                  ),
                                  todayDecoration: BoxDecoration(
                                    color: Colors.grey[300],
                                    shape: BoxShape.circle,
                                  ),
                                  defaultTextStyle: const TextStyle(
                                    fontSize: 14,
                                  ),
                                  weekendTextStyle: const TextStyle(
                                    fontSize: 14,
                                  ),
                                  cellMargin: const EdgeInsets.all(4),
                                ),
                                daysOfWeekStyle: const DaysOfWeekStyle(
                                  weekdayStyle: TextStyle(
                                    fontSize: 12,
                                    fontWeight: FontWeight.bold,
                                  ),
                                  weekendStyle: TextStyle(
                                    fontSize: 12,
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                                calendarBuilders: CalendarBuilders(
                                  defaultBuilder: (context, day, focusedDay) {
                                    final transactions =
                                        _getTransactionsForDate(day);
                                    if (transactions.isNotEmpty) {
                                      return Stack(
                                        children: [
                                          Container(
                                            margin: const EdgeInsets.all(4),
                                            decoration: BoxDecoration(
                                              color: Colors.blue[50],
                                              shape: BoxShape.circle,
                                            ),
                                            child: Center(
                                              child: Text(
                                                '${day.day}',
                                                style: const TextStyle(
                                                  fontSize: 14,
                                                ),
                                              ),
                                            ),
                                          ),
                                          Positioned(
                                            right: 2,
                                            top: 2,
                                            child: Container(
                                              padding: const EdgeInsets.all(4),
                                              decoration: BoxDecoration(
                                                color: const Color(0xFF695EE8),
                                                shape: BoxShape.circle,
                                                border: Border.all(
                                                  color: Colors.white,
                                                  width: 1,
                                                ),
                                              ),
                                              constraints: const BoxConstraints(
                                                minWidth: 18,
                                                minHeight: 18,
                                              ),
                                              child: Center(
                                                child: Text(
                                                  '${transactions.length}',
                                                  style: const TextStyle(
                                                    color: Colors.white,
                                                    fontSize: 10,
                                                    fontWeight: FontWeight.bold,
                                                  ),
                                                ),
                                              ),
                                            ),
                                          ),
                                        ],
                                      );
                                    }
                                    return null;
                                  },
                                  selectedBuilder: (context, day, focusedDay) {
                                    final transactions =
                                        _getTransactionsForDate(day);
                                    return Stack(
                                      children: [
                                        Container(
                                          margin: const EdgeInsets.all(4),
                                          decoration: const BoxDecoration(
                                            color: Color(0xFF5DA5DA),
                                            shape: BoxShape.circle,
                                          ),
                                          child: Center(
                                            child: Text(
                                              '${day.day}',
                                              style: const TextStyle(
                                                color: Colors.white,
                                                fontSize: 16,
                                              ),
                                            ),
                                          ),
                                        ),
                                        if (transactions.isNotEmpty)
                                          Positioned(
                                            right: 2,
                                            top: 2,
                                            child: Container(
                                              padding: const EdgeInsets.all(4),
                                              decoration: BoxDecoration(
                                                color: const Color(0xFF695EE8),
                                                shape: BoxShape.circle,
                                                border: Border.all(
                                                  color: Colors.white,
                                                  width: 1,
                                                ),
                                              ),
                                              constraints: const BoxConstraints(
                                                minWidth: 18,
                                                minHeight: 18,
                                              ),
                                              child: Center(
                                                child: Text(
                                                  '${transactions.length}',
                                                  style: const TextStyle(
                                                    color: Colors.white,
                                                    fontSize: 10,
                                                    fontWeight: FontWeight.bold,
                                                  ),
                                                ),
                                              ),
                                            ),
                                          ),
                                      ],
                                    );
                                  },
                                  todayBuilder: (context, day, focusedDay) {
                                    final transactions =
                                        _getTransactionsForDate(day);
                                    return Stack(
                                      children: [
                                        Container(
                                          margin: const EdgeInsets.all(4),
                                          decoration: BoxDecoration(
                                            color: Colors.grey[300],
                                            shape: BoxShape.circle,
                                          ),
                                          child: Center(
                                            child: Text(
                                              '${day.day}',
                                              style: const TextStyle(
                                                fontSize: 14,
                                              ),
                                            ),
                                          ),
                                        ),
                                        if (transactions.isNotEmpty)
                                          Positioned(
                                            right: 2,
                                            top: 2,
                                            child: Container(
                                              padding: const EdgeInsets.all(4),
                                              decoration: BoxDecoration(
                                                color: const Color(0xFF695EE8),
                                                shape: BoxShape.circle,
                                                border: Border.all(
                                                  color: Colors.white,
                                                  width: 1,
                                                ),
                                              ),
                                              constraints: const BoxConstraints(
                                                minWidth: 18,
                                                minHeight: 18,
                                              ),
                                              child: Center(
                                                child: Text(
                                                  '${transactions.length}',
                                                  style: const TextStyle(
                                                    color: Colors.white,
                                                    fontSize: 10,
                                                    fontWeight: FontWeight.bold,
                                                  ),
                                                ),
                                              ),
                                            ),
                                          ),
                                      ],
                                    );
                                  },
                                ),
                              ),
                            ),
                            const SizedBox(height: 16),
                            // Add Transaction Button
                            Center(
                              child: ElevatedButton.icon(
                                onPressed: _showAddTransactionDialog,
                                icon: const Icon(Icons.add),
                                label: const Text('Add Transaction'),
                                style: ElevatedButton.styleFrom(
                                  backgroundColor: const Color(0xFF695EE8),
                                  foregroundColor: Colors.white,
                                  padding: const EdgeInsets.symmetric(
                                    horizontal: 24,
                                    vertical: 12,
                                  ),
                                  shape: RoundedRectangleBorder(
                                    borderRadius: BorderRadius.circular(8),
                                  ),
                                ),
                              ),
                            ),
                            const SizedBox(height: 30),
                            // Recent transactions section
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                Text(
                                  _selectedDay != null
                                      ? 'TRANSACTIONS ON ${_selectedDay!.month}/${_selectedDay!.day}/${_selectedDay!.year}'
                                      : 'RECENT TRANSACTIONS',
                                  style: const TextStyle(
                                    fontSize: 12,
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                                if (_selectedDay != null)
                                  TextButton(
                                    onPressed: () {
                                      setState(() {
                                        _selectedDay = null;
                                      });
                                    },
                                    child: const Text(
                                      'Show All',
                                      style: TextStyle(
                                        color: Color(0xFF695EE8),
                                        fontWeight: FontWeight.bold,
                                      ),
                                    ),
                                  ),
                              ],
                            ),
                            const SizedBox(height: 10),
                            Container(
                              padding: const EdgeInsets.all(16),
                              decoration: BoxDecoration(
                                border: Border.all(color: Colors.grey[300]!),
                                borderRadius: BorderRadius.circular(8),
                                color: Colors.grey[200],
                              ),
                              child: Column(
                                children: [
                                  Row(
                                    children: [
                                      const Expanded(
                                        flex: 2,
                                        child: Text(
                                          'Date',
                                          style: TextStyle(
                                            fontWeight: FontWeight.bold,
                                            color: Colors.black,
                                            fontSize: 14,
                                          ),
                                        ),
                                      ),
                                      const Expanded(
                                        flex: 2,
                                        child: Text(
                                          'Name',
                                          style: TextStyle(
                                            fontWeight: FontWeight.bold,
                                            color: Colors.black,
                                            fontSize: 14,
                                          ),
                                        ),
                                      ),
                                      const Expanded(
                                        flex: 1,
                                        child: Text(
                                          'Amount',
                                          textAlign: TextAlign.right,
                                          softWrap: false,
                                          overflow: TextOverflow.visible,
                                          style: TextStyle(
                                            fontWeight: FontWeight.bold,
                                            color: Colors.black,
                                            fontSize: 14,
                                          ),
                                        ),
                                      ),
                                      const SizedBox(width: 40),
                                    ],
                                  ),
                                  const SizedBox(height: 10),
                                  Container(
                                    height: 250,
                                    decoration: BoxDecoration(
                                      color: Colors.white,
                                      borderRadius: BorderRadius.circular(4),
                                    ),
                                    child: _isLoading
                                        ? const Center(
                                            child: CircularProgressIndicator(
                                              color: Color(0xFF695EE8),
                                            ),
                                          )
                                        : filteredTransactions.isEmpty
                                        ? Center(
                                            child: Text(
                                              _selectedDay != null
                                                  ? 'No transactions found for this date.'
                                                  : 'No transactions found for this month.',
                                              style: TextStyle(
                                                fontSize: 14,
                                                color: Colors.grey[600],
                                              ),
                                            ),
                                          )
                                        : ListView.separated(
                                            padding: const EdgeInsets.all(12),
                                            itemCount:
                                                filteredTransactions.length,
                                            separatorBuilder:
                                                (context, index) =>
                                                    const Divider(height: 20),
                                            itemBuilder: (context, index) {
                                              final transaction =
                                                  filteredTransactions[index];
                                              return _buildTransactionRow(
                                                transaction.date,
                                                transaction.name ?? 'Unknown',
                                                transaction.amount
                                                    .abs()
                                                    .toStringAsFixed(2),
                                                transaction.accountId ?? '',
                                                transaction.id ?? '',
                                              );
                                            },
                                          ),
                                  ),
                                ],
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                    // logout button
                    Positioned(
                      bottom: 20,
                      right: 20,
                      child: TextButton(
                        onPressed: _handleLogout,
                        style: TextButton.styleFrom(
                          backgroundColor: Colors.grey[300],
                          padding: const EdgeInsets.symmetric(
                            horizontal: 30,
                            vertical: 12,
                          ),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(8),
                          ),
                        ),
                        child: const Text(
                          'Logout',
                          style: TextStyle(color: Colors.black, fontSize: 16),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildTransactionRow(
    String date,
    String name,
    String amount,
    String accountId,
    String transactionId,
  ) {
    String formattedDate = date;
    try {
      final parsedDate = DateTime.parse(date);
      formattedDate =
          '${parsedDate.year}-${parsedDate.month.toString().padLeft(2, '0')}-${parsedDate.day.toString().padLeft(2, '0')}';
    } catch (e) {
      print('Error parsing date: $e');
    }
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        children: [
          Expanded(
            flex: 2,
            child: Text(
              formattedDate,
              style: const TextStyle(fontSize: 12, color: Colors.black54),
              overflow: TextOverflow.ellipsis,
            ),
          ),
          Expanded(
            flex: 2,
            child: Text(
              name,
              style: const TextStyle(fontSize: 14, color: Colors.black54),
              overflow: TextOverflow.ellipsis,
            ),
          ),
          Expanded(
            flex: 1,
            child: Text(
              '\$$amount', 
              textAlign: TextAlign.right,
              style: const TextStyle(
                fontWeight: FontWeight.bold,
                fontSize: 13,
                color: Colors.black54,
              ),
            ),
          ),
          SizedBox(
            width: 40,
            child: IconButton(
              icon: const Icon(Icons.delete, color: Colors.red, size: 20),
              onPressed: () {
                if (accountId.isNotEmpty && transactionId.isNotEmpty) {
                  _deleteTransaction(accountId, transactionId);
                }
              },
              padding: EdgeInsets.zero,
              constraints: const BoxConstraints(),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildDrawerButton(
    String text,
    bool isSelected, {
    VoidCallback? onTap,
  }) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        width: double.infinity,
        padding: const EdgeInsets.symmetric(vertical: 15),
        decoration: BoxDecoration(
          color: isSelected ? const Color(0xFF7B7FD9) : const Color(0xFFB5B5D9),
          borderRadius: BorderRadius.circular(10),
        ),
        child: Center(
          child: Text(
            text,
            style: const TextStyle(
              color: Colors.white,
              fontSize: 16,
              fontWeight: FontWeight.w600,
            ),
          ),
        ),
      ),
    );
  }
}

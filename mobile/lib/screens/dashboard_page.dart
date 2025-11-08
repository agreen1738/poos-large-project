import 'package:flutter/material.dart';
import 'package:fl_chart/fl_chart.dart';
import 'package:mobile/screens/accounts_page.dart';
import 'package:mobile/screens/transactions_page.dart';
import 'package:table_calendar/table_calendar.dart';
import 'package:mobile/screens/analytics_page.dart';
import 'package:mobile/screens/settings_page.dart';
import '../services/auth_services.dart';
import './login_page.dart';
import '../services/user_services.dart';
import '../services/analytics_services.dart';
import '../services/account_services.dart';
import '../services/transaction_service.dart';

class DashboardPage extends StatefulWidget {
  const DashboardPage({super.key});

  @override
  State<DashboardPage> createState() => _DashboardPageState();
}

class _DashboardPageState extends State<DashboardPage> {
  DateTime _focusedDay = DateTime.now();
  DateTime? _selectedDay;
  User? _currentUser;
  bool _isLoading = true;
  bool _isLoadingAnalytics = true;
  bool _isLoadingAccounts = true;

  List<CategoryData> _categoryData = [];
  double _totalSpending = 0.0;
  List<Account> _accounts = [];
  List<Transaction> _transactions = [];
  bool _isLoadingTransactions = true;

  // Colors for each category
  final Map<String, Color> _categoryColors = {
    'Savings': const Color(0xFFFFC842),
    'Living': const Color(0xFF5DA5DA),
    'Hobbies': const Color(0xFFFF9F5A),
    'Gambling': const Color(0xFFB5B5B5),
  };

  @override
  void initState() {
    super.initState();
    _selectedDay = _focusedDay;
    _loadUserData();
    _loadAnalyticsData();
    _loadAccounts();
    _loadTransactions();
  }

  Future<void> _loadUserData() async {
    try {
      final user = await authService.getCurrentUser();
      setState(() {
        _currentUser = user;
        _isLoading = false;
      });
    } catch (e) {
      print('Error loading user data: $e');
      setState(() {
        _isLoading = false;
      });
    }
  }

  Future<void> _loadAnalyticsData() async {
    setState(() {
      _isLoadingAnalytics = true;
    });

    try {
      final response = await analyticsService.getCategoryAnalytics(
        accountId: 'all',
      );

      setState(() {
        _categoryData = response.categories;
        _totalSpending = response.totalSpending;
        _isLoadingAnalytics = false;
      });
    } catch (e) {
      setState(() {
        _categoryData = [];
        _totalSpending = 0.0;
        _isLoadingAnalytics = false;
      });
    }
  }

  Future<void> _loadAccounts() async {
    setState(() {
      _isLoadingAccounts = true;
    });

    try {
      final accounts = await accountService.getAccounts();
      setState(() {
        _accounts = accounts;
        _isLoadingAccounts = false;
      });
    } catch (e) {
      print('Error loading accounts: $e');
      setState(() {
        _accounts = [];
        _isLoadingAccounts = false;
      });
    }
  }

  Future<void> _loadTransactions() async {
    setState(() {
      _isLoadingTransactions = true;
    });

    try {
      final transactions = await transactionService.getTransactions();
      transactions.sort((a, b) {
        try {
          final dateA = DateTime.parse(a.date);
          final dateB = DateTime.parse(b.date);
          return dateB.compareTo(dateA);
        } catch (e) {
          return 0;
        }
      });

      setState(() {
        _transactions = transactions;
        _isLoadingTransactions = false;
      });
    } catch (e) {
      print('Error loading transactions: $e');
      setState(() {
        _transactions = [];
        _isLoadingTransactions = false;
      });
    }
  }

  // Get transactions for the selected date
  List<Transaction> _getTransactionsForSelectedDate() {
    if (_selectedDay == null) return [];
    
    return _transactions.where((transaction) {
      try {
        final transactionDate = DateTime.parse(transaction.date);
        return transactionDate.year == _selectedDay!.year &&
               transactionDate.month == _selectedDay!.month &&
               transactionDate.day == _selectedDay!.day;
      } catch (e) {
        return false;
      }
    }).toList();
  }

  // Get transaction count for a specific date
  int _getTransactionCountForDate(DateTime day) {
    return _transactions.where((transaction) {
      try {
        final transactionDate = DateTime.parse(transaction.date);
        return transactionDate.year == day.year &&
               transactionDate.month == day.month &&
               transactionDate.day == day.day;
      } catch (e) {
        return false;
      }
    }).length;
  }

  String _maskAccountNumber(String? accountNumber) {
    if (accountNumber == null || accountNumber.isEmpty) return 'N/A';
    if (accountNumber.length <= 4) return accountNumber;
    return '****${accountNumber.substring(accountNumber.length - 4)}';
  }

  List<PieChartSectionData> _buildPieChartSections() {
    if (_categoryData.isEmpty) {
      return [
        PieChartSectionData(
          color: Colors.grey[400]!,
          value: 100,
          title: '',
          radius: 70,
        ),
      ];
    }

    return _categoryData.map((category) {
      return PieChartSectionData(
        color: _categoryColors[category.name] ?? Colors.grey,
        value: category.value,
        title: '',
        radius: 70,
      );
    }).toList();
  }

  // Format date for display
  String _formatDate(DateTime date) {
    return '${date.month}/${date.day}/${date.year}';
  }

  Future<void> _handleLogout() async {
    // Show confirmation dialog
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
        // call logout
        await userService.logout();

        if (mounted) {
          Navigator.of(context).pushAndRemoveUntil(
            MaterialPageRoute(builder: (context) => const LoginPage()),
            (Route<dynamic> route) => false,
          );
        }
      } catch (error) {
        // Show error if logout fails
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

  @override
  Widget build(BuildContext context) {
    final selectedDateTransactions = _getTransactionsForSelectedDate();
    
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
                          fontSize: 20,
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
                padding: const EdgeInsets.only(left: 20, top: 10, bottom: 5),
                child: Align(alignment: Alignment.centerLeft),
              ),
              Padding(
                padding: const EdgeInsets.all(20),
                child: Column(
                  children: [
                    _buildDrawerButton('Dashboard', true),
                    const SizedBox(height: 10),
                    _buildDrawerButton(
                      'Transactions',
                      false,
                      onTap: () {
                        Navigator.pop(context);
                        Navigator.pushReplacement(
                          context,
                          MaterialPageRoute(
                            builder: (context) => const TransactionsPage(),
                          ),
                        );
                      },
                    ),
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
                    top: 10,
                    left: 0,
                    right: 0,
                    child: Container(
                      height: 80,
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
                              'Dashboard',
                              style: TextStyle(
                                fontSize: 16,
                                color: Colors.black,
                              ),
                            ),
                          ],
                        ),
                        const Spacer(),
                        Container(
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
                        padding: const EdgeInsets.fromLTRB(20, 0, 20, 80),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const SizedBox(height: 20),
                            Row(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                // Accounts section
                                SizedBox(
                                  width: 160,
                                  child: Column(
                                    crossAxisAlignment:
                                        CrossAxisAlignment.start,
                                    children: [
                                      const Text(
                                        'ACCOUNTS',
                                        style: TextStyle(
                                          fontSize: 16,
                                          fontWeight: FontWeight.bold,
                                        ),
                                      ),
                                      const SizedBox(height: 10),
                                      Container(
                                        height: 362,
                                        decoration: BoxDecoration(
                                          color: Colors.grey[200],
                                          borderRadius: BorderRadius.circular(
                                            8,
                                          ),
                                        ),
                                        child: _isLoadingAccounts
                                            ? const Center(
                                                child:
                                                    CircularProgressIndicator(),
                                              )
                                            : _accounts.isEmpty
                                            ? Center(
                                                child: Padding(
                                                  padding: const EdgeInsets.all(
                                                    16.0,
                                                  ),
                                                  child: Text(
                                                    'No accounts yet',
                                                    style: TextStyle(
                                                      fontSize: 14,
                                                      color: Colors.grey[600],
                                                    ),
                                                    textAlign: TextAlign.center,
                                                  ),
                                                ),
                                              )
                                            : ListView.builder(
                                                padding: const EdgeInsets.all(
                                                  12,
                                                ),
                                                itemCount: _accounts.length,
                                                itemBuilder: (context, index) {
                                                  final account =
                                                      _accounts[index];
                                                  return Container(
                                                    margin:
                                                        const EdgeInsets.only(
                                                          bottom: 8,
                                                        ),
                                                    padding:
                                                        const EdgeInsets.all(
                                                          12,
                                                        ),
                                                    decoration: BoxDecoration(
                                                      color: Colors.white,
                                                      borderRadius:
                                                          BorderRadius.circular(
                                                            8,
                                                          ),
                                                      border: Border.all(
                                                        color:
                                                            Colors.grey[300]!,
                                                      ),
                                                    ),
                                                    child: Column(
                                                      crossAxisAlignment:
                                                          CrossAxisAlignment
                                                              .start,
                                                      children: [
                                                        Text(
                                                          _maskAccountNumber(
                                                            account
                                                                .accountNumber,
                                                          ),
                                                          style:
                                                              const TextStyle(
                                                                fontSize: 12,
                                                                fontWeight:
                                                                    FontWeight
                                                                        .w500,
                                                              ),
                                                        ),
                                                        const SizedBox(
                                                          height: 4,
                                                        ),
                                                        Text(
                                                          '\$${account.balance.toStringAsFixed(2)}',
                                                          style:
                                                              const TextStyle(
                                                                fontSize: 14,
                                                                fontWeight:
                                                                    FontWeight
                                                                        .bold,
                                                              ),
                                                        ),
                                                      ],
                                                    ),
                                                  );
                                                },
                                              ),
                                      ),
                                    ],
                                  ),
                                ),
                                const SizedBox(width: 10),
                                // Monthly breakdown section
                                Expanded(
                                  flex: 1,
                                  child: Column(
                                    crossAxisAlignment:
                                        CrossAxisAlignment.start,
                                    children: [
                                      const Text(
                                        'MONTHLY BREAKDOWN',
                                        style: TextStyle(
                                          fontSize: 14,
                                          fontWeight: FontWeight.bold,
                                        ),
                                      ),
                                      const SizedBox(height: 10),
                                      Container(
                                        padding: const EdgeInsets.all(16),
                                        decoration: BoxDecoration(
                                          color: Colors.grey[200],
                                          border: Border.all(
                                            color: Colors.grey[50]!,
                                          ),
                                          borderRadius: BorderRadius.circular(
                                            8,
                                          ),
                                        ),
                                        child: Column(
                                          children: [
                                            Container(
                                              height: 250,
                                              padding: const EdgeInsets.all(16),
                                              decoration: BoxDecoration(
                                                color: Colors.white,
                                                border: Border.all(
                                                  color: Colors.grey[400]!,
                                                ),
                                              ),
                                              child: _isLoadingAnalytics
                                                  ? const Center(
                                                      child:
                                                          CircularProgressIndicator(),
                                                    )
                                                  : _totalSpending == 0.0
                                                  ? Center(
                                                      child: Text(
                                                        'No spending data available',
                                                        style: TextStyle(
                                                          fontSize: 14,
                                                          color:
                                                              Colors.grey[600],
                                                        ),
                                                        textAlign:
                                                            TextAlign.center,
                                                      ),
                                                    )
                                                  : PieChart(
                                                      PieChartData(
                                                        sectionsSpace: 2,
                                                        centerSpaceRadius: 0,
                                                        sections:
                                                            _buildPieChartSections(),
                                                      ),
                                                    ),
                                            ),
                                            const SizedBox(height: 16),
                                            Container(
                                              padding: const EdgeInsets.all(12),
                                              decoration: BoxDecoration(
                                                color: Colors.white,
                                                border: Border.all(
                                                  color: Colors.grey[400]!,
                                                ),
                                                borderRadius:
                                                    BorderRadius.circular(8),
                                              ),
                                              child: Column(
                                                children: [
                                                  Row(
                                                    mainAxisAlignment:
                                                        MainAxisAlignment
                                                            .spaceAround,
                                                    children: [
                                                      _buildLegendItem(
                                                        'Savings ',
                                                        const Color(0xFFFFC842),
                                                      ),
                                                      _buildLegendItem(
                                                        'Hobbies',
                                                        const Color(0xFFFF9F5A),
                                                      ),
                                                    ],
                                                  ),
                                                  const SizedBox(height: 8),
                                                  Row(
                                                    mainAxisAlignment:
                                                        MainAxisAlignment
                                                            .spaceAround,
                                                    children: [
                                                      _buildLegendItem(
                                                        'Living ',
                                                        const Color(0xFF5DA5DA),
                                                      ),
                                                      _buildLegendItem(
                                                        'Gambling',
                                                        const Color(0xFFB5B5B5),
                                                      ),
                                                    ],
                                                  ),
                                                ],
                                              ),
                                            ),
                                          ],
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                              ],
                            ),
                            const SizedBox(height: 15),
                            // Upcoming changes section
                            const Text(
                              'UPCOMING CHANGES',
                              style: TextStyle(
                                fontSize: 16,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                            const SizedBox(height: 10),
                            Container(
                              decoration: BoxDecoration(
                                color: Colors.grey[200],
                                border: Border.all(color: Colors.grey[300]!),
                                borderRadius: BorderRadius.circular(8),
                              ),
                              child: Row(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  // Calendar with transaction counts
                                  Expanded(
                                    flex: 2,
                                    child: Container(
                                      color: Colors.grey[200],
                                      child: TableCalendar(
                                        firstDay: DateTime.utc(2020, 1, 1),
                                        lastDay: DateTime.utc(2030, 12, 31),
                                        focusedDay: _focusedDay,
                                        selectedDayPredicate: (day) {
                                          return isSameDay(_selectedDay, day);
                                        },
                                        onDaySelected:
                                            (selectedDay, focusedDay) {
                                              setState(() {
                                                _selectedDay = selectedDay;
                                                _focusedDay = focusedDay;
                                              });
                                            },
                                        calendarFormat: CalendarFormat.month,
                                        headerStyle: const HeaderStyle(
                                          formatButtonVisible: false,
                                          titleCentered: true,
                                          titleTextStyle: TextStyle(
                                            fontSize: 11,
                                            fontWeight: FontWeight.bold,
                                          ),
                                        ),
                                        calendarStyle: CalendarStyle(
                                          selectedDecoration:
                                              const BoxDecoration(
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
                                            fontSize: 11,
                                          ),
                                          weekendTextStyle: const TextStyle(
                                            fontSize: 11,
                                          ),
                                          cellMargin: const EdgeInsets.all(4),
                                        ),
                                        daysOfWeekStyle: const DaysOfWeekStyle(
                                          weekdayStyle: TextStyle(fontSize: 9),
                                          weekendStyle: TextStyle(fontSize: 9),
                                        ),
                                        calendarBuilders: CalendarBuilders(
                                          defaultBuilder: (context, day, focusedDay) {
                                            final count = _getTransactionCountForDate(day);
                                            if (count > 0) {
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
                                                          fontSize: 11,
                                                        ),
                                                      ),
                                                    ),
                                                  ),
                                                  Positioned(
                                                    bottom: 0,
                                                    left: 0,
                                                    right: 0,
                                                    child: Center(
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
                                                            '$count',
                                                            style: const TextStyle(
                                                              color: Colors.white,
                                                              fontSize: 8,
                                                              fontWeight: FontWeight.bold,
                                                            ),
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
                                          outsideBuilder: (context, day, focusedDay) {
                                            final count = _getTransactionCountForDate(day);
                                            if (count > 0) {
                                              return Stack(
                                                children: [
                                                  Container(
                                                    margin: const EdgeInsets.all(4),
                                                    child: Center(
                                                      child: Text(
                                                        '${day.day}',
                                                        style: TextStyle(
                                                          fontSize: 11,
                                                          color: Colors.grey[400],
                                                        ),
                                                      ),
                                                    ),
                                                  ),
                                                  Positioned(
                                                    bottom: 0,
                                                    left: 0,
                                                    right: 0,
                                                    child: Center(
                                                      child: Container(
                                                        padding: const EdgeInsets.all(4),
                                                        decoration: BoxDecoration(
                                                          color: const Color(0xFF695EE8).withOpacity(0.5),
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
                                                            '$count',
                                                            style: const TextStyle(
                                                              color: Colors.white,
                                                              fontSize: 8,
                                                              fontWeight: FontWeight.bold,
                                                            ),
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
                                        ),
                                      ),
                                    ),
                                  ),
                                  const SizedBox(width: 15),
                                  // Transactions for selected date
                                  Expanded(
                                    child: Padding(
                                      padding: const EdgeInsets.only(
                                        top: 16,
                                        right: 16,
                                        bottom: 10,
                                      ),
                                      child: Align(
                                        alignment: Alignment.topLeft,
                                        child: Container(
                                          height: 315,
                                          padding: const EdgeInsets.all(10),
                                          decoration: BoxDecoration(
                                            color: Colors.white,
                                            border: Border.all(
                                              color: Colors.grey[300]!,
                                            ),
                                            borderRadius: BorderRadius.circular(
                                              8,
                                            ),
                                          ),
                                          child: Column(
                                            crossAxisAlignment: CrossAxisAlignment.start,
                                            children: [
                                              Text(
                                                'Transactions - ${_selectedDay != null ? _formatDate(_selectedDay!) : ""}',
                                                style: const TextStyle(
                                                  fontSize: 12,
                                                  fontWeight: FontWeight.bold,
                                                ),
                                              ),
                                              const SizedBox(height: 10),
                                              Expanded(
                                                child: _isLoadingTransactions
                                                    ? const Center(
                                                        child: CircularProgressIndicator(),
                                                      )
                                                    : selectedDateTransactions.isEmpty
                                                    ? Center(
                                                        child: Text(
                                                          'No \ntransactions\n on this date',
                                                          style: TextStyle(
                                                            fontSize: 13,
                                                            color: Colors.grey[600],
                                                          ),
                                                          textAlign: TextAlign.center,
                                                        ),
                                                      )
                                                    : ListView.builder(
                                                        itemCount: selectedDateTransactions.length,
                                                        itemBuilder: (context, index) {
                                                          final transaction = selectedDateTransactions[index];
                                                          return Container(
                                                            margin: const EdgeInsets.only(bottom: 8),
                                                            padding: const EdgeInsets.all(12),
                                                            decoration: BoxDecoration(
                                                              color: Colors.grey[100],
                                                              borderRadius: BorderRadius.circular(8),
                                                              border: Border.all(
                                                                color: Colors.grey[300]!,
                                                              ),
                                                            ),
                                                            child: Column(
                                                              crossAxisAlignment: CrossAxisAlignment.start,
                                                              children: [
                                                                Text(
                                                                  transaction.name ?? 'Unknown',
                                                                  style: const TextStyle(
                                                                    fontSize: 11,
                                                                    fontWeight: FontWeight.bold,
                                                                  ),
                                                                ),
                                                                const SizedBox(height: 4),
                                                                Row(
                                                                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                                                  children: [
                                                                    Text(
                                                                      '\$${transaction.amount.abs().toStringAsFixed(2)}',
                                                                      style: TextStyle(
                                                                        fontSize: 12,
                                                                        color: Colors.purple,
                                                                        fontWeight: FontWeight.w600,
                                                                      ),
                                                                    ),
                                                                  ],
                                                                ),
                                                              ],
                                                            ),
                                                          );
                                                        },
                                                      ),
                                              ),
                                            ],
                                          ),
                                        ),
                                      ),
                                    ),
                                  ),
                                ],
                              ),
                            ),
                            const SizedBox(height: 30),
                            // Recent transactions section
                            const Text(
                              'RECENT TRANSACTIONS',
                              style: TextStyle(
                                fontSize: 16,
                                fontWeight: FontWeight.bold,
                              ),
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
                                          ),
                                        ),
                                      ),
                                      const Expanded(
                                        flex: 1,
                                        child: Text(
                                          'Amount',
                                          textAlign: TextAlign.right,
                                          style: TextStyle(
                                            fontWeight: FontWeight.bold,
                                            color: Colors.black,
                                          ),
                                        ),
                                      ),
                                    ],
                                  ),
                                  const SizedBox(height: 10),
                                  Container(
                                    height: 150,
                                    decoration: BoxDecoration(
                                      color: Colors.white,
                                      borderRadius: BorderRadius.circular(4),
                                    ),
                                    child: _isLoadingTransactions
                                        ? const Center(
                                            child: CircularProgressIndicator(),
                                          )
                                        : _transactions.isEmpty
                                        ? Center(
                                            child: Text(
                                              'No transactions yet',
                                              style: TextStyle(
                                                fontSize: 14,
                                                color: Colors.grey[600],
                                              ),
                                            ),
                                          )
                                        : ListView.separated(
                                            padding: const EdgeInsets.all(12),
                                            itemCount: _transactions.length > 5
                                                ? 5
                                                : _transactions.length,
                                            separatorBuilder:
                                                (context, index) =>
                                                    const Divider(height: 16),
                                            itemBuilder: (context, index) {
                                              final transaction =
                                                  _transactions[index];
                                              return _buildTransactionRow(
                                                transaction.date,
                                                transaction.name ?? 'Unknown',
                                                transaction.amount
                                                    .abs()
                                                    .toStringAsFixed(2),
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

  Widget _buildLegendItem(String label, Color color) {
    return Row(
      children: [
        Container(
          width: 12,
          height: 12,
          decoration: BoxDecoration(color: color, shape: BoxShape.rectangle),
        ),
        const SizedBox(width: 5),
        Text('- $label', style: const TextStyle(fontSize: 12)),
      ],
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

  Widget _buildTransactionRow(String date, String name, String amount) {
    String formattedDate = date;
    try {
      final parsedDate = DateTime.parse(date);
      formattedDate =
          '${parsedDate.month}/${parsedDate.day}/${parsedDate.year}';
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
              style: const TextStyle(fontSize: 12, color: Colors.black),
              overflow: TextOverflow.ellipsis,
            ),
          ),
          Expanded(
            flex: 2,
            child: Text(
              name,
              style: const TextStyle(fontSize: 12, color: Colors.black),
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
                fontSize: 12,
                color: Colors.black,
              ),
            ),
          ),
        ],
      ),
    );
  }
}
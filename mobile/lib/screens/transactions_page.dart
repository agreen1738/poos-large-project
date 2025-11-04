import 'package:flutter/material.dart';
import 'package:table_calendar/table_calendar.dart';
import 'dashboard_page.dart';
import 'accounts_page.dart';
import 'analytics_page.dart';
import '../services/auth_services.dart';
import '../services/user_services.dart';
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

  @override
  void initState() {
    super.initState();
    _loadUserData();
    _selectedDay = _focusedDay;
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
              child: const Text(
                'Cancel',
                style: TextStyle(color: Colors.grey),
              ),
            ),
            TextButton(
              onPressed: () => Navigator.of(context).pop(true),
              style: TextButton.styleFrom(
                foregroundColor: Colors.red,
              ),
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
                            onPressed: () {},
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
                      onTap : () {
                        Navigator.pop(context);
                        Navigator.pushReplacement(
                          context,
                          MaterialPageRoute(builder: (context) => const DashboardPage()),
                        );
                      },
                    ),
                    const SizedBox(height: 10),
                    _buildDrawerButton('Transactions', true),
                    const SizedBox(height: 10),
                    _buildDrawerButton(
                      'Accounts', 
                      false,
                      onTap : () {
                        Navigator.pop(context);
                        Navigator.pushReplacement(
                          context,
                          MaterialPageRoute(builder: (context) => const AccountsPage()),
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
                    _buildDrawerButton('Settings', false),
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
                        borderRadius: BorderRadius.circular(3),
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
              // Main content with fixed logout button
              Expanded(
                child: Stack(
                  children: [
                    Container(
                      decoration: const BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.only(
                          topLeft: Radius.circular(1),
                          topRight: Radius.circular(1),
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
                                    _selectedDay = selectedDay;
                                    _focusedDay = focusedDay;
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
                                        flex: 1,
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
                                          style: TextStyle(
                                            fontWeight: FontWeight.bold,
                                            color: Colors.black,
                                            fontSize: 14,
                                          ),
                                        ),
                                      ),
                                    ],
                                  ),
                                  const SizedBox(height: 10),
                                  Container(
                                    height: 250,
                                    decoration: BoxDecoration(
                                      color: Colors.white,
                                      borderRadius: BorderRadius.circular(4),
                                    ),
                                    child: ListView(
                                      padding: const EdgeInsets.all(12),
                                      children: [
                                        _buildTransactionRow('--', '---', '\$0.00'),
                                        const Divider(height: 20),
                                        _buildTransactionRow('--', '----', '\$0.00'),
                                        const Divider(height: 20),
                                        _buildTransactionRow('--', '--------', '\$0.00'),
                                      ],
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
                          style: TextStyle(
                            color: Colors.black,
                            fontSize: 16,
                          ),
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

  Widget _buildTransactionRow(String date, String name, String amount) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        children: [
          Expanded(
            flex: 1,
            child: Text(
              date,
              style: const TextStyle(fontSize: 12, color: Colors.black54),
            ),
          ),
          Expanded(
            flex: 2,
            child: Text(
              name,
              style: const TextStyle(fontSize: 12, color: Colors.black54),
            ),
          ),
          Expanded(
            flex: 1,
            child: Text(
              amount,
              textAlign: TextAlign.right,
              style: const TextStyle(fontSize: 12, color: Colors.black54),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildDrawerButton(String text, bool isSelected, {VoidCallback? onTap}) {
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
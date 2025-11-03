import 'package:flutter/material.dart';
import 'package:fl_chart/fl_chart.dart';
import 'package:table_calendar/table_calendar.dart';

class DashboardPage extends StatefulWidget {
  const DashboardPage({super.key});

  @override
  State<DashboardPage> createState() => _DashboardPageState();
}

class _DashboardPageState extends State<DashboardPage> {
  DateTime _focusedDay = DateTime.now();
  DateTime? _selectedDay;

  @override
  void initState() {
    super.initState();
    _selectedDay = _focusedDay;
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
                            onPressed:() {},
                          ),
                          IconButton(
                            icon: const Icon(Icons.settings_outlined),
                            onPressed:() {},
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              ),
              const SizedBox(height:10),
              Padding(
                padding: const EdgeInsets.only(left: 20, top: 10, bottom: 5),
                child: Align(
                  alignment: Alignment.centerLeft,
                  child: Text(
                    'Hello [Name]!!',
                    style: TextStyle(
                      fontSize: 14,
                      color: Colors.grey[600],
                    ),
                  ),
                ),
              ),
              Padding(
                padding: const EdgeInsets.all(20),
                child: Column(
                  children: [
                    _buildDrawerButton('Dashboard', true),
                    const SizedBox(height: 10),
                    _buildDrawerButton('Transactions', false),
                    const SizedBox(height: 10),
                    _buildDrawerButton('Accounts', false),
                    const SizedBox(height: 10),
                    _buildDrawerButton('Analytics', false),
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
                Padding(
                  padding: const EdgeInsets.all(16.0),
                  child: Row(
                    children: [
                      Builder(
                        builder: (context) => IconButton(
                          icon: const Icon(
                            Icons.menu,
                            color: Colors.white,
                            size: 30,
                          ),
                          onPressed: () {
                            Scaffold.of(context).openDrawer();
                          },
                        ),
                      ),
                      
                      const Spacer(),
                      const Column(
                        children: [
                          Text(
                            'Hello [Name]!!',
                            style: TextStyle(
                              fontSize: 24,
                              fontWeight: FontWeight.bold,
                              color: Colors.white,
                            ),
                          ),
                          Text(
                            'Dashboard',
                            style: TextStyle(fontSize: 16, color: Colors.white),
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
                // Main content
                Expanded(
                  child: Container(
                    decoration: const BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.only(
                        topLeft: Radius.circular(30),
                        topRight: Radius.circular(30),
                      ),
                    ),
                    child: SingleChildScrollView(
                      padding: const EdgeInsets.fromLTRB(20, 0, 20, 20),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const SizedBox(height: 20),
                          Row(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              // Accounts section
                              Expanded(
                                flex: 1,
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
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
                                      height: 300,
                                      decoration: BoxDecoration(
                                        color: Colors.grey[200],
                                        borderRadius: BorderRadius.circular(8),
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                              const SizedBox(width: 20),
                              // Monthly breakdown section
                              Expanded(
                                flex: 1,
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    const Text(
                                      'MONTHLY BREAKDOWN',
                                      style: TextStyle(
                                        fontSize: 16,
                                        fontWeight: FontWeight.bold,
                                      ),
                                    ),
                                    const SizedBox(height: 9),
                                    Container(
                                      //height: 250,
                                      padding: const EdgeInsets.all(16),
                                      decoration: BoxDecoration(
                                        color: Colors.grey[300],
                                        border: Border.all(
                                          color: Colors.grey[400]!,
                                        ),
                                        borderRadius: BorderRadius.circular(8),
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
                                              borderRadius: BorderRadius.circular(
                                                8,
                                              ),
                                            ),
                                            child: PieChart(
                                              PieChartData(
                                                sectionsSpace: 2,
                                                centerSpaceRadius: 0,
                                                sections: [
                                                  PieChartSectionData(
                                                    color: const Color(
                                                      0xFF5DA5DA,
                                                    ),
                                                    value: 35,
                                                    title: '',
                                                    radius: 60,
                                                  ),
                                                  PieChartSectionData(
                                                    color: const Color(
                                                      0xFFFF9F5A,
                                                    ),
                                                    value: 20,
                                                    title: '',
                                                    radius: 60,
                                                  ),
                                                  PieChartSectionData(
                                                    color: const Color(
                                                      0xFFFFC842,
                                                    ),
                                                    value: 35,
                                                    title: '',
                                                    radius: 60,
                                                  ),
                                                  PieChartSectionData(
                                                    color: const Color(
                                                      0xFFB5B5B5,
                                                    ),
                                                    value: 10,
                                                    title: '',
                                                    radius: 60,
                                                  ),
                                                ],
                                              ),
                                            ),
                                          ),
                                        ],
                                      ),
                                    ),
                                    const SizedBox(height: 16),
                                    Container(
                                      padding: const EdgeInsets.all(16),
                                      decoration: BoxDecoration(
                                        color: Colors.white,
                                        border: Border.all(
                                          color: Colors.grey[400]!,
                                        ),
                                        borderRadius: BorderRadius.circular(8),
                                      ),
                                      child: Column(
                                        children: [
                                          Row(
                                            mainAxisAlignment:
                                                MainAxisAlignment.spaceAround,
                                            children: [
                                              _buildLegendItem(
                                                'Savings',
                                                const Color(0xFFFFC842),
                                              ),
                                              _buildLegendItem(
                                                'Hobbies',
                                                const Color(0xFFFF9F5A),
                                              ),
                                            ],
                                          ),
                                          const SizedBox(height: 5),
                                          Row(
                                            mainAxisAlignment:
                                                MainAxisAlignment.spaceAround,
                                            children: [
                                              _buildLegendItem(
                                                'Living',
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
                          const SizedBox(height: 30),
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
                                // Calendar
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
                                          fontSize: 11,
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
                                    ),
                                  ),
                                ),
                                const SizedBox(width: 20),
                                // Subscriptions list
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
                                        height: 300,
                                        padding: const EdgeInsets.all(16),
                                        decoration: BoxDecoration(
                                          color: Colors.white,
                                          border: Border.all(
                                            color: Colors.grey[300]!,
                                          ),
                                          borderRadius: BorderRadius.circular(8),
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
                            ),
                            child: Column(
                              children: [
                                Row(
                                  children: [
                                    Expanded(
                                      flex: 1,
                                      child: Text(
                                        'Date',
                                        style: TextStyle(
                                          fontWeight: FontWeight.bold,
                                          color: Colors.grey[700],
                                        ),
                                      ),
                                    ),
                                    Expanded(
                                      flex: 2,
                                      child: Text(
                                        'Name',
                                        style: TextStyle(
                                          fontWeight: FontWeight.bold,
                                          color: Colors.grey[700],
                                        ),
                                      ),
                                    ),
                                    Expanded(
                                      flex: 1,
                                      child: Text(
                                        'Amount',
                                        textAlign: TextAlign.right,
                                        style: TextStyle(
                                          fontWeight: FontWeight.bold,
                                          color: Colors.grey[700],
                                        ),
                                      ),
                                    ),
                                  ],
                                ),
                                const SizedBox(height: 10),
                                Container(
                                  height: 150,
                                  decoration: BoxDecoration(
                                    color: Colors.grey[50],
                                    borderRadius: BorderRadius.circular(4),
                                  ),
                                ),
                              ],
                            ),
                          ),
                          const SizedBox(height: 20),
                          // Logout button
                          Align(
                            alignment: Alignment.centerRight,
                            child: TextButton(
                              onPressed: () {},
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

  Widget _buildDrawerButton(String text, bool isSelected){
    return Container(
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
    );
  }
}
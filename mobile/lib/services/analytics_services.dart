// services/analytics_service.dart
import 'package:dio/dio.dart';
import './api_services.dart';

class CategoryData {
  final String name;
  final double value;
  final double percentage;

  CategoryData({
    required this.name,
    required this.value,
    required this.percentage,
  });

  factory CategoryData.fromJson(Map<String, dynamic> json) {
    return CategoryData(
      name: json['name'] as String,
      value: (json['value'] as num).toDouble(),
      percentage: (json['percentage'] as num).toDouble(),
    );
  }
}

class AnalyticsResponse {
  final List<CategoryData> categories;
  final double totalSpending;

  AnalyticsResponse({
    required this.categories,
    required this.totalSpending,
  });

  factory AnalyticsResponse.fromJson(Map<String, dynamic> json) {
    return AnalyticsResponse(
      categories: (json['categories'] as List)
          .map((item) => CategoryData.fromJson(item))
          .toList(),
      totalSpending: (json['totalSpending'] as num).toDouble(),
    );
  }
}

class AnalyticsService {
  final ApiService _apiService = ApiService();

  // Get category analytics for all accounts or specific account
  Future<AnalyticsResponse> getCategoryAnalytics({String accountId = 'all'}) async {
    try {
      final response = await _apiService.post(
        '/analytics/categories',
        data: {'accountId': accountId},
      );
      return AnalyticsResponse.fromJson(response.data);
    } on DioException catch (e) {
      final errorMessage = e.response?.data['error'] ?? 
                          e.response?.data['message'] ?? 
                          'Failed to fetch analytics';
      throw Exception(errorMessage);
    } catch (e) {
      throw Exception('Failed to fetch analytics');
    }
  }
}

final analyticsService = AnalyticsService();
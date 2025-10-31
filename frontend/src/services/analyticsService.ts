// src/services/analyticsService.ts - Analytics service
import api from './api';

export interface CategoryData {
  name: string;
  value: number;
  percentage: number;
  [key: string]: string | number; // Index signature for Recharts compatibility
}

export interface AnalyticsResponse {
  categories: CategoryData[];
  totalSpending: number;
}

class AnalyticsService {
  // Get category analytics for all accounts or specific account
  async getCategoryAnalytics(accountId: string = 'all'): Promise<AnalyticsResponse> {
    try {
      const response = await api.post('/analytics/categories', { accountId });
      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || error.response?.data?.message || 'Failed to fetch analytics';
      throw new Error(errorMessage);
    }
  }
}

export default new AnalyticsService();
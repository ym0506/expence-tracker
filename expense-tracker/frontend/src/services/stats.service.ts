import api from './api';

interface MonthlyStats {
  month: string;
  totalAmount: string;
  categoryBreakdown: Array<{
    category: {
      id: string;
      name: string;
      color: string;
      icon: string;
    };
    totalAmount: string;
    transactionCount: number;
  }>;
}

interface CategoryStats {
  totalAmount: string;
  categories: Array<{
    category: {
      id: string;
      name: string;
      color: string;
      icon: string;
    };
    totalAmount: string;
    transactionCount: number;
    percentage: number;
  }>;
}

export const statsService = {
  async getMonthlyStats(year: number, month: number): Promise<MonthlyStats> {
    const response = await api.get<MonthlyStats>('/stats/monthly', {
      params: { year, month }
    });
    return response.data;
  },

  async getCategoryStats(startDate?: string, endDate?: string): Promise<CategoryStats> {
    const response = await api.get<CategoryStats>('/stats/category', {
      params: { startDate, endDate }
    });
    return response.data;
  },
};
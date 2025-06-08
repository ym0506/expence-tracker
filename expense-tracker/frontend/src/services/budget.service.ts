import api from './api';

export interface Budget {
  id: string;
  userId: string;
  categoryId?: string;
  amount: string;
  month: string;
  createdAt: string;
  updatedAt: string;
  category?: {
    id: string;
    name: string;
    color: string;
    icon: string;
  };
}

export interface BudgetComparison {
  month: string;
  totalBudget: string;
  totalActual: string;
  totalRemaining: string;
  totalUsagePercentage: number;
  categories: Array<{
    id: string;
    categoryId?: string;
    category?: {
      id: string;
      name: string;
      color: string;
      icon: string;
    };
    budgetAmount: string;
    actualAmount: string;
    remainingAmount: string;
    usagePercentage: number;
    isOverBudget: boolean;
  }>;
}

export const budgetService = {
  async getBudgets(month?: string): Promise<Budget[]> {
    const response = await api.get<Budget[]>('/budgets', {
      params: month ? { month } : {}
    });
    return response.data;
  },

  async createBudget(data: {
    categoryId?: string;
    amount: number;
    month: string;
  }): Promise<Budget> {
    const response = await api.post<Budget>('/budgets', data);
    return response.data;
  },

  async updateBudget(id: string, data: {
    categoryId?: string;
    amount?: number;
    month?: string;
  }): Promise<Budget> {
    const response = await api.put<Budget>(`/budgets/${id}`, data);
    return response.data;
  },

  async deleteBudget(id: string): Promise<void> {
    await api.delete(`/budgets/${id}`);
  },

  async getBudgetComparison(month: string): Promise<BudgetComparison> {
    const response = await api.get<BudgetComparison>('/budgets/comparison', {
      params: { month }
    });
    return response.data;
  },
};
import api from './api';
import { Expense, ExpenseFormData } from '../types';

interface ExpenseResponse {
  expenses: Expense[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export const expenseService = {
  async getExpenses(params?: {
    page?: number;
    limit?: number;
    categoryId?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<ExpenseResponse> {
    const response = await api.get<ExpenseResponse>('/expenses', { params });
    return response.data;
  },

  async createExpense(data: ExpenseFormData): Promise<Expense> {
    const response = await api.post<Expense>('/expenses', data);
    return response.data;
  },

  async updateExpense(id: string, data: Partial<ExpenseFormData>): Promise<Expense> {
    const response = await api.put<Expense>(`/expenses/${id}`, data);
    return response.data;
  },

  async deleteExpense(id: string): Promise<void> {
    await api.delete(`/expenses/${id}`);
  },
};
export interface User {
  id: string;
  email: string;
  name: string;
  createdAt?: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
}

export interface Category {
  id: string;
  name: string;
  color: string;
  icon: string;
}

export interface Expense {
  id: string;
  userId: string;
  categoryId: string;
  category?: Category;
  amount: string;
  description?: string;
  date: string;
  receiptImageUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ExpenseFormData {
  categoryId: string;
  amount: number;
  description?: string;
  date: string;
  receiptImageUrl?: string;
}
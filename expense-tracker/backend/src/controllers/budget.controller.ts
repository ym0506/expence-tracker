import { Request, Response } from 'express';
import prisma from '../config/prisma';
// Decimal 타입 제거 (SQLite에서는 Float 사용)

export const getBudgets = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const { month } = req.query;
    
    if (!month) {
      return res.status(400).json({ message: 'Month parameter is required (YYYY-MM format)' });
    }

    const startDate = new Date(`${month}-01`);
    const endDate = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0);

    const budgets = await prisma.budget.findMany({
      where: {
        userId: req.user.id,
        month: {
          gte: startDate,
          lte: endDate
        }
      },
      include: {
        category: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.json(budgets);
  } catch (error) {
    console.error('Get budgets error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const createBudget = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const { categoryId, amount, month } = req.body;

    if (!amount || !month) {
      return res.status(400).json({ message: 'Amount and month are required' });
    }

    if (amount <= 0) {
      return res.status(400).json({ message: 'Amount must be greater than 0' });
    }

    const monthDate = new Date(`${month}-01`);

    // Check if budget already exists for this category and month
    const existingBudget = await prisma.budget.findFirst({
      where: {
        userId: req.user.id,
        categoryId: categoryId || null,
        month: monthDate
      }
    });

    if (existingBudget) {
      return res.status(400).json({ message: 'Budget already exists for this category and month' });
    }

    const budget = await prisma.budget.create({
      data: {
        userId: req.user.id,
        categoryId: categoryId || null,
        amount: parseFloat(amount),
        month: monthDate
      },
      include: {
        category: true
      }
    });

    res.status(201).json(budget);
  } catch (error) {
    console.error('Create budget error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const updateBudget = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const { id } = req.params;
    const { amount } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ message: 'Valid amount is required' });
    }

    // Check if budget exists and belongs to user
    const existingBudget = await prisma.budget.findFirst({
      where: {
        id,
        userId: req.user.id
      }
    });

    if (!existingBudget) {
      return res.status(404).json({ message: 'Budget not found' });
    }

    const budget = await prisma.budget.update({
      where: { id },
      data: {
        amount: parseFloat(amount)
      },
      include: {
        category: true
      }
    });

    res.json(budget);
  } catch (error) {
    console.error('Update budget error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const deleteBudget = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const { id } = req.params;

    // Check if budget exists and belongs to user
    const existingBudget = await prisma.budget.findFirst({
      where: {
        id,
        userId: req.user.id
      }
    });

    if (!existingBudget) {
      return res.status(404).json({ message: 'Budget not found' });
    }

    await prisma.budget.delete({
      where: { id }
    });

    res.json({ message: 'Budget deleted successfully' });
  } catch (error) {
    console.error('Delete budget error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getBudgetComparison = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const { month } = req.query;
    
    if (!month) {
      return res.status(400).json({ message: 'Month parameter is required (YYYY-MM format)' });
    }

    const startDate = new Date(`${month}-01`);
    const endDate = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0);

    // Get budgets for the month
    const budgets = await prisma.budget.findMany({
      where: {
        userId: req.user.id,
        month: {
          gte: startDate,
          lte: endDate
        }
      },
      include: {
        category: true
      }
    });

    // Get actual expenses for the month
    const expenses = await prisma.expense.findMany({
      where: {
        userId: req.user.id,
        date: {
          gte: startDate,
          lte: endDate
        }
      },
      include: {
        category: true
      }
    });

    // Calculate totals and comparisons
    const totalBudget = budgets.reduce((sum, budget) => sum + Number(budget.amount), 0);
    const totalActual = expenses.reduce((sum, expense) => sum + Number(expense.amount), 0);
    const totalRemaining = totalBudget - totalActual;
    const totalUsagePercentage = totalBudget > 0 ? Math.round((totalActual / totalBudget) * 100) : 0;

    // Calculate category-wise comparisons
    const categoryComparisons = budgets.map(budget => {
      const categoryExpenses = expenses.filter(expense => expense.categoryId === budget.categoryId);
      const actualAmount = categoryExpenses.reduce((sum, expense) => sum + Number(expense.amount), 0);
      const budgetAmount = Number(budget.amount);
      const remainingAmount = budgetAmount - actualAmount;
      const usagePercentage = budgetAmount > 0 ? Math.round((actualAmount / budgetAmount) * 100) : 0;
      const isOverBudget = actualAmount > budgetAmount;

      return {
        categoryId: budget.categoryId,
        categoryName: budget.category?.name || 'Overall',
        budgetAmount,
        actualAmount,
        remainingAmount,
        usagePercentage,
        isOverBudget
      };
    });

    res.json({
      totalBudget,
      totalActual,
      totalRemaining,
      totalUsagePercentage,
      categories: categoryComparisons
    });
  } catch (error) {
    console.error('Get budget comparison error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
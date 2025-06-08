import { Request, Response } from 'express';
import prisma from '../config/prisma';

export const getMonthlyStats = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    
    const { year, month } = req.query;
    
    if (!year || !month) {
      return res.status(400).json({ message: 'Year and month are required' });
    }
    
    const startDate = new Date(parseInt(year as string), parseInt(month as string) - 1, 1);
    const endDate = new Date(parseInt(year as string), parseInt(month as string), 0, 23, 59, 59);
    
    // Get monthly expenses grouped by category
    const expenses = await prisma.expense.groupBy({
      by: ['categoryId'],
      where: {
        userId: req.user.id,
        date: {
          gte: startDate,
          lte: endDate
        }
      },
      _sum: {
        amount: true
      },
      _count: {
        id: true
      }
    });
    
    // Get category details
    const categoryIds = expenses.map(e => e.categoryId);
    const categories = await prisma.category.findMany({
      where: {
        id: {
          in: categoryIds
        }
      }
    });
    
    // Combine data
    const categoryMap = new Map(categories.map(c => [c.id, c]));
    const stats = expenses.map(expense => ({
      category: categoryMap.get(expense.categoryId),
      totalAmount: expense._sum.amount?.toString() || '0',
      transactionCount: expense._count.id
    }));
    
    // Calculate total
    const totalAmount = expenses.reduce((sum, e) => 
      sum + (parseFloat(e._sum.amount?.toString() || '0')), 0
    );
    
    res.json({
      month: `${year}-${month}`,
      totalAmount: totalAmount.toFixed(2),
      categoryBreakdown: stats,
      startDate,
      endDate
    });
  } catch (error) {
    console.error('Get monthly stats error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getCategoryStats = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    
    const { startDate, endDate } = req.query;
    
    const where: any = {
      userId: req.user.id
    };
    
    if (startDate || endDate) {
      where.date = {};
      if (startDate) {
        where.date.gte = new Date(startDate as string);
      }
      if (endDate) {
        where.date.lte = new Date(endDate as string);
      }
    }
    
    // Get expenses grouped by category
    const expenses = await prisma.expense.groupBy({
      by: ['categoryId'],
      where,
      _sum: {
        amount: true
      },
      _count: {
        id: true
      }
    });
    
    // Get category details
    const categoryIds = expenses.map(e => e.categoryId);
    const categories = await prisma.category.findMany({
      where: {
        id: {
          in: categoryIds
        }
      }
    });
    
    // Combine data
    const categoryMap = new Map(categories.map(c => [c.id, c]));
    const stats = expenses.map(expense => ({
      category: categoryMap.get(expense.categoryId),
      totalAmount: expense._sum.amount?.toString() || '0',
      transactionCount: expense._count.id,
      percentage: 0 // Will calculate after getting total
    }));
    
    // Calculate total and percentages
    const totalAmount = expenses.reduce((sum, e) => 
      sum + (parseFloat(e._sum.amount?.toString() || '0')), 0
    );
    
    stats.forEach(stat => {
      stat.percentage = totalAmount > 0 
        ? (parseFloat(stat.totalAmount) / totalAmount * 100) 
        : 0;
    });
    
    // Sort by amount descending
    stats.sort((a, b) => parseFloat(b.totalAmount) - parseFloat(a.totalAmount));
    
    res.json({
      totalAmount: totalAmount.toFixed(2),
      categories: stats
    });
  } catch (error) {
    console.error('Get category stats error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getExpenseInsights = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const currentDate = new Date();
    const currentMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const lastMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
    const lastMonthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth(), 0, 23, 59, 59);

    // Current month expenses
    const currentMonthExpenses = await prisma.expense.aggregate({
      where: {
        userId: req.user.id,
        date: {
          gte: currentMonth
        }
      },
      _sum: {
        amount: true
      },
      _count: {
        id: true
      }
    });

    // Last month expenses
    const lastMonthExpenses = await prisma.expense.aggregate({
      where: {
        userId: req.user.id,
        date: {
          gte: lastMonth,
          lte: lastMonthEnd
        }
      },
      _sum: {
        amount: true
      },
      _count: {
        id: true
      }
    });

    // Calculate trends
    const currentTotal = Number(currentMonthExpenses._sum.amount || 0);
    const lastTotal = Number(lastMonthExpenses._sum.amount || 0);
    const changeAmount = currentTotal - lastTotal;
    const changePercentage = lastTotal > 0 ? (changeAmount / lastTotal) * 100 : 0;

    // Get top spending category this month
    const topCategory = await prisma.expense.groupBy({
      by: ['categoryId'],
      where: {
        userId: req.user.id,
        date: {
          gte: currentMonth
        }
      },
      _sum: {
        amount: true
      },
      orderBy: {
        _sum: {
          amount: 'desc'
        }
      },
      take: 1
    });

    let topCategoryInfo = null;
    if (topCategory.length > 0) {
      const categoryDetail = await prisma.category.findUnique({
        where: { id: topCategory[0].categoryId }
      });
      topCategoryInfo = {
        category: categoryDetail,
        amount: Number(topCategory[0]._sum.amount || 0)
      };
    }

    // Recent spending pattern (last 7 days)
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    
    const recentExpenses = await prisma.expense.findMany({
      where: {
        userId: req.user.id,
        date: {
          gte: weekAgo
        }
      },
      orderBy: {
        date: 'asc'
      },
      include: {
        category: true
      }
    });

    // Group by date for trend
    const dailySpending = new Map();
    recentExpenses.forEach(expense => {
      const dateKey = expense.date.toISOString().split('T')[0];
      const current = dailySpending.get(dateKey) || 0;
      dailySpending.set(dateKey, current + Number(expense.amount));
    });

    const weeklyTrend = Array.from(dailySpending.entries()).map(([date, amount]) => ({
      date,
      amount
    }));

    res.json({
      currentMonth: {
        total: currentTotal,
        transactionCount: currentMonthExpenses._count.id
      },
      lastMonth: {
        total: lastTotal,
        transactionCount: lastMonthExpenses._count.id
      },
      monthlyChange: {
        amount: changeAmount,
        percentage: changePercentage,
        trend: changeAmount > 0 ? 'increase' : changeAmount < 0 ? 'decrease' : 'stable'
      },
      topSpendingCategory: topCategoryInfo,
      weeklyTrend
    });
  } catch (error) {
    console.error('Get expense insights error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getBudgetVsActual = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const { month } = req.query;
    const targetMonth = month ? new Date(`${month}-01`) : new Date();
    const startDate = new Date(targetMonth.getFullYear(), targetMonth.getMonth(), 1);
    const endDate = new Date(targetMonth.getFullYear(), targetMonth.getMonth() + 1, 0, 23, 59, 59);

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
    const expenses = await prisma.expense.groupBy({
      by: ['categoryId'],
      where: {
        userId: req.user.id,
        date: {
          gte: startDate,
          lte: endDate
        }
      },
      _sum: {
        amount: true
      }
    });

    // Create expense map
    const expenseMap = new Map();
    expenses.forEach(expense => {
      expenseMap.set(expense.categoryId, Number(expense._sum.amount || 0));
    });

    // Calculate budget vs actual for each category
    const comparisons = budgets.map(budget => {
      const actualAmount = expenseMap.get(budget.categoryId) || 0;
      const budgetAmount = Number(budget.amount);
      const variance = actualAmount - budgetAmount;
      const percentageUsed = budgetAmount > 0 ? (actualAmount / budgetAmount) * 100 : 0;

      return {
        category: budget.category,
        budgetAmount,
        actualAmount,
        variance,
        percentageUsed,
        status: actualAmount > budgetAmount ? 'over' : actualAmount > budgetAmount * 0.8 ? 'warning' : 'good'
      };
    });

    // Overall summary
    const totalBudget = budgets.reduce((sum, budget) => sum + Number(budget.amount), 0);
    const totalActual = Array.from(expenseMap.values()).reduce((sum, amount) => sum + amount, 0);
    const overallVariance = totalActual - totalBudget;
    const overallPercentage = totalBudget > 0 ? (totalActual / totalBudget) * 100 : 0;

    res.json({
      month: `${targetMonth.getFullYear()}-${String(targetMonth.getMonth() + 1).padStart(2, '0')}`,
      overall: {
        totalBudget,
        totalActual,
        variance: overallVariance,
        percentageUsed: overallPercentage
      },
      categories: comparisons
    });
  } catch (error) {
    console.error('Get budget vs actual error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
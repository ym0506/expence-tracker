import { Request, Response } from 'express';
import prisma from '../config/prisma';
// Decimal 타입 제거 (SQLite에서는 Float 사용)

export const getExpenses = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    
    const { 
      page = '1', 
      limit = '20', 
      categoryId, 
      startDate, 
      endDate, 
      search,
      minAmount,
      maxAmount,
      sortBy = 'date',
      sortOrder = 'desc'
    } = req.query;
    
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;
    
    const where: any = {
      userId: req.user.id
    };
    
    // 카테고리 필터
    if (categoryId) {
      where.categoryId = categoryId;
    }
    
    // 날짜 범위 필터
    if (startDate || endDate) {
      where.date = {};
      if (startDate) {
        where.date.gte = new Date(startDate as string);
      }
      if (endDate) {
        // endDate의 하루 끝까지 포함
        const endDateObj = new Date(endDate as string);
        endDateObj.setHours(23, 59, 59, 999);
        where.date.lte = endDateObj;
      }
    }
    
    // 금액 범위 필터
    if (minAmount || maxAmount) {
      where.amount = {};
      if (minAmount) {
        where.amount.gte = parseFloat(minAmount as string);
      }
      if (maxAmount) {
        where.amount.lte = parseFloat(maxAmount as string);
      }
    }
    
    // 텍스트 검색 (설명 또는 카테고리명)
    if (search) {
      where.OR = [
        {
          description: {
            contains: search as string,
            mode: 'insensitive'
          }
        },
        {
          category: {
            name: {
              contains: search as string,
              mode: 'insensitive'
            }
          }
        }
      ];
    }
    
    // 정렬 설정
    const orderBy: any = {};
    const validSortFields = ['date', 'amount', 'category'];
    const sortField = validSortFields.includes(sortBy as string) ? sortBy as string : 'date';
    const order = sortOrder === 'asc' ? 'asc' : 'desc';
    
    if (sortField === 'category') {
      orderBy.category = { name: order };
    } else {
      orderBy[sortField] = order;
    }
    
    const [expenses, total] = await Promise.all([
      prisma.expense.findMany({
        where,
        include: {
          category: true
        },
        orderBy,
        skip,
        take: limitNum
      }),
      prisma.expense.count({ where })
    ]);
    
    // 검색 결과 요약 정보 추가
    const summary = await prisma.expense.aggregate({
      where,
      _sum: {
        amount: true
      },
      _avg: {
        amount: true
      },
      _min: {
        date: true
      },
      _max: {
        date: true
      }
    });
    
    res.json({
      expenses,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum)
      },
      summary: {
        totalAmount: summary._sum.amount || 0,
        averageAmount: summary._avg.amount || 0,
        dateRange: {
          from: summary._min.date,
          to: summary._max.date
        },
        hasFilters: !!(categoryId || startDate || endDate || search || minAmount || maxAmount)
      }
    });
  } catch (error) {
    console.error('Get expenses error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const createExpense = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    
    const { categoryId, amount, description, date, receiptImageUrl } = req.body;
    
    if (!categoryId || !amount || !date) {
      return res.status(400).json({ message: 'Category, amount, and date are required' });
    }
    
    const expense = await prisma.expense.create({
      data: {
        userId: req.user.id,
        categoryId,
        amount: parseFloat(amount),
        description,
        date: new Date(date),
        receiptImageUrl
      },
      include: {
        category: true
      }
    });
    
    res.status(201).json(expense);
  } catch (error) {
    console.error('Create expense error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const updateExpense = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    
    const { id } = req.params;
    const { categoryId, amount, description, date, receiptImageUrl } = req.body;
    
    // Check if expense exists and belongs to user
    const existingExpense = await prisma.expense.findFirst({
      where: {
        id,
        userId: req.user.id
      }
    });
    
    if (!existingExpense) {
      return res.status(404).json({ message: 'Expense not found' });
    }
    
    const updateData: any = {};
    if (categoryId !== undefined) updateData.categoryId = categoryId;
    if (amount !== undefined) updateData.amount = parseFloat(amount);
    if (description !== undefined) updateData.description = description;
    if (date !== undefined) updateData.date = new Date(date);
    if (receiptImageUrl !== undefined) updateData.receiptImageUrl = receiptImageUrl;
    
    const expense = await prisma.expense.update({
      where: { id },
      data: updateData,
      include: {
        category: true
      }
    });
    
    res.json(expense);
  } catch (error) {
    console.error('Update expense error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const deleteExpense = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    
    const { id } = req.params;
    
    // Check if expense exists and belongs to user
    const existingExpense = await prisma.expense.findFirst({
      where: {
        id,
        userId: req.user.id
      }
    });
    
    if (!existingExpense) {
      return res.status(404).json({ message: 'Expense not found' });
    }
    
    await prisma.expense.delete({
      where: { id }
    });
    
    res.json({ message: 'Expense deleted successfully' });
  } catch (error) {
    console.error('Delete expense error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
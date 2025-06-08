import { Request, Response } from 'express';
import prisma from '../config/prisma';

export const getCategories = async (req: Request, res: Response) => {
  try {
    const categories = await prisma.category.findMany({
      orderBy: {
        name: 'asc'
      }
    });
    
    res.json(categories);
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const createCategory = async (req: Request, res: Response) => {
  try {
    const { name, color, icon } = req.body;
    
    if (!name || !color || !icon) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    
    const category = await prisma.category.create({
      data: {
        name,
        color,
        icon
      }
    });
    
    res.status(201).json(category);
  } catch (error) {
    console.error('Create category error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const updateCategory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, color, icon } = req.body;
    
    if (!name || !color || !icon) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    
    // Check if category exists
    const existingCategory = await prisma.category.findUnique({
      where: { id }
    });
    
    if (!existingCategory) {
      return res.status(404).json({ message: 'Category not found' });
    }
    
    const category = await prisma.category.update({
      where: { id },
      data: {
        name,
        color,
        icon
      }
    });
    
    res.json(category);
  } catch (error) {
    console.error('Update category error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const deleteCategory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Check if category exists
    const existingCategory = await prisma.category.findUnique({
      where: { id }
    });
    
    if (!existingCategory) {
      return res.status(404).json({ message: 'Category not found' });
    }
    
    // Check if category is being used by any expenses or budgets
    const [expenseCount, budgetCount] = await Promise.all([
      prisma.expense.count({ where: { categoryId: id } }),
      prisma.budget.count({ where: { categoryId: id } })
    ]);
    
    if (expenseCount > 0 || budgetCount > 0) {
      return res.status(400).json({ 
        message: 'Cannot delete category that is being used by expenses or budgets',
        details: {
          expenseCount,
          budgetCount
        }
      });
    }
    
    await prisma.category.delete({
      where: { id }
    });
    
    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    console.error('Delete category error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
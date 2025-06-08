import { Router } from 'express';
import { authenticateToken } from '../middleware/auth';
import {
  getBudgets,
  createBudget,
  updateBudget,
  deleteBudget,
  getBudgetComparison
} from '../controllers/budget.controller';

const router = Router();

// All budget routes require authentication
router.use(authenticateToken);

// GET /api/budgets - Get budgets for a specific month
router.get('/', getBudgets);

// POST /api/budgets - Create a new budget
router.post('/', createBudget);

// PUT /api/budgets/:id - Update a budget
router.put('/:id', updateBudget);

// DELETE /api/budgets/:id - Delete a budget
router.delete('/:id', deleteBudget);

// GET /api/budgets/comparison - Get budget vs actual comparison
router.get('/comparison', getBudgetComparison);

export default router;
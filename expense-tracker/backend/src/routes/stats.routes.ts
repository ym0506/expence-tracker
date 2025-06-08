import { Router } from 'express';
import { 
  getMonthlyStats, 
  getCategoryStats, 
  getExpenseInsights, 
  getBudgetVsActual 
} from '../controllers/stats.controller';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.get('/monthly', authenticateToken, getMonthlyStats);
router.get('/category', authenticateToken, getCategoryStats);
router.get('/insights', authenticateToken, getExpenseInsights);
router.get('/budget-vs-actual', authenticateToken, getBudgetVsActual);

export default router;
import { budgetService, BudgetComparison } from './budget.service';

export interface BudgetAlert {
  id: string;
  categoryId: string;
  categoryName: string;
  categoryIcon: string;
  budgetAmount: number;
  actualAmount: number;
  overAmount: number;
  severity: 'warning' | 'danger';
  message: string;
}

export const budgetAlertService = {
  async getBudgetAlerts(month: string): Promise<BudgetAlert[]> {
    try {
      const comparison: BudgetComparison = await budgetService.getBudgetComparison(month);
      const alerts: BudgetAlert[] = [];

      comparison.categories.forEach(category => {
        const budgetAmount = parseFloat(category.budgetAmount);
        const actualAmount = parseFloat(category.actualAmount);
        
        if (category.isOverBudget) {
          const overAmount = actualAmount - budgetAmount;
          const overPercentage = (overAmount / budgetAmount) * 100;
          
          alerts.push({
            id: `alert-${category.categoryId}-${month}`,
            categoryId: category.categoryId || '',
            categoryName: category.category?.name || '카테고리 없음',
            categoryIcon: category.category?.icon || '📌',
            budgetAmount,
            actualAmount,
            overAmount,
            severity: overPercentage > 50 ? 'danger' : 'warning',
            message: `${category.category?.name || '카테고리'} 예산을 ₩${overAmount.toLocaleString()} 초과했습니다.`
          });
        } else if (category.usagePercentage >= 80) {
          alerts.push({
            id: `warning-${category.categoryId}-${month}`,
            categoryId: category.categoryId || '',
            categoryName: category.category?.name || '카테고리 없음',
            categoryIcon: category.category?.icon || '📌',
            budgetAmount,
            actualAmount,
            overAmount: 0,
            severity: 'warning',
            message: `${category.category?.name || '카테고리'} 예산의 ${category.usagePercentage}%를 사용했습니다.`
          });
        }
      });

      return alerts.sort((a, b) => {
        if (a.severity === 'danger' && b.severity === 'warning') return -1;
        if (a.severity === 'warning' && b.severity === 'danger') return 1;
        return b.actualAmount - a.actualAmount;
      });
    } catch (error) {
      console.error('Error fetching budget alerts:', error);
      return [];
    }
  },

  async getTotalBudgetAlert(month: string): Promise<BudgetAlert | null> {
    try {
      const comparison: BudgetComparison = await budgetService.getBudgetComparison(month);
      const totalBudget = parseFloat(comparison.totalBudget);
      const totalActual = parseFloat(comparison.totalActual);

      if (totalActual > totalBudget) {
        const overAmount = totalActual - totalBudget;
        return {
          id: `total-alert-${month}`,
          categoryId: 'total',
          categoryName: '전체 예산',
          categoryIcon: '⚠️',
          budgetAmount: totalBudget,
          actualAmount: totalActual,
          overAmount,
          severity: 'danger',
          message: `이번 달 전체 예산을 ₩${overAmount.toLocaleString()} 초과했습니다.`
        };
      } else if (comparison.totalUsagePercentage >= 80) {
        return {
          id: `total-warning-${month}`,
          categoryId: 'total',
          categoryName: '전체 예산',
          categoryIcon: '⚠️',
          budgetAmount: totalBudget,
          actualAmount: totalActual,
          overAmount: 0,
          severity: 'warning',
          message: `이번 달 전체 예산의 ${comparison.totalUsagePercentage}%를 사용했습니다.`
        };
      }

      return null;
    } catch (error) {
      console.error('Error fetching total budget alert:', error);
      return null;
    }
  }
};
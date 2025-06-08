import React, { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import Layout from '../components/Layout';
import { expenseService } from '../services/expense.service';
import { statsService } from '../services/stats.service';
import { categoryService } from '../services/category.service';
import { Expense, Category } from '../types';
import ExpenseModal from '../components/ExpenseModal';
import CategoryChart from '../components/CategoryChart';
import LoadingSpinner from '../components/LoadingSpinner';
import Toast from '../components/Toast';
import BudgetAlert from '../components/BudgetAlert';
import InsightsDashboard from '../components/InsightsDashboard';
import { useToast } from '../hooks/useToast';
import { budgetAlertService, BudgetAlert as BudgetAlertType } from '../services/budgetAlert.service';

const Dashboard: React.FC = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [monthlyStats, setMonthlyStats] = useState<any>(null);
  const [budgetAlerts, setBudgetAlerts] = useState<BudgetAlertType[]>([]);
  const [dismissedAlerts, setDismissedAlerts] = useState<Set<string>>(new Set());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const { toasts, hideToast, showSuccess, showError } = useToast();

  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1;

  useEffect(() => {
    fetchData();
    
    // 30초마다 자동 새로고침
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const currentMonthStr = format(currentDate, 'yyyy-MM');
      const [expensesData, categoriesData, statsData, alertsData] = await Promise.all([
        expenseService.getExpenses({ limit: 10 }),
        categoryService.getCategories(),
        statsService.getMonthlyStats(currentYear, currentMonth),
        budgetAlertService.getBudgetAlerts(currentMonthStr),
      ]);
      
      setExpenses(expensesData.expenses);
      setCategories(categoriesData);
      setMonthlyStats(statsData);
      setBudgetAlerts(alertsData.filter(alert => !dismissedAlerts.has(alert.id)));
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExpenseAdded = () => {
    setIsModalOpen(false);
    fetchData();
    showSuccess('지출이 성공적으로 추가되었습니다!');
  };

  const handleAlertDismiss = (alertId: string) => {
    setDismissedAlerts(prev => new Set(Array.from(prev).concat(alertId)));
    setBudgetAlerts(prev => prev.filter(alert => alert.id !== alertId));
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <LoadingSpinner size="lg" text="데이터를 불러오는 중..." />
        </div>
      </Layout>
    );
  }

  return (
    <Layout onAddExpense={() => setIsModalOpen(true)}>
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">대시보드</h1>
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 px-6 py-3 rounded-xl font-semibold hover:bg-gray-800 dark:hover:bg-gray-200 transition-all duration-200 flex items-center space-x-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <span>지출 추가</span>
            </button>
          </div>

          {/* 예산 알림 */}
          {budgetAlerts.length > 0 && (
            <div className="mb-8">
              <h2 className="text-lg font-medium text-gray-900 mb-4">예산 알림</h2>
              <BudgetAlert alerts={budgetAlerts} onClose={handleAlertDismiss} />
            </div>
          )}

          {/* 월별 요약 */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 mb-8">
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 hover:shadow-md transition-shadow duration-200">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                    <svg className="h-6 w-6 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <div className="ml-4 flex-1">
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">이번 달 총 지출</dt>
                  <dd className="text-2xl font-bold text-gray-900 dark:text-white">
                    ₩{monthlyStats?.totalAmount ? Number(monthlyStats.totalAmount).toLocaleString() : '0'}
                  </dd>
                </div>
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 hover:shadow-md transition-shadow duration-200">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                    <svg className="h-6 w-6 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                </div>
                <div className="ml-4 flex-1">
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">거래 건수</dt>
                  <dd className="text-2xl font-bold text-gray-900 dark:text-white">
                    {monthlyStats?.categoryBreakdown?.reduce((sum: number, cat: any) => sum + cat.transactionCount, 0) || 0}건
                  </dd>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 hover:shadow-md transition-shadow duration-200">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                    <svg className="h-6 w-6 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  </div>
                </div>
                <div className="ml-4 flex-1">
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">일 평균 지출</dt>
                  <dd className="text-2xl font-bold text-gray-900 dark:text-white">
                    ₩{monthlyStats?.totalAmount ? 
                      Math.round(Number(monthlyStats.totalAmount) / currentDate.getDate()).toLocaleString() : '0'}
                  </dd>
                </div>
              </div>
            </div>
          </div>

          {/* 인사이트 대시보드 */}
          <div className="mb-8">
            <InsightsDashboard />
          </div>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
            {/* 카테고리별 차트 */}
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
                카테고리별 지출
              </h2>
              {monthlyStats?.categoryBreakdown && monthlyStats.categoryBreakdown.length > 0 ? (
                <CategoryChart data={monthlyStats.categoryBreakdown} />
              ) : (
                <div className="text-center text-gray-500 dark:text-gray-400 py-12">
                  <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                    <div className="text-3xl">📊</div>
                  </div>
                  <p className="text-lg font-semibold mb-2 text-gray-700 dark:text-gray-300">이번 달 지출 내역이 없습니다</p>
                  <p className="text-sm">첫 지출을 추가해서 통계를 확인해보세요!</p>
                </div>
              )}
            </div>

            {/* 최근 지출 내역 */}
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
                최근 지출 내역
              </h2>
              <div className="flow-root">
                <ul className="space-y-3">
                  {expenses.length > 0 ? (
                    expenses.slice(0, 5).map((expense, index) => (
                      <li key={expense.id} className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200 animate-slide-up" style={{ animationDelay: `${index * 0.1}s` }}>
                        <div className="flex items-center space-x-4">
                          <div className="flex-shrink-0">
                            <div className="w-12 h-12 bg-white dark:bg-gray-600 rounded-xl flex items-center justify-center shadow-sm">
                              <span className="text-2xl">{expense.category?.icon}</span>
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                              {expense.category?.name}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                              {expense.description || '설명 없음'}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-bold text-gray-900 dark:text-white">
                              ₩{Number(expense.amount).toLocaleString()}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {format(new Date(expense.date), 'MM/dd', { locale: ko })}
                            </p>
                          </div>
                        </div>
                      </li>
                    ))
                  ) : (
                    <li className="py-12 text-center text-gray-500 dark:text-gray-400">
                      <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                        <div className="text-3xl">💸</div>
                      </div>
                      <p className="text-lg font-semibold mb-2 text-gray-700 dark:text-gray-300">지출 내역이 없습니다</p>
                      <p className="text-sm">지출 추가 버튼을 눌러 첫 지출을 기록해보세요</p>
                    </li>
                  )}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <ExpenseModal
          categories={categories}
          onClose={() => setIsModalOpen(false)}
          onSuccess={handleExpenseAdded}
        />
      )}

      {/* Toast 알림 */}
      {toasts.map(toast => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={() => hideToast(toast.id)}
        />
      ))}
    </Layout>
  );
};

export default Dashboard;
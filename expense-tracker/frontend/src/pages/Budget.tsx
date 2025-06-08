import React, { useEffect, useState } from 'react';
import { format } from 'date-fns';
import Layout from '../components/Layout';
import { budgetService, Budget, BudgetComparison } from '../services/budget.service';
import { categoryService } from '../services/category.service';
import { Category } from '../types';
import LoadingSpinner from '../components/LoadingSpinner';
import Toast from '../components/Toast';
import { useToast } from '../hooks/useToast';

const BudgetPage: React.FC = () => {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [comparison, setComparison] = useState<BudgetComparison | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), 'yyyy-MM'));
  const [newBudgets, setNewBudgets] = useState<{ [categoryId: string]: string }>({});
  const { toasts, hideToast, showSuccess, showError } = useToast();

  useEffect(() => {
    fetchData();
  }, [selectedMonth]);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const data = await categoryService.getCategories();
      setCategories(data);
    } catch (error) {
      console.error('Error fetching categories:', error);
      showError('카테고리를 불러오는데 실패했습니다.');
    }
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const [budgetsData, comparisonData] = await Promise.all([
        budgetService.getBudgets(selectedMonth),
        budgetService.getBudgetComparison(selectedMonth),
      ]);
      setBudgets(budgetsData);
      setComparison(comparisonData);
    } catch (error) {
      console.error('Error fetching data:', error);
      showError('데이터를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleBudgetChange = (categoryId: string, amount: string) => {
    setNewBudgets(prev => ({
      ...prev,
      [categoryId]: amount
    }));
  };

  const saveBudget = async (categoryId: string) => {
    const amount = newBudgets[categoryId];
    if (!amount || parseFloat(amount) <= 0) {
      showError('올바른 예산 금액을 입력해주세요.');
      return;
    }

    try {
      await budgetService.createBudget({
        categoryId,
        amount: parseFloat(amount),
        month: selectedMonth
      });
      
      showSuccess('예산이 설정되었습니다.');
      fetchData();
      setNewBudgets(prev => ({ ...prev, [categoryId]: '' }));
    } catch (error) {
      console.error('Error saving budget:', error);
      showError('예산 설정에 실패했습니다.');
    }
  };

  const getProgressBarColor = (percentage: number, isOverBudget: boolean) => {
    if (isOverBudget) return 'bg-red-500';
    if (percentage >= 80) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <LoadingSpinner size="lg" text="예산 데이터를 불러오는 중..." />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">예산 관리</h1>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                기간 선택
              </label>
              <input
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
          </div>

          {/* 전체 예산 요약 */}
          {comparison && (
            <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg mb-8 border border-gray-200 dark:border-gray-700">
              <div className="p-5">
                <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                  {selectedMonth} 예산 현황
                </h2>
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-4">
                  <div>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">총 예산</dt>
                    <dd className="text-lg font-semibold text-blue-600">
                      ₩{Number(comparison.totalBudget).toLocaleString()}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">실제 지출</dt>
                    <dd className="text-lg font-semibold text-gray-900 dark:text-white">
                      ₩{Number(comparison.totalActual).toLocaleString()}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">남은 예산</dt>
                    <dd className={`text-lg font-semibold ${
                      Number(comparison.totalRemaining) >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      ₩{Number(comparison.totalRemaining).toLocaleString()}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">사용률</dt>
                    <dd className="text-lg font-semibold text-gray-900">
                      {comparison.totalUsagePercentage}%
                    </dd>
                  </div>
                </div>
                
                {/* 전체 진행률 바 */}
                <div className="mt-4">
                  <div className="flex justify-between text-sm text-gray-600 mb-1">
                    <span>전체 예산 사용률</span>
                    <span>{comparison.totalUsagePercentage}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${getProgressBarColor(
                        comparison.totalUsagePercentage, 
                        Number(comparison.totalRemaining) < 0
                      )}`}
                      style={{ width: `${Math.min(comparison.totalUsagePercentage, 100)}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 카테고리별 예산 설정 */}
          <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-md border border-gray-200 dark:border-gray-700">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-medium text-gray-900">
                  카테고리별 예산 설정
                </h2>
                <div className="text-sm text-gray-500">
                  💡 카테고리별로 월 예산을 설정하여 지출을 관리하세요
                </div>
              </div>
              
              <div className="space-y-4">
                {categories.map(category => {
                  const budgetData = comparison?.categories.find(b => b.categoryId === category.id);
                  const hasExistingBudget = budgetData !== undefined;
                  
                  return (
                    <div key={category.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center">
                          <span className="text-2xl mr-3">{category.icon}</span>
                          <span className="font-medium text-gray-900">{category.name}</span>
                        </div>
                        
                        {!hasExistingBudget && (
                          <div className="flex items-center space-x-2">
                            <input
                              type="number"
                              placeholder="예산 금액"
                              value={newBudgets[category.id] || ''}
                              onChange={(e) => handleBudgetChange(category.id, e.target.value)}
                              className="w-32 px-3 py-1 text-sm border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                            />
                            <button
                              onClick={() => saveBudget(category.id)}
                              className="px-3 py-1 text-sm bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                            >
                              설정
                            </button>
                          </div>
                        )}
                      </div>

                      {hasExistingBudget && budgetData && (
                        <div>
                          <div className="flex justify-between text-sm text-gray-600 mb-2">
                            <span>예산: ₩{Number(budgetData.budgetAmount).toLocaleString()}</span>
                            <span>지출: ₩{Number(budgetData.actualAmount).toLocaleString()}</span>
                            <span className={budgetData.isOverBudget ? 'text-red-600' : 'text-green-600'}>
                              {budgetData.isOverBudget ? '초과' : '남음'}: ₩{Math.abs(Number(budgetData.remainingAmount)).toLocaleString()}
                            </span>
                          </div>
                          
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full ${getProgressBarColor(
                                budgetData.usagePercentage, 
                                budgetData.isOverBudget
                              )}`}
                              style={{ width: `${Math.min(budgetData.usagePercentage, 100)}%` }}
                            ></div>
                          </div>
                          
                          <div className="flex justify-between text-xs text-gray-500 mt-1">
                            <span>0%</span>
                            <span>{budgetData.usagePercentage}%</span>
                            <span>100%</span>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

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

export default BudgetPage;
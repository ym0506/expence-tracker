import React, { useEffect, useState, useCallback } from 'react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import Layout from '../components/Layout';
import ExpenseItem from '../components/ExpenseItem';
import Toast from '../components/Toast';
import { expenseService } from '../services/expense.service';
import { categoryService } from '../services/category.service';
import { Expense, Category } from '../types';
import ExpenseModal from '../components/ExpenseModal';
import { useToast } from '../hooks/useToast';
import { useApiWithRetry } from '../hooks/useApiWithRetry';

const ExpenseList: React.FC = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);
  const { 
    toasts, 
    hideToast, 
    showSuccess, 
    showError, 
    showNetworkError, 
    showLoading 
  } = useToast();
  const [filters, setFilters] = useState({
    categoryId: '',
    startDate: '',
    endDate: '',
    search: '',
    minAmount: '',
    maxAmount: '',
    sortBy: 'date',
    sortOrder: 'desc',
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchExpenses();
  }, [pagination.page, filters]);

  const fetchCategories = async () => {
    try {
      const data = await categoryService.getCategories();
      setCategories(data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const {
    data: expensesData,
    loading: fetchLoading,
    error: fetchError,
    execute: executeFetchExpenses
  } = useApiWithRetry(
    () => expenseService.getExpenses({
      page: pagination.page,
      limit: pagination.limit,
      ...filters,
    }),
    {
      onSuccess: (data) => {
        setExpenses(data.expenses);
        setPagination(data.pagination);
        setSummary(data.summary);
      },
      onError: (error) => {
        showNetworkError(error, executeFetchExpenses);
      }
    }
  );

  const fetchExpenses = useCallback(() => {
    setLoading(true);
    executeFetchExpenses().finally(() => setLoading(false));
  }, [executeFetchExpenses]);

  const handleDelete = async (id: string) => {
    if (window.confirm('정말 삭제하시겠습니까?')) {
      const loadingToastId = showLoading('지출을 삭제하는 중...');
      
      try {
        await expenseService.deleteExpense(id);
        hideToast(loadingToastId);
        showSuccess('지출이 성공적으로 삭제되었습니다 🗑️');
        fetchExpenses();
      } catch (error: any) {
        hideToast(loadingToastId);
        showNetworkError(error, () => handleDelete(id));
      }
    }
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    const { name, value } = e.target;
    
    // 검색 입력에 대해서는 디바운싱 적용
    if (name === 'search') {
      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }
      
      const timeout = setTimeout(() => {
        setFilters(prev => ({
          ...prev,
          [name]: value,
        }));
        setPagination(prev => ({ ...prev, page: 1 }));
      }, 500); // 500ms 디바운싱
      
      setSearchTimeout(timeout);
      
      // 즉시 UI 업데이트를 위해 필터 상태만 변경
      setFilters(prev => ({
        ...prev,
        [name]: value,
      }));
    } else {
      // 다른 필터는 즉시 적용
      setFilters(prev => ({
        ...prev,
        [name]: value,
      }));
      setPagination(prev => ({ ...prev, page: 1 }));
    }
  };
  
  // 컴포넌트 언마운트 시 타이머 정리
  useEffect(() => {
    return () => {
      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }
    };
  }, [searchTimeout]);

  const handlePageChange = (newPage: number) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  const handleExpenseSuccess = () => {
    setIsModalOpen(false);
    setEditingExpense(null);
    fetchExpenses();
    showSuccess(editingExpense ? '지출이 성공적으로 수정되었습니다 ✏️' : '지출이 성공적으로 추가되었습니다 ➕');
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <div className="text-gray-500">로딩 중...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout onAddExpense={() => setIsModalOpen(true)}>
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">지출 내역</h1>
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

          {/* 검색 및 필터 */}
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl mb-6 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                검색 및 필터
              </h2>
              <button
                onClick={() => setFilters({
                  categoryId: '',
                  startDate: '',
                  endDate: '',
                  search: '',
                  minAmount: '',
                  maxAmount: '',
                  sortBy: 'date',
                  sortOrder: 'desc',
                })}
                className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors duration-200"
              >
                필터 초기화
              </button>
            </div>

            {/* 검색바 */}
            <div className="mb-6">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="설명, 카테고리명으로 검색..."
                  value={filters.search}
                  name="search"
                  onChange={handleFilterChange}
                  className="block w-full pl-10 pr-4 py-3 text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-gray-500 focus:border-gray-500 transition-colors duration-200"
                />
              </div>
            </div>

            {/* 필터 그리드 */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-4">
              <div>
                <label htmlFor="categoryId" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  카테고리
                </label>
                <select
                  id="categoryId"
                  name="categoryId"
                  value={filters.categoryId}
                  onChange={handleFilterChange}
                  className="block w-full px-3 py-2 text-gray-900 dark:text-white bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-gray-500 focus:border-gray-500 transition-colors duration-200"
                >
                  <option value="">전체 카테고리</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.icon} {category.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  시작 날짜
                </label>
                <input
                  type="date"
                  id="startDate"
                  name="startDate"
                  value={filters.startDate}
                  onChange={handleFilterChange}
                  className="block w-full px-3 py-2 text-gray-900 dark:text-white bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-gray-500 focus:border-gray-500 transition-colors duration-200"
                />
              </div>
              
              <div>
                <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  종료 날짜
                </label>
                <input
                  type="date"
                  id="endDate"
                  name="endDate"
                  value={filters.endDate}
                  onChange={handleFilterChange}
                  className="block w-full px-3 py-2 text-gray-900 dark:text-white bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-gray-500 focus:border-gray-500 transition-colors duration-200"
                />
              </div>

              <div>
                <label htmlFor="sortBy" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  정렬 기준
                </label>
                <select
                  id="sortBy"
                  name="sortBy"
                  value={filters.sortBy}
                  onChange={handleFilterChange}
                  className="block w-full px-3 py-2 text-gray-900 dark:text-white bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-gray-500 focus:border-gray-500 transition-colors duration-200"
                >
                  <option value="date">날짜순</option>
                  <option value="amount">금액순</option>
                  <option value="category">카테고리순</option>
                </select>
              </div>
            </div>

            {/* 금액 범위 필터 */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div>
                <label htmlFor="minAmount" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  최소 금액
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 dark:text-gray-400">₩</span>
                  </div>
                  <input
                    type="number"
                    id="minAmount"
                    name="minAmount"
                    value={filters.minAmount}
                    onChange={handleFilterChange}
                    placeholder="0"
                    className="block w-full pl-8 pr-3 py-2 text-gray-900 dark:text-white bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-gray-500 focus:border-gray-500 transition-colors duration-200"
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="maxAmount" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  최대 금액
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 dark:text-gray-400">₩</span>
                  </div>
                  <input
                    type="number"
                    id="maxAmount"
                    name="maxAmount"
                    value={filters.maxAmount}
                    onChange={handleFilterChange}
                    placeholder="1,000,000"
                    className="block w-full pl-8 pr-3 py-2 text-gray-900 dark:text-white bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-gray-500 focus:border-gray-500 transition-colors duration-200"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="sortOrder" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  정렬 순서
                </label>
                <select
                  id="sortOrder"
                  name="sortOrder"
                  value={filters.sortOrder}
                  onChange={handleFilterChange}
                  className="block w-full px-3 py-2 text-gray-900 dark:text-white bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-gray-500 focus:border-gray-500 transition-colors duration-200"
                >
                  <option value="desc">내림차순</option>
                  <option value="asc">오름차순</option>
                </select>
              </div>
            </div>
          </div>

          {/* 검색 결과 요약 */}
          {summary && summary.hasFilters && (
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4 mb-6">
              <div className="flex items-center mb-3">
                <svg className="w-5 h-5 text-blue-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 00-2-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 00-2 2z" />
                </svg>
                <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-100">검색 결과 요약</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                <div className="bg-white dark:bg-blue-800/30 rounded-lg p-3">
                  <div className="text-gray-600 dark:text-blue-300">총 지출</div>
                  <div className="text-lg font-bold text-blue-900 dark:text-blue-100">
                    ₩{Number(summary.totalAmount).toLocaleString()}
                  </div>
                </div>
                <div className="bg-white dark:bg-blue-800/30 rounded-lg p-3">
                  <div className="text-gray-600 dark:text-blue-300">평균 지출</div>
                  <div className="text-lg font-bold text-blue-900 dark:text-blue-100">
                    ₩{Math.round(Number(summary.averageAmount)).toLocaleString()}
                  </div>
                </div>
                <div className="bg-white dark:bg-blue-800/30 rounded-lg p-3">
                  <div className="text-gray-600 dark:text-blue-300">총 건수</div>
                  <div className="text-lg font-bold text-blue-900 dark:text-blue-100">
                    {pagination.total}건
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 모바일 사용 가이드 */}
          <div className="block sm:hidden mb-4">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    💡 <strong>팁:</strong> 지출 항목을 왼쪽으로 스와이프하면 수정/삭제 버튼이 나타납니다
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* 지출 목록 */}
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
            {expenses.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                  <div className="text-3xl">🔍</div>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {summary?.hasFilters ? '검색 결과가 없습니다' : '지출 내역이 없습니다'}
                </h3>
                <p className="text-gray-500 dark:text-gray-400">
                  {summary?.hasFilters ? '다른 조건으로 검색해보세요' : '첫 지출을 추가해보세요'}
                </p>
              </div>
            ) : (
              <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                {expenses.map((expense, index) => (
                  <ExpenseItem
                    key={expense.id}
                    expense={expense}
                    index={index}
                    onEdit={(expense) => {
                      setEditingExpense(expense);
                      setIsModalOpen(true);
                    }}
                    onDelete={handleDelete}
                  />
                ))}
              </ul>
            )}
          </div>

          {/* 페이지네이션 */}
          {pagination.totalPages > 1 && (
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-6 py-4 mt-6">
              <div className="flex items-center justify-between">
                {/* 모바일 페이지네이션 */}
                <div className="flex-1 flex justify-between sm:hidden">
                  <button
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={pagination.page === 1}
                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-lg text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 transition-colors duration-200"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    이전
                  </button>
                  <div className="flex items-center">
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      {pagination.page} / {pagination.totalPages}
                    </span>
                  </div>
                  <button
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={pagination.page === pagination.totalPages}
                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-lg text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 transition-colors duration-200"
                  >
                    다음
                    <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>

                {/* 데스크톱 페이지네이션 */}
                <div className="hidden sm:flex sm:items-center sm:justify-between sm:w-full">
                  <div>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      총 <span className="font-medium text-gray-900 dark:text-white">{pagination.total}</span>개 중{' '}
                      <span className="font-medium text-gray-900 dark:text-white">
                        {(pagination.page - 1) * pagination.limit + 1}
                      </span>
                      -
                      <span className="font-medium text-gray-900 dark:text-white">
                        {Math.min(pagination.page * pagination.limit, pagination.total)}
                      </span>
                      개 표시
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handlePageChange(pagination.page - 1)}
                      disabled={pagination.page === 1}
                      className="relative inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-lg text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 transition-colors duration-200"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    
                    <nav className="relative z-0 inline-flex rounded-lg shadow-sm space-x-1">
                      {Array.from({ length: Math.min(pagination.totalPages, 5) }, (_, i) => {
                        const pageNum = i + 1;
                        const isActive = pagination.page === pageNum;
                        return (
                          <button
                            key={pageNum}
                            onClick={() => handlePageChange(pageNum)}
                            className={`relative inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${
                              isActive
                                ? 'bg-gray-900 text-white'
                                : 'bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                      {pagination.totalPages > 5 && (
                        <>
                          <span className="inline-flex items-center px-2 py-2 text-sm text-gray-500 dark:text-gray-400">...</span>
                          <button
                            onClick={() => handlePageChange(pagination.totalPages)}
                            className={`relative inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${
                              pagination.page === pagination.totalPages
                                ? 'bg-gray-900 text-white'
                                : 'bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'
                            }`}
                          >
                            {pagination.totalPages}
                          </button>
                        </>
                      )}
                    </nav>
                    
                    <button
                      onClick={() => handlePageChange(pagination.page + 1)}
                      disabled={pagination.page === pagination.totalPages}
                      className="relative inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-lg text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 transition-colors duration-200"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {isModalOpen && (
        <ExpenseModal
          categories={categories}
          onClose={() => {
            setIsModalOpen(false);
            setEditingExpense(null);
          }}
          onSuccess={handleExpenseSuccess}
          expense={editingExpense}
        />
      )}

      {/* Toast 알림 */}
      {toasts.map(toast => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={() => hideToast(toast.id)}
          action={toast.action}
        />
      ))}
    </Layout>
  );
};

export default ExpenseList;
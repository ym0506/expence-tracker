import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import CategoryChart from '../components/CategoryChart';
import LoadingSpinner from '../components/LoadingSpinner';
import { useDarkMode } from '../hooks/useDarkMode';

const Demo: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const { isDarkMode, toggleDarkMode } = useDarkMode();

  // 샘플 데이터
  const sampleExpenses = [
    {
      id: '1',
      amount: 35000,
      description: '스타벅스 아메리카노',
      date: new Date('2024-01-15'),
      category: { name: '카페/음료', icon: '☕' }
    },
    {
      id: '2',
      amount: 120000,
      description: '마트 장보기',
      date: new Date('2024-01-14'),
      category: { name: '식료품', icon: '🛒' }
    },
    {
      id: '3',
      amount: 15000,
      description: '지하철 교통비',
      date: new Date('2024-01-13'),
      category: { name: '교통', icon: '🚇' }
    },
    {
      id: '4',
      amount: 85000,
      description: '점심 회식',
      date: new Date('2024-01-12'),
      category: { name: '외식', icon: '🍽️' }
    },
    {
      id: '5',
      amount: 12000,
      description: '편의점',
      date: new Date('2024-01-11'),
      category: { name: '생활용품', icon: '🏪' }
    }
  ];

  const categoryBreakdown = [
    { 
      category: { id: '1', name: '식료품', icon: '🛒', color: '#3B82F6' },
      totalAmount: '120000',
      transactionCount: 1
    },
    { 
      category: { id: '2', name: '외식', icon: '🍽️', color: '#EF4444' },
      totalAmount: '85000',
      transactionCount: 1
    },
    { 
      category: { id: '3', name: '카페/음료', icon: '☕', color: '#F59E0B' },
      totalAmount: '35000',
      transactionCount: 1
    },
    { 
      category: { id: '4', name: '교통', icon: '🚇', color: '#10B981' },
      totalAmount: '15000',
      transactionCount: 1
    },
    { 
      category: { id: '5', name: '생활용품', icon: '🏪', color: '#8B5CF6' },
      totalAmount: '12000',
      transactionCount: 1
    }
  ];

  const totalAmount = sampleExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  const transactionCount = sampleExpenses.length;
  const dailyAverage = Math.round(totalAmount / 15); // 15일 기준

  const handleDemoAction = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      alert('데모 기능입니다! 실제 계정을 만들어 모든 기능을 사용해보세요 😊');
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      {/* Demo Header */}
      <nav className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link to="/" className="text-xl font-bold text-primary-600 dark:text-primary-400">
                💰 ExpenseTracker
              </Link>
              <div className="ml-6 px-3 py-1 bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 rounded-full text-sm font-medium">
                🎮 데모 모드
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={toggleDarkMode}
                className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200"
                title={isDarkMode ? '라이트 모드로 전환' : '다크 모드로 전환'}
              >
                {isDarkMode ? (
                  <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5 text-gray-700" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                  </svg>
                )}
              </button>
              
              <Link
                to="/login"
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors duration-200"
              >
                로그인
              </Link>
              <Link
                to="/register"
                className="px-6 py-2 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white rounded-lg font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
              >
                시작하기
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Demo Content */}
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">데모 대시보드</h1>
            <button
              onClick={handleDemoAction}
              className="bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center space-x-2"
            >
              {loading ? (
                <LoadingSpinner size="sm" variant="white" />
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              )}
              <span className={loading ? 'ml-2' : ''}>
                {loading ? '처리 중...' : '지출 추가'}
              </span>
            </button>
          </div>

          {/* 데모 안내 */}
          <div className="mb-8 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-100 dark:bg-blue-800 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 dark:text-blue-400 text-lg">ℹ️</span>
                </div>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">
                  ExpenseTracker 데모 체험
                </h3>
                <p className="text-blue-700 dark:text-blue-300 mb-3">
                  실제 데이터 없이 ExpenseTracker의 주요 기능들을 미리 체험해보세요. 
                  아래는 샘플 데이터로 구성된 대시보드입니다.
                </p>
                <div className="flex space-x-3">
                  <Link
                    to="/register"
                    className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors duration-200"
                  >
                    무료 계정 만들기
                  </Link>
                  <Link
                    to="/"
                    className="inline-flex items-center px-4 py-2 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 font-medium transition-colors duration-200"
                  >
                    홈으로 돌아가기
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* 월별 요약 */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 mb-8">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 overflow-hidden shadow-lg rounded-xl transform hover:scale-105 transition-all duration-300">
              <div className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                      <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-4 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-blue-100 truncate">이번 달 총 지출</dt>
                      <dd className="text-xl font-bold text-white">
                        ₩{totalAmount.toLocaleString()}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-purple-500 to-purple-600 dark:from-purple-600 dark:to-purple-700 overflow-hidden shadow-lg rounded-xl transform hover:scale-105 transition-all duration-300">
              <div className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                      <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-4 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-purple-100 truncate">거래 건수</dt>
                      <dd className="text-xl font-bold text-white">
                        {transactionCount}건
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-500 to-green-600 dark:from-green-600 dark:to-green-700 overflow-hidden shadow-lg rounded-xl transform hover:scale-105 transition-all duration-300">
              <div className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                      <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-4 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-green-100 truncate">일 평균 지출</dt>
                      <dd className="text-xl font-bold text-white">
                        ₩{dailyAverage.toLocaleString()}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
            {/* 카테고리별 차트 */}
            <div className="bg-white dark:bg-gray-800 shadow-xl rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
                <span className="w-2 h-6 bg-gradient-to-b from-primary-500 to-primary-600 rounded-full mr-3"></span>
                카테고리별 지출
              </h2>
              <CategoryChart data={categoryBreakdown} />
            </div>

            {/* 최근 지출 내역 */}
            <div className="bg-white dark:bg-gray-800 shadow-xl rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
                <span className="w-2 h-6 bg-gradient-to-b from-green-500 to-green-600 rounded-full mr-3"></span>
                최근 지출 내역
              </h2>
              <div className="flow-root">
                <ul className="space-y-3">
                  {sampleExpenses.map((expense, index) => (
                    <li key={expense.id} className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200 animate-slide-up" style={{ animationDelay: `${index * 0.1}s` }}>
                      <div className="flex items-center space-x-4">
                        <div className="flex-shrink-0">
                          <div className="w-12 h-12 bg-white dark:bg-gray-600 rounded-xl flex items-center justify-center shadow-sm">
                            <span className="text-2xl">{expense.category.icon}</span>
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                            {expense.category.name}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                            {expense.description}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-gray-900 dark:text-white">
                            ₩{expense.amount.toLocaleString()}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {format(expense.date, 'MM/dd', { locale: ko })}
                          </p>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Demo;
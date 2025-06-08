import React, { useState } from 'react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { Expense } from '../types';
import { useSwipe } from '../hooks/useSwipe';

interface ExpenseItemProps {
  expense: Expense;
  onEdit: (expense: Expense) => void;
  onDelete: (id: string) => void;
  index: number;
}

const ExpenseItem: React.FC<ExpenseItemProps> = ({ expense, onEdit, onDelete, index }) => {
  const [showActions, setShowActions] = useState(false);
  const [translateX, setTranslateX] = useState(0);

  const swipeHandlers = useSwipe({
    onSwipeLeft: () => {
      setShowActions(true);
      setTranslateX(-100);
    },
    onSwipeRight: () => {
      setShowActions(false);
      setTranslateX(0);
    },
    threshold: 50
  });

  const handleEdit = () => {
    setShowActions(false);
    setTranslateX(0);
    onEdit(expense);
  };

  const handleDelete = () => {
    setShowActions(false);
    setTranslateX(0);
    onDelete(expense.id);
  };

  return (
    <li className="relative overflow-hidden bg-white dark:bg-gray-800">
      {/* 액션 버튼들 (스와이프 시 나타남) */}
      <div className={`absolute right-0 top-0 h-full flex items-center transition-all duration-300 ${showActions ? 'opacity-100' : 'opacity-0'}`}>
        <button
          onClick={handleEdit}
          className="h-full px-6 bg-blue-500 hover:bg-blue-600 text-white font-medium transition-colors duration-200 flex items-center"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
          수정
        </button>
        <button
          onClick={handleDelete}
          className="h-full px-6 bg-red-500 hover:bg-red-600 text-white font-medium transition-colors duration-200 flex items-center"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
          삭제
        </button>
      </div>

      {/* 메인 콘텐츠 */}
      <div
        className={`transform transition-transform duration-300 hover:bg-gray-50 dark:hover:bg-gray-700/50`}
        style={{ transform: `translateX(${translateX}px)` }}
        {...swipeHandlers}
      >
        <div className="px-6 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center flex-1 min-w-0">
              <div className="flex-shrink-0 w-12 h-12 bg-white dark:bg-gray-600 rounded-xl flex items-center justify-center shadow-sm mr-4">
                <span className="text-2xl">{expense.category?.icon}</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                    {expense.category?.name}
                  </p>
                  {expense.receiptImageUrl && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300">
                      📷 영수증
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                  {expense.description || '설명 없음'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-6">
              <div className="text-right">
                <p className="text-sm font-bold text-gray-900 dark:text-white">
                  ₩{Number(expense.amount).toLocaleString()}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {format(new Date(expense.date), 'MM/dd (E)', { locale: ko })}
                </p>
              </div>
              
              {/* 데스크톱용 액션 버튼 */}
              <div className="hidden sm:flex items-center space-x-2">
                <button
                  onClick={handleEdit}
                  className="inline-flex items-center px-3 py-1 rounded-lg text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors duration-200"
                >
                  <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  수정
                </button>
                <button
                  onClick={handleDelete}
                  className="inline-flex items-center px-3 py-1 rounded-lg text-xs font-medium bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors duration-200"
                >
                  <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  삭제
                </button>
              </div>

              {/* 모바일용 스와이프 힌트 */}
              <div className="sm:hidden flex items-center">
                <svg className="w-4 h-4 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </li>
  );
};

export default ExpenseItem;
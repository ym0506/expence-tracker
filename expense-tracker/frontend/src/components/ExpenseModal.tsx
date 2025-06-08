import React, { useState } from 'react';
import { format } from 'date-fns';
import { Category, ExpenseFormData } from '../types';
import { expenseService } from '../services/expense.service';
import OCRModal from './OCRModal';
import LoadingSpinner from './LoadingSpinner';
import { OCRResult } from '../services/ocr.service';

interface ExpenseModalProps {
  categories: Category[];
  onClose: () => void;
  onSuccess: () => void;
  expense?: any;
}

const ExpenseModal: React.FC<ExpenseModalProps> = ({ categories, onClose, onSuccess, expense }) => {
  const [formData, setFormData] = useState<ExpenseFormData>({
    categoryId: expense?.categoryId || '',
    amount: expense ? Number(expense.amount) : 0,
    description: expense?.description || '',
    date: expense ? format(new Date(expense.date), 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'),
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showOCRModal, setShowOCRModal] = useState(false);
  const [ocrSuccess, setOcrSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.categoryId || formData.amount <= 0) {
      setError('카테고리와 금액을 입력해주세요.');
      return;
    }

    try {
      setLoading(true);
      if (expense) {
        await expenseService.updateExpense(expense.id, formData);
      } else {
        await expenseService.createExpense(formData);
      }
      onSuccess();
    } catch (err) {
      setError(expense ? '지출 수정에 실패했습니다.' : '지출 추가에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'amount' ? Number(value) : value
    }));
  };

  const handleOCRResult = (result: OCRResult) => {
    const { parsedData } = result;
    
    // Find category by suggested category name
    const suggestedCategory = categories.find(cat => cat.name === parsedData.suggestedCategory);
    
    const updates: string[] = [];
    
    setFormData(prev => {
      const newData = { ...prev };
      
      if (suggestedCategory?.id && suggestedCategory.id !== prev.categoryId) {
        newData.categoryId = suggestedCategory.id;
        updates.push(`카테고리: ${suggestedCategory.name}`);
      }
      
      if (parsedData.totalAmount && parsedData.totalAmount !== prev.amount) {
        newData.amount = parsedData.totalAmount;
        updates.push(`금액: ₩${parsedData.totalAmount.toLocaleString()}`);
      }
      
      if (parsedData.merchantName && parsedData.merchantName !== '알 수 없음' && parsedData.merchantName !== prev.description) {
        newData.description = parsedData.merchantName;
        updates.push(`설명: ${parsedData.merchantName}`);
      }
      
      if (parsedData.date && parsedData.date !== prev.date) {
        newData.date = parsedData.date;
        updates.push(`날짜: ${parsedData.date}`);
      }
      
      if (parsedData.receiptImageUrl) {
        newData.receiptImageUrl = parsedData.receiptImageUrl;
        updates.push('영수증 이미지 첨부됨');
      }
      
      return newData;
    });
    
    if (updates.length > 0) {
      setOcrSuccess(`📝 OCR로 자동 입력됨: ${updates.join(', ')}`);
      setTimeout(() => setOcrSuccess(''), 5000); // 5초 후 메시지 제거
    } else {
      setOcrSuccess('📷 영수증을 분석했지만 추출할 수 있는 정보가 없습니다.');
      setTimeout(() => setOcrSuccess(''), 3000);
    }
    
    setError('');
  };

  return (
    <div className="fixed z-10 inset-0 overflow-y-auto">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
          <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>

        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <form onSubmit={handleSubmit}>
            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  {expense ? '지출 수정' : '지출 추가'}
                </h3>
                {!expense && (
                  <button
                    type="button"
                    onClick={() => setShowOCRModal(true)}
                    className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    📷 영수증 스캔
                  </button>
                )}
              </div>
              
              {error && (
                <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
                  {error}
                </div>
              )}
              
              {ocrSuccess && (
                <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
                  {ocrSuccess}
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label htmlFor="categoryId" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    카테고리
                  </label>
                  <select
                    id="categoryId"
                    name="categoryId"
                    value={formData.categoryId}
                    onChange={handleChange}
                    className="mt-1 block w-full h-12 pl-4 pr-10 text-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-primary-500 focus:border-primary-500 rounded-xl"
                    required
                  >
                    <option value="">선택하세요</option>
                    {categories.map(category => (
                      <option key={category.id} value={category.id}>
                        {category.icon} {category.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="amount" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    금액
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <span className="text-gray-500 dark:text-gray-400 text-lg">₩</span>
                    </div>
                    <input
                      type="number"
                      id="amount"
                      name="amount"
                      value={formData.amount}
                      onChange={handleChange}
                      min="0"
                      step="100"
                      placeholder="10,000"
                      inputMode="numeric"
                      className="pl-10 block w-full h-12 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl shadow-sm focus:ring-primary-500 focus:border-primary-500 text-lg"
                      required
                    />
                  </div>
                  {formData.amount > 0 && (
                    <p className="mt-1 text-sm text-gray-500">
                      {formData.amount.toLocaleString()}원
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="date" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    날짜
                  </label>
                  <input
                    type="date"
                    id="date"
                    name="date"
                    value={formData.date}
                    onChange={handleChange}
                    className="mt-1 block w-full h-12 px-4 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl shadow-sm focus:ring-primary-500 focus:border-primary-500 text-lg"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    설명 (선택사항)
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={3}
                    placeholder="지출에 대한 메모를 입력하세요"
                    className="mt-1 block w-full px-4 py-3 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl shadow-sm focus:ring-primary-500 focus:border-primary-500 text-lg resize-none"
                  />
                </div>
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-gray-800 px-4 py-4 sm:px-6 flex flex-col sm:flex-row-reverse gap-3">
              <button
                type="submit"
                disabled={loading}
                className="w-full inline-flex justify-center items-center rounded-xl border border-transparent shadow-lg px-6 py-4 sm:py-3 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-base font-semibold text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:w-auto disabled:opacity-50 transition-all duration-200 min-h-[48px]"
              >
                {loading && <LoadingSpinner size="sm" variant="white" />}
                <span className={loading ? 'ml-2' : ''}>
                  {loading ? (expense ? '수정 중...' : '추가 중...') : (expense ? '수정' : '추가')}
                </span>
              </button>
              <button
                type="button"
                onClick={onClose}
                className="w-full inline-flex justify-center rounded-xl border border-gray-300 dark:border-gray-600 shadow-sm px-6 py-4 sm:py-3 bg-white dark:bg-gray-700 text-base font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:w-auto transition-all duration-200 min-h-[48px]"
              >
                취소
              </button>
            </div>
          </form>
        </div>
      </div>

      <OCRModal
        isOpen={showOCRModal}
        onClose={() => setShowOCRModal(false)}
        onOCRResult={handleOCRResult}
      />
    </div>
  );
};

export default ExpenseModal;
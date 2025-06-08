import React, { useEffect, useState } from 'react';
import api from '../services/api';
import LoadingSpinner from './LoadingSpinner';

interface InsightsData {
  currentMonth: {
    total: number;
    transactionCount: number;
  };
  lastMonth: {
    total: number;
    transactionCount: number;
  };
  monthlyChange: {
    amount: number;
    percentage: number;
    trend: 'increase' | 'decrease' | 'stable';
  };
  topSpendingCategory: {
    category: {
      id: string;
      name: string;
      icon: string;
      color: string;
    };
    amount: number;
  } | null;
  weeklyTrend: Array<{
    date: string;
    amount: number;
  }>;
}

const InsightsDashboard: React.FC = () => {
  const [insights, setInsights] = useState<InsightsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchInsights();
  }, []);

  const fetchInsights = async () => {
    try {
      setLoading(true);
      const response = await api.get('/stats/insights');
      setInsights(response.data);
    } catch (error) {
      console.error('Error fetching insights:', error);
      setError('인사이트 데이터를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'increase':
        return '📈';
      case 'decrease':
        return '📉';
      default:
        return '➡️';
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'increase':
        return 'text-red-600';
      case 'decrease':
        return 'text-green-600';
      default:
        return 'text-gray-600';
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-center items-center h-32">
          <LoadingSpinner size="lg" text="인사이트를 분석하는 중..." />
        </div>
      </div>
    );
  }

  if (error || !insights) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-center text-red-600">
          {error || '데이터를 불러올 수 없습니다.'}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-6">💡 지출 인사이트</h2>
        
        {/* Monthly Comparison */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-blue-800 mb-2">이번 달 지출</h3>
            <p className="text-2xl font-bold text-blue-900">
              ₩{insights.currentMonth.total.toLocaleString()}
            </p>
            <p className="text-sm text-blue-600">
              {insights.currentMonth.transactionCount}건의 거래
            </p>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-gray-800 mb-2">지난 달 지출</h3>
            <p className="text-2xl font-bold text-gray-900">
              ₩{insights.lastMonth.total.toLocaleString()}
            </p>
            <p className="text-sm text-gray-600">
              {insights.lastMonth.transactionCount}건의 거래
            </p>
          </div>
          
          <div className="bg-white p-4 rounded-lg border-2 border-gray-200">
            <h3 className="text-sm font-medium text-gray-800 mb-2">전월 대비 변화</h3>
            <div className="flex items-center">
              <span className="text-xl mr-2">
                {getTrendIcon(insights.monthlyChange.trend)}
              </span>
              <div>
                <p className={`text-lg font-bold ${getTrendColor(insights.monthlyChange.trend)}`}>
                  {insights.monthlyChange.amount >= 0 ? '+' : ''}₩{Math.abs(insights.monthlyChange.amount).toLocaleString()}
                </p>
                <p className={`text-sm ${getTrendColor(insights.monthlyChange.trend)}`}>
                  {insights.monthlyChange.percentage >= 0 ? '+' : ''}{insights.monthlyChange.percentage.toFixed(1)}%
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Top Spending Category */}
        {insights.topSpendingCategory && (
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-800 mb-3">이번 달 최고 지출 카테고리</h3>
            <div className="flex items-center bg-yellow-50 p-4 rounded-lg">
              <span className="text-2xl mr-3">
                {insights.topSpendingCategory.category.icon}
              </span>
              <div className="flex-1">
                <p className="font-medium text-gray-900">
                  {insights.topSpendingCategory.category.name}
                </p>
                <p className="text-lg font-bold text-yellow-800">
                  ₩{insights.topSpendingCategory.amount.toLocaleString()}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-yellow-600">
                  전체 지출의
                </p>
                <p className="text-sm font-medium text-yellow-800">
                  {((insights.topSpendingCategory.amount / insights.currentMonth.total) * 100).toFixed(1)}%
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Weekly Trend */}
        {insights.weeklyTrend.length > 0 && (
          <div>
            <h3 className="text-sm font-medium text-gray-800 mb-3">최근 7일 지출 패턴</h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex justify-between items-end h-24 space-x-1">
                {insights.weeklyTrend.map((day, index) => {
                  const maxAmount = Math.max(...insights.weeklyTrend.map(d => d.amount));
                  const height = maxAmount > 0 ? (day.amount / maxAmount) * 100 : 0;
                  
                  return (
                    <div key={index} className="flex-1 flex flex-col items-center">
                      <div 
                        className="w-full bg-indigo-500 rounded-t"
                        style={{ height: `${height}%`, minHeight: day.amount > 0 ? '4px' : '0' }}
                        title={`${day.date}: ₩${day.amount.toLocaleString()}`}
                      ></div>
                      <div className="mt-1 text-xs text-gray-600 text-center">
                        {new Date(day.date).getDate()}일
                      </div>
                      <div className="text-xs text-gray-500 text-center">
                        ₩{day.amount.toLocaleString()}
                      </div>
                    </div>
                  );
                })}
              </div>
              <p className="text-xs text-gray-500 mt-2 text-center">
                일별 지출 금액 (최근 7일)
              </p>
            </div>
          </div>
        )}

        {/* Insights Summary */}
        <div className="mt-6 bg-indigo-50 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-indigo-800 mb-2">📊 분석 요약</h3>
          <ul className="text-sm text-indigo-700 space-y-1">
            {insights.monthlyChange.trend === 'increase' && (
              <li>• 지난 달 대비 지출이 {insights.monthlyChange.percentage.toFixed(1)}% 증가했습니다.</li>
            )}
            {insights.monthlyChange.trend === 'decrease' && (
              <li>• 지난 달 대비 지출이 {Math.abs(insights.monthlyChange.percentage).toFixed(1)}% 감소했습니다. 잘하고 있어요! 👏</li>
            )}
            {insights.topSpendingCategory && (
              <li>• {insights.topSpendingCategory.category.name} 카테고리에서 가장 많이 지출하고 있습니다.</li>
            )}
            <li>• 이번 달 총 {insights.currentMonth.transactionCount}번의 거래가 있었습니다.</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default InsightsDashboard;
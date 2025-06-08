import React from 'react';
import { BudgetAlert as BudgetAlertType } from '../services/budgetAlert.service';

interface BudgetAlertProps {
  alerts: BudgetAlertType[];
  onClose?: (alertId: string) => void;
}

const BudgetAlert: React.FC<BudgetAlertProps> = ({ alerts, onClose }) => {
  if (alerts.length === 0) return null;

  return (
    <div className="space-y-3">
      {alerts.map(alert => (
        <div
          key={alert.id}
          className={`p-4 rounded-md border-l-4 ${
            alert.severity === 'danger'
              ? 'bg-red-50 border-red-400'
              : 'bg-yellow-50 border-yellow-400'
          }`}
        >
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <span className="text-xl">{alert.categoryIcon}</span>
            </div>
            <div className="ml-3 flex-1">
              <p className={`text-sm font-medium ${
                alert.severity === 'danger' ? 'text-red-800' : 'text-yellow-800'
              }`}>
                {alert.message}
              </p>
              <div className="mt-2 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span>예산: ₩{alert.budgetAmount.toLocaleString()}</span>
                  <span>지출: ₩{alert.actualAmount.toLocaleString()}</span>
                </div>
                {alert.overAmount > 0 && (
                  <div className="mt-1">
                    <span className="text-red-600 font-medium">
                      초과: ₩{alert.overAmount.toLocaleString()}
                    </span>
                  </div>
                )}
              </div>
            </div>
            {onClose && (
              <div className="ml-auto pl-3">
                <button
                  onClick={() => onClose(alert.id)}
                  className={`inline-flex rounded-md p-1.5 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                    alert.severity === 'danger'
                      ? 'text-red-500 hover:bg-red-100 focus:ring-red-600'
                      : 'text-yellow-500 hover:bg-yellow-100 focus:ring-yellow-600'
                  }`}
                >
                  <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path
                      fillRule="evenodd"
                      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default BudgetAlert;
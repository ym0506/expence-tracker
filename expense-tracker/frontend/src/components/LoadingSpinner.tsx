import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  variant?: 'primary' | 'white' | 'gray';
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'md', 
  text, 
  variant = 'primary' 
}) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12'
  };

  const colorClasses = {
    primary: 'border-primary-600 dark:border-primary-400',
    white: 'border-white',
    gray: 'border-gray-600 dark:border-gray-400'
  };

  return (
    <div className="flex flex-col items-center justify-center animate-fade-in">
      <div className="relative">
        {/* 외부 원 */}
        <div className={`${sizeClasses[size]} rounded-full border-2 border-gray-200 dark:border-gray-700`}></div>
        {/* 회전하는 원 */}
        <div className={`absolute inset-0 ${sizeClasses[size]} rounded-full border-2 border-transparent border-t-2 ${colorClasses[variant]} animate-spin`}></div>
        {/* 중앙 펄스 효과 */}
        <div className={`absolute inset-2 rounded-full bg-gradient-to-r from-primary-500/20 to-primary-600/20 animate-pulse`}></div>
      </div>
      {text && (
        <p className="mt-3 text-sm text-gray-600 dark:text-gray-400 font-medium animate-pulse">
          {text}
        </p>
      )}
    </div>
  );
};

export default LoadingSpinner;
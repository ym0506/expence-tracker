import { useState, useCallback } from 'react';

interface UseApiWithRetryOptions {
  maxRetries?: number;
  initialDelay?: number;
  onError?: (error: any) => void;
  onSuccess?: (data: any) => void;
}

export const useApiWithRetry = <T>(
  apiCall: () => Promise<T>,
  options: UseApiWithRetryOptions = {}
) => {
  const {
    maxRetries = 3,
    initialDelay = 1000,
    onError,
    onSuccess
  } = options;

  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const execute = useCallback(async () => {
    setLoading(true);
    setError(null);
    setRetryCount(0);

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const result = await apiCall();
        setData(result);
        setError(null);
        setRetryCount(0);
        onSuccess?.(result);
        break;
      } catch (err: any) {
        setRetryCount(attempt + 1);
        
        if (attempt === maxRetries) {
          // 마지막 시도 실패
          const errorMessage = getErrorMessage(err);
          setError(errorMessage);
          onError?.(err);
        } else {
          // 재시도 대기
          const delay = initialDelay * Math.pow(2, attempt); // 지수 백오프
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }
    
    setLoading(false);
  }, [apiCall, maxRetries, initialDelay, onError, onSuccess]);

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setRetryCount(0);
    setLoading(false);
  }, []);

  return {
    data,
    loading,
    error,
    retryCount,
    execute,
    reset
  };
};

const getErrorMessage = (error: any): string => {
  // 네트워크 에러
  if (!navigator.onLine) {
    return '인터넷 연결을 확인해주세요. 📡';
  }

  // API 응답 에러
  if (error.response) {
    const status = error.response.status;
    const message = error.response.data?.message;

    switch (status) {
      case 400:
        return message || '잘못된 요청입니다. 입력 정보를 확인해주세요. ❌';
      case 401:
        return '로그인이 필요합니다. 다시 로그인해주세요. 🔐';
      case 403:
        return '권한이 없습니다. 관리자에게 문의해주세요. 🚫';
      case 404:
        return '요청한 정보를 찾을 수 없습니다. 🔍';
      case 429:
        return '요청이 너무 많습니다. 잠시 후 다시 시도해주세요. ⏰';
      case 500:
        return '서버에 문제가 발생했습니다. 잠시 후 다시 시도해주세요. 🛠️';
      case 503:
        return '서비스가 일시적으로 이용할 수 없습니다. 🚧';
      default:
        return message || `오류가 발생했습니다 (${status}). 다시 시도해주세요. ⚠️`;
    }
  }

  // 네트워크 타임아웃
  if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
    return '요청 시간이 초과되었습니다. 네트워크 상태를 확인해주세요. ⏱️';
  }

  // 일반 네트워크 에러
  if (error.request) {
    return '서버에 연결할 수 없습니다. 네트워크 상태를 확인해주세요. 🌐';
  }

  // 기타 에러
  return error.message || '알 수 없는 오류가 발생했습니다. 다시 시도해주세요. ❓';
};
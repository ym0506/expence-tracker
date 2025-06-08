import { useState, useCallback, useRef } from 'react';

interface ToastMessage {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning' | 'loading';
  action?: {
    label: string;
    onClick: () => void;
  };
}

export const useToast = () => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const loadingToastRef = useRef<string | null>(null);

  const showToast = useCallback((
    message: string, 
    type: 'success' | 'error' | 'info' | 'warning' | 'loading' = 'info',
    action?: { label: string; onClick: () => void }
  ) => {
    const id = Date.now().toString();
    const toast = { id, message, type, action };
    
    // 로딩 토스트는 중복 방지
    if (type === 'loading') {
      if (loadingToastRef.current) {
        hideToast(loadingToastRef.current);
      }
      loadingToastRef.current = id;
    }
    
    setToasts(prev => [...prev, toast]);
    return id;
  }, []);

  const hideToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
    if (loadingToastRef.current === id) {
      loadingToastRef.current = null;
    }
  }, []);

  const hideAllToasts = useCallback(() => {
    setToasts([]);
    loadingToastRef.current = null;
  }, []);

  const showSuccess = useCallback((message: string, action?: { label: string; onClick: () => void }) => {
    return showToast(message, 'success', action);
  }, [showToast]);

  const showError = useCallback((message: string, action?: { label: string; onClick: () => void }) => {
    return showToast(message, 'error', action);
  }, [showToast]);

  const showWarning = useCallback((message: string, action?: { label: string; onClick: () => void }) => {
    return showToast(message, 'warning', action);
  }, [showToast]);

  const showInfo = useCallback((message: string, action?: { label: string; onClick: () => void }) => {
    return showToast(message, 'info', action);
  }, [showToast]);

  const showLoading = useCallback((message: string) => {
    return showToast(message, 'loading');
  }, [showToast]);

  const showNetworkError = useCallback((originalError: any, retryAction: () => void) => {
    const isOffline = !navigator.onLine;
    const message = isOffline 
      ? '인터넷 연결을 확인해주세요 📡' 
      : '서버 연결에 실패했습니다 🌐';
    
    return showError(message, {
      label: '다시 시도',
      onClick: retryAction
    });
  }, [showError]);

  return {
    toasts,
    showToast,
    hideToast,
    hideAllToasts,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    showLoading,
    showNetworkError,
  };
};
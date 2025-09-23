'use client';

import { createContext, useContext, ReactNode, useCallback, useMemo } from 'react';
import { ToastContainer } from '@/components/ui/Toast';
import { showSuccess, showError, showInfo, showWarning } from '@/lib/toast';

interface ToastContextType {
  showSuccess: (message: string) => void;
  showError: (message: string) => void;
  showInfo: (message: string) => void;
  showWarning: (message: string) => void;
  showToast: (toast: { type: 'success' | 'error' | 'info' | 'warning'; message: string }) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const showToastCallback = useCallback((toast: { type: 'success' | 'error' | 'info' | 'warning'; message: string }) => {
    switch (toast.type) {
      case 'success': showSuccess(toast.message); break;
      case 'error': showError(toast.message); break;
      case 'warning': showWarning(toast.message); break;
      default: showInfo(toast.message);
    }
  }, []);

  const value = useMemo(() => ({
    showSuccess,
    showError,
    showInfo,
    showWarning,
    showToast: showToastCallback
  }), [showToastCallback]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastContainer />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

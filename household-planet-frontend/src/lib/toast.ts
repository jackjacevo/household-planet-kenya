type ToastType = 'success' | 'error' | 'info' | 'warning';

interface Toast {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
}

class ToastManager {
  private toasts: Toast[] = [];
  private listeners: ((toasts: Toast[]) => void)[] = [];

  show(type: ToastType, message: string, duration = 3000) {
    const id = Math.random().toString(36).substr(2, 9);
    const toast: Toast = { id, type, message, duration };
    
    this.toasts.push(toast);
    this.notifyListeners();

    if (duration > 0) {
      setTimeout(() => this.remove(id), duration);
    }
  }

  remove(id: string) {
    this.toasts = this.toasts.filter(toast => toast.id !== id);
    this.notifyListeners();
  }

  subscribe(listener: (toasts: Toast[]) => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener([...this.toasts]));
  }
}

export const toast = new ToastManager();

export const showSuccess = (message: string) => toast.show('success', message);
export const showError = (message: string) => toast.show('error', message);
export const showInfo = (message: string) => toast.show('info', message);
export const showWarning = (message: string) => toast.show('warning', message);
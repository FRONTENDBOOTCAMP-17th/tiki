export interface ToastData {
  id: string;
  title?: string;
  description: string;
  variant: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
}

export interface ToastContextValue {
  addToast: (toast: Omit<ToastData, 'id'>) => void;
  removeToast: (id: string) => void;
  success: (message: string, duration?: number) => void;
  error: (message: string, duration?: number) => void;
  warning: (message: string, duration?: number) => void;
  info: (message: string, duration?: number) => void;
}

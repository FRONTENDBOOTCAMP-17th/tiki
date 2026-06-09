export interface ToastData {
  id: string;
  title?: string;
  description: string;
  variant: 'success' | 'error' | 'warning' | 'info';
  isClosing: boolean;
  duration?: number;
}

export interface ToastContextValue {
  addToast: (toast: Omit<ToastData, 'id'>) => void;
  removeToast: (id: string) => void;
  success: (message: string, duration?: number) => void;
  error: (message: string, duration?: number) => void;
  warning: (message: string, duration?: number) => void;
  info: (message: string, duration?: number) => void;
  handleRemove: (id: string) => void;
  position: ToastPosition;
  animation: toastAnimation;
}

export type ToastPosition =
  | 'top-left'
  | 'top-center'
  | 'top-right'
  | 'bottom-left'
  | 'bottom-center'
  | 'bottom-right';

export type toastAnimation = 'slide' | 'fade';

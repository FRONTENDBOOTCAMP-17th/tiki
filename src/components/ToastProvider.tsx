'use client';

import { createContext, useRef, useState } from 'react';
import ToastContainer from './ToastContainer';
import { ToastContextValue, ToastData } from './Toast.types';

export const ToastContext = createContext<ToastContextValue | null>(null);

export default function ToastProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [toasts, setToasts] = useState<ToastData[]>([]);
  const timers = useRef(new Map());

  const addToast = (toast: Omit<ToastData, 'id'>) => {
    const id = crypto.randomUUID();
    setToasts((prev) => [...prev, { ...toast, id }]);

    const timer = setTimeout(() => {
      removeToast(id);
    }, toast.duration ?? 3000);

    timers.current.set(id, timer);
  };

  const removeToast = (id: string) => {
    clearTimeout(timers.current.get(id));
    timers.current.delete(id);
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  const success = (message: string, duration?: number) => {
    addToast({
      description: message,
      variant: 'success',
      duration: duration ?? 4000,
    });
  };

  const error = (message: string, duration?: number) => {
    addToast({
      description: message,
      variant: 'error',
      duration: duration ?? 4000,
    });
  };

  const warning = (message: string, duration?: number) => {
    addToast({
      description: message,
      variant: 'warning',
      duration: duration ?? 4000,
    });
  };

  const info = (message: string, duration?: number) => {
    addToast({
      description: message,
      variant: 'info',
      duration: duration ?? 4000,
    });
  };

  return (
    <ToastContext.Provider
      value={{ addToast, removeToast, success, error, warning, info }}
    >
      {children}
      <ToastContainer toasts={toasts} />
    </ToastContext.Provider>
  );
}

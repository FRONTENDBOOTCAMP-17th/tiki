'use client';

import { createContext, useRef, useState } from 'react';
import ToastContainer from './ToastContainer';
import { ToastContextValue, ToastData, ToastPosition } from './Toast.types';

export const ToastContext = createContext<ToastContextValue | null>(null);

export default function ToastProvider({
  children,
  position = 'bottom-right',
  animation = 'fade',
  maxVisible = 3,
}: {
  children: React.ReactNode;
  position?: ToastPosition;
  animation?: 'slide' | 'fade';
  maxVisible?: number;
}) {
  const [visible, setVisible] = useState<ToastData[]>([]);
  const [queue, setQueue] = useState<ToastData[]>([]);
  const timers = useRef(new Map());

  const addToast = (toast: Omit<ToastData, 'id'>) => {
    const id = crypto.randomUUID();

    if (visible.length < maxVisible) {
      setVisible((prev) => [...prev, { ...toast, id }]);

      const timer = setTimeout(() => {
        setVisible((prev) =>
          prev.map((toast) =>
            toast.id === id ? { ...toast, isClosing: true } : toast,
          ),
        );
      }, toast.duration ?? 3000);

      timers.current.set(id, timer);
    } else {
      setQueue((prev) => [...prev, { ...toast, id }]);
    }
  };

  const removeToast = (id: string) => {
    clearTimeout(timers.current.get(id));
    timers.current.delete(id);
    setVisible((prev) => {
      const filtered = prev.filter((toast) => toast.id !== id);

      if (queue.length === 0) {
        return filtered;
      }

      const [next, ...rest] = queue;
      setQueue(rest);

      const timer = setTimeout(() => {
        setVisible((prev) =>
          prev.map((toast) =>
            toast.id === next.id ? { ...toast, isClosing: true } : toast,
          ),
        );
      }, next.duration ?? 3000);
      timers.current.set(next.id, timer);

      return [...filtered, next];
    });
  };

  const success = (message: string, duration?: number) => {
    addToast({
      description: message,
      variant: 'success',
      duration: duration ?? 4000,
      isClosing: false,
    });
  };

  const error = (message: string, duration?: number) => {
    addToast({
      description: message,
      variant: 'error',
      duration: duration ?? 4000,
      isClosing: false,
    });
  };

  const warning = (message: string, duration?: number) => {
    addToast({
      description: message,
      variant: 'warning',
      duration: duration ?? 4000,
      isClosing: false,
    });
  };

  const info = (message: string, duration?: number) => {
    addToast({
      description: message,
      variant: 'info',
      duration: duration ?? 4000,
      isClosing: false,
    });
  };

  const handleRemove = (id: string) => {
    setVisible((prev) =>
      prev.map((toast) =>
        toast.id === id ? { ...toast, isClosing: true } : toast,
      ),
    );
  };

  return (
    <ToastContext.Provider
      value={{
        addToast,
        removeToast,
        success,
        error,
        warning,
        info,
        handleRemove,
        position,
        animation,
      }}
    >
      {children}
      <ToastContainer toasts={visible} />
    </ToastContext.Provider>
  );
}

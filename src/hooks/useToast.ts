import { useContext } from 'react';
import { ToastContext } from '@/components/ToastProvider';

export default function useToast() {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error(
      'useToast 훅은 ToastProvider 내부에서만 사용할 수 있습니다.',
    );
  }

  return context;
}

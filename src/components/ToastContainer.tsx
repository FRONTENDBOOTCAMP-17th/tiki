'use client';

import { cn } from '@/lib/cn';
import Toast from './Toast';
import { ToastData, ToastPosition } from './Toast.types';
import { toastPositionMap } from './Toast.position';
import useToast from '@/hooks/useToast';

export default function ToastContainer({ toasts }: { toasts: ToastData[] }) {
  const { position } = useToast();
  const displayToasts = [...toasts].reverse();

  const getContainerLayoutStyle = (position: ToastPosition, index: number) => {
    const style: React.CSSProperties = {
      zIndex: displayToasts.length * 10 - index,
    };

    if (position.split('-')[0] === 'top')
      style.transform = `translateY(${index * -10}px) scale(${1 - index * 0.1})`;
    else
      style.transform = `translateY(${index * 10}px) scale(${1 - index * 0.1})`;
    return style;
  };
  return (
    <div className={cn('fixed z-10', toastPositionMap[position])}>
      <div className='relative min-w-100'>
        {displayToasts.map((toast, index) => {
          return (
            <Toast
              style={getContainerLayoutStyle(position, index)}
              key={toast.id}
              id={toast.id}
              title={toast.title}
              description={toast.description}
              variant={toast.variant}
              isClosing={toast.isClosing}
            />
          );
        })}
      </div>
    </div>
  );
}

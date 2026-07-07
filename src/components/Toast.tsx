'use client';

import { VariantProps } from 'class-variance-authority';
import { toastVariants } from './Toast.styles';
import { cn } from '@/lib/cn';
import { X } from 'lucide-react';
import useToast from '@/hooks/useToast';
import { toastAnimationMap } from './Toast.animation';

interface ToastProps extends VariantProps<typeof toastVariants> {
  title?: string;
  description: string;
}

export default function Toast({
  id,
  title,
  description,
  variant,
  isClosing,
  style,
}: ToastProps & {
  id: string;
  isClosing: boolean;
  style?: React.CSSProperties;
}) {
  const { removeToast, handleRemove, position, animation } = useToast();

  return (
    <div className='toast-wrapper absolute transition-all' style={style}>
      <div
        className={cn(
          toastVariants({ variant }),
          animation === 'fade'
            ? toastAnimationMap[animation].in
            : toastAnimationMap[position].in,
          isClosing &&
            (animation === 'fade'
              ? toastAnimationMap[animation].out
              : toastAnimationMap[position].out),
        )}
        onAnimationEnd={() => {
          if (isClosing) {
            removeToast(id);
          }
        }}
      >
        {title && <h3 className='font-bold'>{title}</h3>}
        <p className='pr-6 text-sm font-medium leading-relaxed'>{description}</p>
        <button
          className='absolute top-4 right-4 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-current rounded-md'
          onClick={() => handleRemove(id)}
        >
          <X className='size-4' />
        </button>
      </div>
    </div>
  );
}

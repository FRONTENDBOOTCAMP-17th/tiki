'use client';

import { cn } from '@/lib/cn';
import { Check } from 'lucide-react';

export default function Checkbox({
  checked,
  id,
  className,
  required,
  text,
  onChange,
}: {
  checked: boolean;
  id?: string;
  className?: string;
  required?: boolean;
  text?: string;
  onChange?: () => void;
}) {
  return (
    <label
      htmlFor={id ?? ''}
      className={cn('flex cursor-pointer items-center gap-3', className)}
    >
      <input
        id={id ?? ''}
        type='checkbox'
        checked={checked}
        onChange={() => onChange?.()}
        className='peer sr-only'
      />
      <span
        className={cn(
          'flex size-5 shrink-0 items-center justify-center rounded-md border-2 border-gray-300 text-transparent transition-colors dark:border-surface-5',
          checked &&
            'border-primary-700 bg-primary-700 text-white dark:border-primary-600 dark:bg-primary-600',
        )}
      >
        <Check className='size-3.5' strokeWidth={3} />
      </span>
      {text ? (
        <span className='text-sm text-gray-800 dark:text-gray-100'>{text}</span>
      ) : null}
      {required !== undefined ? (
        <span
          className={cn(
            'ml-auto text-xs font-medium',
            required
              ? 'text-primary-700 dark:text-primary-300'
              : 'text-gray-400 dark:text-gray-500',
          )}
        >
          {required ? '필수' : '선택'}
        </span>
      ) : null}
    </label>
  );
}

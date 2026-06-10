import { useId, type ComponentPropsWithoutRef } from 'react';
import { cn } from '@/lib/cn';

interface InputProps extends ComponentPropsWithoutRef<'input'> {
  label?: string;
  error?: string;
  helperText?: string;
}

export function Input({
  label,
  error,
  helperText,
  id,
  name,
  className,
  ...props
}: InputProps) {
  const autoId = useId();
    const inputId = id ?? name ?? autoId;

    // error/helperText가 있을 때만 연결
    const descId = error || helperText
        ? `${inputId}-desc`
        : undefined;

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={inputId} className="text-sm font-medium text-gray-700">
          {label}
        </label>
      )}

      <input
        id={inputId}
        name={name}
        aria-invalid={!!error}
        aria-describedby={descId}
        className={cn(
          'h-11 w-full rounded-lg border bg-white px-3 text-sm text-gray-900 outline-none transition',
          'placeholder:text-gray-400',
          'border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200',
          'disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-400',
          error && 'border-red-400 focus:border-red-500 focus:ring-red-200', // 에러가 포커스보다 우선
          className,
        )}
        {...props}
      />

      {/* 에러 우선, 없으면 helperText */}
      {descId && (
        <span id={descId} className={cn('text-xs', error ? 'text-red-500' : 'text-gray-400')}>
          {error ?? helperText}
        </span>
      )}
    </div>
  );
}
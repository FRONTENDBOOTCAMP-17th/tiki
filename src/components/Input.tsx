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
        <label
          htmlFor={inputId}
          className="text-sm font-medium text-gray-700 dark:text-gray-200"
        >
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
          'placeholder:text-gray-400 dark:bg-[#2a2b2f] dark:text-gray-50 dark:placeholder:text-gray-500',
          'border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 dark:border-gray-700 dark:focus:border-gray-400 dark:focus:ring-gray-700',
          'disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-400 dark:disabled:bg-gray-800 dark:disabled:text-gray-500',
          error && 'border-red-400 focus:border-red-500 focus:ring-red-200', // 에러가 포커스보다 우선
          className,
        )}
        {...props}
      />

      {/* 에러 우선, 없으면 helperText */}
      {descId && (
        <span
          id={descId}
          className={cn(
            'text-xs',
            error ? 'text-red-500 dark:text-red-300' : 'text-gray-400 dark:text-gray-500',
          )}
        >
          {error ?? helperText}
        </span>
      )}
    </div>
  );
}

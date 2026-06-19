'use client';

import { cn } from '@/lib/cn';
import { CheckIcon } from 'lucide-react';

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
    <div className={cn('flex gap-2 items-center px-4', className)}>
      <input
        id={id ?? ''}
        type='checkbox'
        className='appearance-none'
        onClick={() => {
          if (onChange) {
            onChange();
          }
        }}
      />
      <CheckIcon
        className={cn(
          'cursor-pointer text-transparent border-2 rounded-md border-primary-800',
          checked && 'bg-primary-700 text-white',
        )}
        onClick={() => onChange?.()}
      />
      {text ? (
        <label htmlFor={id ?? ''} className='text-md align-top'>
          {text}
        </label>
      ) : (
        ''
      )}
      {required !== undefined ? (
        required ? (
          <span className='text-primary-800 font-semibold'>(필수)</span>
        ) : (
          <span className='text-gray-400 font-semibold'>(선택)</span>
        )
      ) : (
        ''
      )}
    </div>
  );
}

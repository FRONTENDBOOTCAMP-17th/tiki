import { ComponentPropsWithRef } from 'react';
import { VariantProps } from 'class-variance-authority';
import { buttonVariants } from './Button.styles';
import { cn } from '@/lib/cn';

interface ButtonProps
  extends ComponentPropsWithRef<'button'>, VariantProps<typeof buttonVariants> {
  loading?: boolean;
}

export default function Button({
  ref,
  children,
  className,
  variant,
  size,
  fullWidth,
  loading = false,
  disabled,
  type = 'button',
  ...props
}: ButtonProps) {
  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled || loading}
      aria-busy={loading}
      className={cn(buttonVariants({ variant, size, fullWidth }), className)}
      {...props}
    >
      {loading && (
        <div className='size-4 animate-spin border-2 border-current border-t-transparent rounded-full'></div>
      )}
      {children}
    </button>
  );
}

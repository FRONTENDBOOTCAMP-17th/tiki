import { cva } from 'class-variance-authority';

export const spinnerVariants = cva(
  ['animate-spin rounded-full border-4 border-current border-t-transparent'],
  {
    variants: {
      size: {
        sm: 'size-4',
        md: 'size-6',
        lg: 'size-8',
        xl: 'size-10',
      },
      color: {
        primary: 'text-primary-700',
        secondary: 'text-secondary-700',
        danger: 'text-danger-700',
        accent: 'text-accent-700',
      },
    },
    defaultVariants: {
      size: 'md',
      color: 'primary',
    },
  },
);

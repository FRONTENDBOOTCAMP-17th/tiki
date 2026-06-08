import { cva } from 'class-variance-authority';

export const buttonVariants = cva(
  [
    'inline-flex items-center justify-center gap-2',
    'py-4 rounded-md font-medium',
    'transition-colors duration-200',
    'focus-visible:outline-none focus-visible:ring-2',
    'disabled:opacity-50 disabled:pointer-events-none',
  ],
  {
    variants: {
      variant: {
        primary: 'bg-primary-700 text-white hover:bg-primary-800',
        secondary: 'bg-secondary-700 text-white hover:bg-secondary-800',
        danger: 'bg-danger-700 text-white hover:bg-danger-800',
        accent: 'bg-accent-700 text-white hover:bg-accent-800',
        outline:
          'border border-gray-300 text-white hover:text-gray-700 hover:bg-gray-100',
        outlinePrimary:
          'border border-primary-300 text-primary-700 hover:bg-primary-100',
        outlineSecondary:
          'border border-secondary-300 text-secondary-700 hover:bg-secondary-200',
        outlineDanger:
          'border border-danger-300 text-danger-700 hover:bg-danger-200',
        outlineAccent:
          'border border-accent-300 text-accent-700 hover:bg-accent-200',
      },
      size: {
        sm: 'h-8 px-3 text-sm',
        md: 'h-10 px-4',
        lg: 'h-12 px-6 text-lg',
      },
      fullWidth: {
        true: 'w-full',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  },
);

import { cva } from 'class-variance-authority';

export const toastVariants = cva(['rounded-md p-4 shadow-md relative'], {
  variants: {
    variant: {
      success: 'bg-green-100 text-green-800',
      error: 'bg-red-100 text-red-800',
      warning: 'bg-yellow-100 text-yellow-800',
      info: 'bg-blue-100 text-blue-800',
    },
  },
  defaultVariants: {
    variant: 'info',
  },
});

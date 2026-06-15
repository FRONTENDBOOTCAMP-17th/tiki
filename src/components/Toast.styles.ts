import { cva } from 'class-variance-authority';

export const toastVariants = cva(
  ['min-w-100 min-h-20 rounded-md p-4 shadow-md relative transition-all'],
  {
    variants: {
      variant: {
        success: 'bg-[#E1F5EE] text-[#0F6E56]',
        error: 'bg-[#FCE6EF] text-[#B23A6E]',
        warning: 'bg-[#FAEEDA] text-[#854F0B]',
        info: 'bg-[#E2EEFB] text-[#3A6BA5]',
      },
    },
    defaultVariants: {
      variant: 'info',
    },
  },
);

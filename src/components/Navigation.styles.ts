import { cva } from 'class-variance-authority';

export const navItem = cva(
  'flex flex-col items-center justify-center gap-1.5 h-full text-[13px]',
  {
    variants: {
      active: {
        true: 'text-primary-700',
        false: 'text-gray-600',
      },
    },
    defaultVariants: {
      active: false,
    },
  },
);

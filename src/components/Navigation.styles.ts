import { cva } from 'class-variance-authority';

export const navItem = cva(
  'flex w-full flex-col items-center justify-center gap-1.5 h-full text-[13px]',
  {
    variants: {
      active: {
        true: 'text-primary-700 dark:text-white',
        false: 'text-gray-600 dark:text-gray-400',
      },
    },
    defaultVariants: {
      active: false,
    },
  },
);

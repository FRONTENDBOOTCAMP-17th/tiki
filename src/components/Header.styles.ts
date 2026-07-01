import { cva } from "class-variance-authority";

export const categoryItem = cva(
  "whitespace-nowrap text-sm transition-colors",
  {
    variants: {
      active: {
        true: "font-semibold text-primary-800 dark:text-white",
        false:
          "text-primary-600 hover:text-primary-800 dark:text-gray-300 dark:hover:text-white",
      },
    },
    defaultVariants: {
      active: false,
    },
  },
);

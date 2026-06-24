import { cva } from "class-variance-authority";

export const categoryItem = cva(
  "whitespace-nowrap text-sm transition-colors",
  {
    variants: {
      active: {
        true: "font-semibold text-primary-800",
        false: "text-primary-600 hover:text-primary-800",
      },
    },
    defaultVariants: {
      active: false,
    },
  },
);

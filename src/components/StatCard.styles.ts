import { cva } from "class-variance-authority";

export const statIconVariants = cva(
  "flex size-11 shrink-0 items-center justify-center rounded-xl",
  {
    variants: {
      tone: {
        primary: "bg-primary-100 text-primary-800 dark:bg-[#34363a] dark:text-gray-100",
        secondary: "bg-secondary-200 text-secondary-800 dark:bg-[#34363a] dark:text-gray-100",
        accent: "bg-accent-200 text-accent-800 dark:bg-[#34363a] dark:text-gray-100",
        danger: "bg-danger-100 text-danger-700",
        neutral: "bg-whisper text-mirage dark:bg-[#34363a] dark:text-gray-100",
      },
    },
    defaultVariants: {
      tone: "primary",
    },
  },
);

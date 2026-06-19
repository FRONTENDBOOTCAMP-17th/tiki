import { cva } from "class-variance-authority";

export const statIconVariants = cva(
  "flex size-11 shrink-0 items-center justify-center rounded-xl",
  {
    variants: {
      tone: {
        primary: "bg-primary-100 text-primary-800",
        secondary: "bg-secondary-200 text-secondary-800",
        accent: "bg-accent-200 text-accent-800",
        danger: "bg-danger-100 text-danger-700",
        neutral: "bg-whisper text-mirage",
      },
    },
    defaultVariants: {
      tone: "primary",
    },
  },
);

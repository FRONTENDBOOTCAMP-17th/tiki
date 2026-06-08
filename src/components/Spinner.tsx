import { VariantProps } from 'class-variance-authority';
import { spinnerVariants } from './Spinner.styles';
import { cn } from '@/lib/cn';

interface SpinnerProps extends VariantProps<typeof spinnerVariants> {
  className?: string;
}
export default function Spinner({ className, size, color }: SpinnerProps) {
  return (
    <div className={cn(spinnerVariants({ size, color }), className)}></div>
  );
}

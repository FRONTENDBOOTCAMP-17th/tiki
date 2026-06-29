import { cn } from "@/lib/cn";
import ReviewStars from "./ReviewStars";

interface ReviewRatingProps {
  rating: number;
  size?: "sm" | "md" | "lg";
  className?: string;
  scoreClassName?: string;
  showScore?: boolean;
}

export default function ReviewRating({
  rating,
  size = "sm",
  className,
  scoreClassName,
  showScore = true,
}: ReviewRatingProps) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <ReviewStars rating={rating} size={size} />
      {showScore && (
        <span className={cn("text-xs font-semibold text-gray-500", scoreClassName)}>
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  );
}

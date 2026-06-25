import { Star } from "lucide-react";

import { cn } from "@/lib/cn";

interface ReviewStarsProps {
  rating: number;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeClass = {
  sm: "h-3.5 w-3.5",
  md: "h-4 w-4",
  lg: "h-5 w-5",
};

export default function ReviewStars({
  rating,
  size = "sm",
  className,
}: ReviewStarsProps) {
  return (
    <div className={cn("flex items-center gap-0.5", className)}>
      {[1, 2, 3, 4, 5].map((value) => (
        <Star
          key={value}
          className={cn(
            sizeClass[size],
            value <= Math.round(rating)
              ? "fill-yellow-400 text-yellow-400"
              : "fill-gray-100 text-gray-200",
          )}
        />
      ))}
    </div>
  );
}

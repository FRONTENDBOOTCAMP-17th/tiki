"use client";

import { useState } from "react";
import { Star } from "lucide-react";

import { cn } from "@/lib/cn";
import { REVIEW_RATINGS } from "@/lib/reviews/validation";

interface RatingInputProps {
  value: number;
  onChange: (value: number) => void;
  disabled?: boolean;
  onDisabledSelect?: () => void;
  size?: "sm" | "md";
}

const starSize = {
  sm: "h-5 w-5",
  md: "h-6 w-6",
};

export default function RatingInput({
  value,
  onChange,
  disabled = false,
  onDisabledSelect,
  size = "md",
}: RatingInputProps) {
  const [hovered, setHovered] = useState(0);
  const activeValue = hovered || value;

  return (
    <div className="flex items-center gap-0.5">
      {REVIEW_RATINGS.map((rating) => (
        <button
          key={rating}
          type="button"
          aria-label={`${rating}점`}
          aria-disabled={disabled}
          onClick={() => {
            if (disabled) {
              onDisabledSelect?.();
              return;
            }
            onChange(rating);
          }}
          onMouseEnter={() => setHovered(rating)}
          onMouseLeave={() => setHovered(0)}
          className="rounded-sm transition-transform hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-200"
        >
          <Star
            className={cn(
              starSize[size],
              "transition-colors",
              activeValue >= rating
                ? "fill-yellow-400 text-yellow-400"
                : "fill-gray-100 text-gray-300",
            )}
          />
        </button>
      ))}
    </div>
  );
}

"use client";

import { useState, useTransition } from "react";
import { Heart } from "lucide-react";

import { cn } from "@/lib/cn";
import { toggleReviewLikeAction } from "@/lib/reviews/actions";

interface ReviewLikeButtonProps {
  eventId: string;
  reviewId: string;
  initialLiked: boolean;
  initialCount: number;
  disabled?: boolean;
}

export default function ReviewLikeButton({
  eventId,
  reviewId,
  initialLiked,
  initialCount,
  disabled = false,
}: ReviewLikeButtonProps) {
  const [liked, setLiked] = useState(initialLiked);
  const [count, setCount] = useState(initialCount);
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    if (disabled) {
      setMessage("로그인 후 좋아요를 누를 수 있습니다.");
      return;
    }

    const nextLiked = !liked;
    const nextCount = Math.max(0, count + (nextLiked ? 1 : -1));
    setLiked(nextLiked);
    setCount(nextCount);
    setMessage("");

    startTransition(async () => {
      const result = await toggleReviewLikeAction({
        eventId,
        reviewId,
        liked,
      });

      if (!result.success) {
        setLiked(liked);
        setCount(count);
        setMessage(result.message);
        return;
      }

      setLiked(result.liked);
      setCount(result.likeCount);
    });
  }

  return (
    <div className="relative flex items-center">
      <button
        type="button"
        aria-pressed={liked}
        disabled={isPending}
        onClick={handleClick}
        className={cn(
          "inline-flex items-center gap-1 text-xs font-medium text-gray-400 transition-colors hover:text-primary-700 disabled:opacity-60",
          liked && "text-primary-700",
        )}
      >
        <Heart
          className={cn(
            "h-3.5 w-3.5",
            liked ? "fill-primary-700 text-primary-700" : "text-gray-400",
          )}
        />
        {count.toLocaleString()}
      </button>
      {message && (
        <span className="absolute right-0 top-5 whitespace-nowrap text-xs text-danger-500">
          {message}
        </span>
      )}
    </div>
  );
}

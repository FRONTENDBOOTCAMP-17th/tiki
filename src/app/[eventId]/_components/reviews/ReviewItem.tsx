import Avatar from "@/components/Avatar";
import { formatDotDate } from "@/lib/format";
import type { Review } from "@/types/domain/event";
import ReviewStars from "@/components/reviews/ReviewStars";
import ReviewEditableItem from "./ReviewEditableItem";
import ReviewLikeButton from "./ReviewLikeButton";

export default function ReviewItem({
  eventId,
  review,
  isMine,
  canLike,
}: {
  eventId: string;
  review: Review;
  isMine: boolean;
  canLike: boolean;
}) {
  if (isMine) {
    return (
      <ReviewEditableItem eventId={eventId} review={review} canLike={canLike} />
    );
  }

  return (
    <li className="py-5">
      <div className="flex items-start gap-3">
        <Avatar seed={review.userName} className="size-9 text-sm" />
        <div className="min-w-0 flex-1">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <span className="font-semibold text-gray-900">
                {review.userName}
              </span>
              <span className="text-xs text-gray-400">
                {formatDotDate(review.createdAt)}
              </span>
            </div>
            <ReviewLikeButton
              eventId={eventId}
              reviewId={review.reviewId}
              initialLiked={review.likedByMe}
              initialCount={review.likeCount}
              disabled={!canLike}
            />
          </div>
          <div className="mt-1 flex items-center gap-2">
            <ReviewStars rating={review.rating} />
            <span className="text-xs font-semibold text-gray-500">
              {review.rating.toFixed(1)}
            </span>
          </div>
          <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-gray-700">
            {review.memo}
          </p>
        </div>
      </div>
    </li>
  );
}

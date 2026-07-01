import { formatDotDate } from "@/lib/format";
import type { Review } from "@/types/domain/event";
import ReviewAuthor from "@/components/reviews/ReviewAuthor";
import ReviewBody from "@/components/reviews/ReviewBody";
import ReviewRating from "@/components/reviews/ReviewRating";
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
        <ReviewAuthor
          name={review.userName}
          className="items-start gap-3"
          showName={false}
        />
        <div className="min-w-0 flex-1">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <ReviewAuthor name={review.userName} showAvatar={false} />
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
          <ReviewRating rating={review.rating} className="mt-1" />
          <ReviewBody className="mt-3">{review.memo}</ReviewBody>
        </div>
      </div>
    </li>
  );
}

import type { Review } from "@/types/domain/event";
import ReviewItem from "./ReviewItem";
import ReviewSortFilter from "./ReviewSortFilter";
import {
  getReviewSortDirection,
  getReviewSortKey,
  sortReviews,
} from "./reviewSort";

interface ReviewSectionProps {
  eventId: string;
  rating: number;
  reviewCount: number;
  reviews: Review[];
  currentUserId?: string | null;
  sortKey?: string | null;
  sortDirection?: string | null;
}

const LABEL_BY_RATING: Record<number, string> = {
  5: "최고예요",
  4: "좋아요",
  3: "보통이에요",
  2: "아쉬워요",
  1: "별로예요",
};

export default function ReviewSection({
  eventId,
  rating,
  reviewCount,
  reviews,
  currentUserId,
  sortKey,
  sortDirection,
}: ReviewSectionProps) {
  const activeSortKey = getReviewSortKey(sortKey);
  const activeSortDirection = getReviewSortDirection(sortDirection);
  const sortedReviews = sortReviews(
    reviews,
    activeSortKey,
    activeSortDirection,
  );
  const distribution = [5, 4, 3, 2, 1].map((score) => {
    const count = reviews.filter((review) => review.rating === score).length;
    const percent =
      reviewCount > 0 ? Math.round((count / reviewCount) * 100) : 0;

    return {
      score,
      count,
      percent,
      label: LABEL_BY_RATING[score],
    };
  });

  return (
    <section className="flex flex-col gap-5">
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-surface-3 dark:bg-surface-1">
        <div className="grid gap-6 md:grid-cols-[200px_minmax(0,1fr)] md:items-center">
          <div>
            <p className="text-sm font-semibold text-gray-500">관람 후기</p>
            <div className="mt-2 flex items-end gap-2">
              <span className="text-4xl font-bold leading-none text-gray-950">
                {rating.toFixed(1)}
              </span>
              <span className="pb-1 text-sm font-medium text-gray-400">
                / 5
              </span>
            </div>
            <p className="mt-2 text-sm text-gray-500">
              후기 {reviewCount.toLocaleString()}개
            </p>
          </div>

          <div className="flex flex-col gap-2.5">
            {distribution.map((item) => (
              <div
                key={item.score}
                className="grid grid-cols-[4.5rem_minmax(0,1fr)_2.5rem] items-center gap-5 text-sm"
              >
                <span className="font-medium text-gray-600">{item.label}</span>
                <div className="h-2 overflow-hidden rounded-full bg-gray-100 dark:bg-surface-3">
                  <div
                    className="h-full rounded-full bg-primary-700"
                    style={{ width: `${item.percent}%` }}
                  />
                </div>
                <span className="text-right text-xs font-medium text-gray-400">
                  {item.count}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {reviews.length === 0 ? (
        <div className="px-1 py-6 text-center">
          <p className="text-sm font-medium text-gray-500">
            아직 등록된 후기가 없습니다.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          <div className="flex justify-end">
            <ReviewSortFilter />
          </div>
          <ul className="divide-y divide-gray-100 dark:divide-surface-3">
            {sortedReviews.map((review) => (
              <ReviewItem
                key={review.reviewId}
                eventId={eventId}
                review={review}
                isMine={!!currentUserId && review.userId === currentUserId}
                canLike={!!currentUserId}
              />
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}

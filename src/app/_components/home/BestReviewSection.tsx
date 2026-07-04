import { Heart } from "lucide-react";
import Link from "next/link";
import ReviewAuthor from "@/components/reviews/ReviewAuthor";
import ReviewBody from "@/components/reviews/ReviewBody";
import ReviewRating from "@/components/reviews/ReviewRating";
import ThumbnailImage from "./ThumbnailImage";
import type { BestReviewItem } from "./types";

export default function BestReviewSection({
  reviews,
}: {
  reviews: BestReviewItem[];
}) {
  if (reviews.length === 0) return null;

  return (
    <section className="bg-gray-50 px-4 py-8 transition-colors md:px-8 lg:px-16 dark:bg-surface-0">
      <div className="mx-auto w-full max-w-7xl">
        <h2 className="mb-4 text-lg font-bold tracking-tight text-gray-950 md:text-xl dark:text-gray-50">
          베스트 리뷰
        </h2>
        <ul className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {reviews.map((review) => (
            <li key={review.reviewId}>
              <Link
                href={`/${review.eventId}#reviews`}
                className="group flex h-full gap-4 rounded-xl border border-gray-200 bg-white p-4 transition duration-200 hover:-translate-y-1 hover:scale-[1.01] hover:border-primary-300 hover:shadow-sm dark:border-surface-3 dark:bg-surface-1 dark:hover:border-gray-500"
              >
                <div className="relative aspect-3/4 w-20 shrink-0 overflow-hidden rounded-lg bg-primary-100 shadow-sm dark:bg-surface-4">
                  <ThumbnailImage
                    src={review.eventThumbnail}
                    alt={review.eventTitle}
                    sizes="80px"
                    className="object-cover"
                  />
                </div>

                <div className="flex min-w-0 flex-1 flex-col">
                  <p className="truncate text-sm font-semibold text-gray-900 dark:text-gray-50">
                    {review.eventTitle}
                  </p>
                  <ReviewRating
                    rating={review.rating}
                    size="sm"
                    className="mt-1 gap-1.5"
                    scoreClassName="font-medium"
                  />
                  <ReviewBody className="mt-3 line-clamp-3 whitespace-normal">
                    {review.memo}
                  </ReviewBody>

                  <div className="mt-auto flex items-center justify-between pt-4">
                    <ReviewAuthor
                      name={review.author}
                      avatarClassName="size-7 text-xs"
                      nameClassName="text-xs font-medium text-gray-500"
                    />
                    <span className="flex items-center gap-1 text-xs font-medium text-gray-400">
                      <Heart className="size-3.5" />
                      {review.likeCount}
                    </span>
                  </div>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

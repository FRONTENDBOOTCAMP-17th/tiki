import type { SortDirection, SortFilterOption } from "@/components/SortFilter";
import type { Review } from "@/types/domain/event";

export const REVIEW_SORT_OPTIONS = [
  { key: "likes", label: "좋아요" },
  { key: "created", label: "작성일" },
] as const satisfies readonly SortFilterOption<string>[];

export type ReviewSortKey = (typeof REVIEW_SORT_OPTIONS)[number]["key"];

export const DEFAULT_REVIEW_SORT: ReviewSortKey = "likes";
export const DEFAULT_REVIEW_DIRECTION: SortDirection = "desc";

export function getReviewSortKey(value?: string | null): ReviewSortKey {
  return REVIEW_SORT_OPTIONS.some((option) => option.key === value)
    ? (value as ReviewSortKey)
    : DEFAULT_REVIEW_SORT;
}

export function getReviewSortDirection(
  value?: string | null,
): SortDirection {
  return value === "asc" ? "asc" : DEFAULT_REVIEW_DIRECTION;
}

export function sortReviews(
  reviews: Review[],
  sortKey: ReviewSortKey,
  direction: SortDirection,
) {
  return [...reviews].sort((a, b) => {
    const multiplier = direction === "asc" ? 1 : -1;

    if (sortKey === "likes") {
      return (a.likeCount - b.likeCount) * multiplier;
    }

    return (+new Date(a.createdAt) - +new Date(b.createdAt)) * multiplier;
  });
}

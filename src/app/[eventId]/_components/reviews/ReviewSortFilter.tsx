"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

import SortFilter from "@/components/SortFilter";
import {
  DEFAULT_REVIEW_DIRECTION,
  DEFAULT_REVIEW_SORT,
  getReviewSortDirection,
  getReviewSortKey,
  REVIEW_SORT_OPTIONS,
  type ReviewSortKey,
} from "./reviewSort";

export default function ReviewSortFilter() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const value = getReviewSortKey(searchParams.get("reviewSort"));
  const direction = getReviewSortDirection(searchParams.get("reviewDirection"));

  function handleChange(next: ReviewSortKey) {
    const params = new URLSearchParams(searchParams);
    const nextDirection =
      next === value && direction === "desc" ? "asc" : "desc";

    if (next === DEFAULT_REVIEW_SORT) {
      params.delete("reviewSort");
    } else {
      params.set("reviewSort", next);
    }

    if (nextDirection === DEFAULT_REVIEW_DIRECTION) {
      params.delete("reviewDirection");
    } else {
      params.set("reviewDirection", nextDirection);
    }

    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, {
      scroll: false,
    });
  }

  return (
    <SortFilter
      options={[...REVIEW_SORT_OPTIONS]}
      value={value}
      direction={direction}
      onChange={handleChange}
    />
  );
}

import { Review } from "@/types/domain/event";

/** 이벤트별 리뷰 목록 집계 (서버 컴포넌트에서 getReviews 가 반환) */
export interface ReviewListData {
  averageRating: number;
  totalCount: number;
  reviews: Review[];
  page: number;
  limit: number;
}

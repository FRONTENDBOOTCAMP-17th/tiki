import { ApiResponse } from './common';
import { EventDetail, Slot, Review } from '@/types/domain/event';

/** EVENT-02 이벤트 상세 조회 */
export type EventDetailResponse = ApiResponse<EventDetail>;

/** SLOT-01 이벤트별 회차 목록 */
export interface SlotListData {
  slots: Slot[];
}
export type SlotListResponse = ApiResponse<SlotListData>;

/** REVIEW-04 이벤트별 리뷰 목록 */
export interface ReviewListData {
  averageRating: number;
  totalCount: number;
  reviews: Review[];
  page: number;
  limit: number;
}
export type ReviewListResponse = ApiResponse<ReviewListData>;

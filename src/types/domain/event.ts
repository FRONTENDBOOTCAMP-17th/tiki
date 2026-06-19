/** 장소 (EVENT-02: venue) */
export interface Venue {
  address: string; // 기본주소
  detailAddress: string; // 상세주소
}

/** 판매자 요약 (EVENT-02: seller) — store_name 은 seller_profiles 기준 */
export interface EventSeller {
  sellerId: string;
  storeName: string;
}

/** 이벤트 상세 (EVENT-02 data) */
export interface EventDetail {
  eventId: string;
  title: string;
  category: string; // 표시용 이름 ("콘서트")
  description: string;
  images: string[]; // 썸네일 + 설명용 다중 이미지
  venue: Venue;
  seller: EventSeller;
  duration: number; // 공연 시간(분)
  intermission: number; // 인터미션(분)
  startDate: string; // event.start_date "2026-06-14"
  endDate: string; // event.end_date "2026-06-21"
  status: string; // event.status — "closed" = 마감(매진)
  rating: number; // 평균 평점 (review 테이블 미생성 → 현재 mock)
  reviewCount: number; // (review 테이블 미생성 → 현재 mock)
  isBookmarked: boolean; // (bookmark 테이블 미생성 → 현재 mock)
}

/** 회차 (slot 테이블) — 좌석/등급 없이 회차 선택까지만 사용 */
export interface Slot {
  slotId: string;
  eventId: string;
  date: string; // "2026-06-14"
  startTime: string; // "19:00"
  endTime: string; // "21:30"
  isClosed: boolean; // 마감 여부 (좌석 재고 미사용)
}

/** 좌석 등급 (ticket_grade 테이블) — 이벤트 단위, 잔여 수량 보유 */
export interface Grade {
  gradeId: string;
  eventId: string; // ticket_grade.event_id (슬롯 아닌 이벤트 단위)
  name: string; // ticket_grade.grade_name ("일반석", "VIP석")
  price: number;
  quantity: number; // 잔여 수량 (0 이면 매진)
}

/** 관람 후기 (REVIEW-04 reviews[]) */
export interface Review {
  reviewId: string;
  userName: string;
  userProfileImage: string;
  rating: number;
  memo: string;
  createdAt: string;
}

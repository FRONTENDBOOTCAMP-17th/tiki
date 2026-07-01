export const ORDER_STATUS = {
  ORDERED: "ordered",
  PAID: "paid",
  CANCELLED: "cancelled",
  FAILED: "failed",
} as const;

export type OrderStatus = (typeof ORDER_STATUS)[keyof typeof ORDER_STATUS];

// 수량 기반·좌석 기반 두 경로 모두 동일한 상한을 적용하기 위해 한 곳에서 관리.
// RPC(place_seat_order)의 array_length 상한과도 반드시 일치시킬 것.
export const MAX_TICKETS_PER_ORDER = 8;

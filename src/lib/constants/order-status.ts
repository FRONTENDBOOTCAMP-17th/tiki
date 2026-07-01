export const ORDER_STATUS = {
  ORDERED: "ordered",
  PAID: "paid",
  CANCELLED: "cancelled",
  FAILED: "failed",
} as const;

export type OrderStatus = (typeof ORDER_STATUS)[keyof typeof ORDER_STATUS];

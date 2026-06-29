export const SERVICE_FEE_RATE = 0.05;

export interface OrderStat {
  totalOrders: number;
  totalRevenue: number;
}

interface OrderRow {
  event_id: string;
  quantity: number;
  total_price: number;
}

interface CapacityRow {
  event_id: string;
  quantity: number;
}

export function sumOrdersByEvent(orders: OrderRow[]): Map<string, OrderStat> {
  const map = new Map<string, OrderStat>();

  for (const order of orders) {
    const current = map.get(order.event_id) ?? {
      totalOrders: 0,
      totalRevenue: 0,
    };
    current.totalOrders += order.quantity;
    current.totalRevenue += order.total_price;
    map.set(order.event_id, current);
  }

  return map;
}

export function sumCapacityByEvent(grades: CapacityRow[]): Map<string, number> {
  const map = new Map<string, number>();

  for (const grade of grades) {
    map.set(grade.event_id, (map.get(grade.event_id) ?? 0) + grade.quantity);
  }

  return map;
}

export function isCancelled(status: string | null | undefined) {
  if (!status) return false;
  const value = status.toLowerCase();
  return (
    value.includes("취소") ||
    value.includes("cancel") ||
    value === "failed" ||
    value === "refunded" ||
    value === "expired"
  );
}

// 통계/매출에 잡히는 "예매 확정"은 결제까지 끝난 주문만이다.
// 결제 대기(ordered)는 아직 돈이 들어온 게 아니라서 예매로 집계하면 안 된다.
export function isBooked(status: string | null | undefined) {
  return status === "paid";
}

export function orderStatusLabel(status: string | null | undefined) {
  if (isCancelled(status)) return "취소";
  if (status === "paid") return "예매";
  return "결제대기";
}

export function serviceFee(amount: number) {
  return Math.round(amount * SERVICE_FEE_RATE);
}

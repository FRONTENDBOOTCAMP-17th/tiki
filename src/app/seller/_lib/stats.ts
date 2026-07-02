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

// "YYYY-MM" 시작~끝(양끝 포함) 사이의 모든 월을 배열로 반환한다.
// 정산 신청 범위 안에 어떤 월들이 포함되는지 계산할 때 쓴다.
export function monthsInRange(start: string, end: string): string[] {
  const result: string[] = [];
  const [sy, sm] = start.split("-").map(Number);
  const [ey, em] = end.split("-").map(Number);
  if (!sy || !sm || !ey || !em) return result;

  let year = sy;
  let month = sm;
  while (year < ey || (year === ey && month <= em)) {
    result.push(`${year}-${String(month).padStart(2, "0")}`);
    month += 1;
    if (month > 12) {
      month = 1;
      year += 1;
    }
  }
  return result;
}

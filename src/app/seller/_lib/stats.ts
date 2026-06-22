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
    value === "refunded" ||
    value === "expired"
  );
}

export function orderStatusLabel(status: string | null | undefined) {
  if (!status) return "결제됨";

  const value = status.toLowerCase();
  if (isCancelled(status)) return "취소됨";
  if (value.includes("pending") || status.includes("대기")) return "결제 대기";
  if (value === "paid" || status.includes("완료")) return "결제됨";
  if (value === "draft") return "주문 생성";
  if (value === "failed") return "결제 실패";
  if (value === "entered") return "입장 완료";
  if (value === "shared") return "공유됨";

  return status;
}

export function serviceFee(amount: number) {
  return Math.round(amount * SERVICE_FEE_RATE);
}

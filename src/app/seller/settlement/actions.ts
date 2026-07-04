"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { todayKST } from "@/lib/date";
import { isBooked, monthsInRange, serviceFee } from "../_lib/stats";

// 판매자 정산 신청
// 아직 정산 신청되지 않은 달(paid 매출이 있는 지난달까지) 전체를 한 건으로 묶어
// settlement_request 1행을 생성한다. 이번 달은 아직 정산 대상이 아니다.
export async function requestSettlement() {
  const user = await requireUser();
  const supabase = await createClient();

  const currentMonth = todayKST().slice(0, 7); // "YYYY-MM"

  // 판매자 이벤트
  const { data: eventRows } = await supabase
    .from("event")
    .select("event_id")
    .eq("seller_id", user.id);

  const eventIds = (eventRows ?? []).map((e) => e.event_id);
  if (eventIds.length === 0) {
    return { error: "신청할 정산 내역이 없습니다" };
  }

  // paid 주문의 월별 매출 합계 (이번 달 이전만)
  const { data: orderRows } = await supabase
    .from("orders")
    .select("total_price, status, created_at")
    .in("event_id", eventIds);

  const monthlyGross = new Map<string, number>();
  for (const order of orderRows ?? []) {
    if (!isBooked(order.status)) continue;
    const month = (order.created_at ?? "").slice(0, 7);
    if (!month || month >= currentMonth) continue; // 이번 달은 정산 대상 아님
    monthlyGross.set(month, (monthlyGross.get(month) ?? 0) + order.total_price);
  }

  // 이미 신청/승인된 달 집합
  const { data: existing } = await supabase
    .from("settlement_request")
    .select("period_start, period_end")
    .eq("seller_id", user.id);

  const covered = new Set<string>();
  for (const req of existing ?? []) {
    for (const month of monthsInRange(req.period_start, req.period_end)) {
      covered.add(month);
    }
  }

  // 아직 정산 신청 안 된 달
  const uncovered = [...monthlyGross.keys()]
    .filter((month) => !covered.has(month))
    .sort();

  if (uncovered.length === 0) {
    return { error: "신청할 정산 내역이 없습니다" };
  }

  const gross = uncovered.reduce(
    (sum, month) => sum + (monthlyGross.get(month) ?? 0),
    0,
  );
  const fee = serviceFee(gross);

  const { error } = await supabase.from("settlement_request").insert({
    seller_id: user.id,
    period_start: uncovered[0],
    period_end: uncovered[uncovered.length - 1],
    gross,
    fee,
    net: gross - fee,
  });

  if (error) {
    if (error.code === "23505") {
      return { error: "이미 신청된 기간입니다" };
    }

    return { error: error.message };
  }

  revalidatePath("/seller/settlement");
  return { success: true, count: uncovered.length };
}

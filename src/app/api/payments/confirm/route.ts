import { NextRequest } from "next/server";
import { fail, success } from "@/lib/api/api-response";
import { createClient } from "@/lib/supabase/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { portone } from "@/lib/portone/server";

interface ConfirmRequestBody {
  orderId?: string;
}

// 결제창에서 돌아온 뒤, 클라이언트 응답을 그대로 믿지 않고
// 포트원에 직접 조회해서 결제 상태/금액을 검증한 다음에만 주문을 "paid"로 처리한다.
export async function POST(req: NextRequest) {
  const { orderId } = (await req.json()) as ConfirmRequestBody;
  if (!orderId) return fail("invalid request", 400);

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return fail("unauthorized", 401);

  // 결제 paymentId로 order_id를 그대로 사용하므로, 본인 주문인지만 확인하면 된다.
  const { data: order } = await supabase
    .from("orders")
    .select("order_id, status, total_price")
    .eq("order_id", orderId)
    .eq("user_id", user.id)
    .maybeSingle();
  if (!order) return fail("order not found", 404);

  // 이미 승인 처리된 주문이면 재조회 없이 그대로 성공 응답
  if (order.status === "paid") return success({ status: "paid" });

  let payment;
  try {
    payment = await portone.getPayment({ paymentId: orderId });
  } catch (error) {
    console.error("[PAY-01] portone.getPayment failed:", error);
    return fail("결제 정보를 확인할 수 없습니다.", 502);
  }

  const isPaid =
    payment.status === "PAID" && payment.amount.total === order.total_price;

  const admin = getSupabaseAdmin();

  const { data: updatedOrder, error: updateError } = await admin
    .from("orders")
    .update({ status: isPaid ? "paid" : "failed" })
    .eq("order_id", orderId)
    .select("order_id")
    .single();

  if (updateError || !updatedOrder) {
    return fail("주문 상태를 업데이트할 수 없습니다.", 500);
  }

  if (!isPaid) return fail("결제 금액이 일치하지 않습니다.", 400);

  // 좌석 기반 주문이면 점유 상태를 held -> sold로 확정 (안 해주면 TTL 배치가 결제 완료된 좌석을 해제해버림)
  await admin
    .from("order_seat")
    .update({ status: "sold", held_until: null })
    .eq("order_id", orderId);

  return success({ status: "paid" });
}

import { NextRequest } from "next/server";
import { Webhook } from "@portone/server-sdk";
import { fail, success } from "@/lib/api/api-response";
import { supabaseAdmin } from "@/lib/supabase/admin";

// 결제 상태가 바뀔 때 포트원이 호출하는 웹훅.
// 클라이언트가 결제 확인 API를 호출하지 못한 경우(예: 결제 중 브라우저 종료)를 대비한 안전망 역할을 한다.
// 본문은 서명 검증을 위해 JSON 파싱 전 원문(string) 그대로 넘겨야 한다.
export async function POST(req: NextRequest) {
  const body = await req.text();

  let webhook;
  try {
    webhook = await Webhook.verify(
      process.env.PORTONE_WEBHOOK_SECRET!,
      body,
      Object.fromEntries(req.headers),
    );
  } catch (error) {
    console.error("[PAY-02] webhook verify failed:", error);
    return fail("invalid signature", 400);
  }

  let paymentId: string;
  let status: "paid" | "failed";

  if (webhook.type === "Transaction.Paid") {
    paymentId = webhook.data.paymentId;
    status = "paid";
  } else if (
    webhook.type === "Transaction.Failed" ||
    webhook.type === "Transaction.Cancelled"
  ) {
    paymentId = webhook.data.paymentId;
    status = "failed";
  } else {
    return success({ skipped: true });
  }

  const { error } = await supabaseAdmin
    .from("orders")
    .update({ status })
    .eq("order_id", paymentId);

  if (error) return fail(error.message, 500);

  return success({ status });
}

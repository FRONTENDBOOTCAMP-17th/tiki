// 입장 검증 API
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { verifyTicketToken } from "@/lib/tickets/token";

/**
 * POST /api/tickets/verify
 * body: { token: string }
 *
 * 2단계 검증:
 * 1) 서명·만료 검증 (HMAC) — 위조(invalid)/만료(expired)는 DB 접근 없이 거절
 * 2) checkin_ticket RPC — 권한·주문 상태·재사용 검증 + 원자적 체크인
 *
 * 응답 code:
 *  ok | invalid | expired | unauthorized | forbidden | not_found
 *  | not_paid | share_invalid | fully_shared | already_used
 */
export async function POST(request: Request) {
  let token: unknown;
  try {
    ({ token } = await request.json());
  } catch {
    return NextResponse.json({ code: "invalid" }, { status: 400 });
  }

  if (typeof token !== "string" || !token) {
    return NextResponse.json({ code: "invalid" }, { status: 400 });
  }

  // 1단계: 토큰 자체 검증
  const result = verifyTicketToken(token);
  if (!result.ok) {
    return NextResponse.json({ code: result.reason });
  }

  // 2단계: DB 상태 검증 + 원자적 체크인
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("checkin_ticket", {
    p_subject_type: result.payload.t,
    p_subject_id: result.payload.id,
  });

  if (error) {
    console.error("checkin_ticket RPC error:", error);
    return NextResponse.json({ code: "error" }, { status: 500 });
  }

  return NextResponse.json(data);
}
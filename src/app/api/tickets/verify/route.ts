import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { verifyTicketToken } from "@/lib/tickets/token";

/**
 * POST /api/tickets/verify
 * body: { token: string } | { code: string }
 *
 * 2단계 검증:
 * 1) 입력 해석
 *    - token: HMAC 서명·만료 검증 (위조 invalid / 만료 expired는 DB 접근 없이 거절)
 *    - code : 8자리 짧은 코드 → resolve_entry_code로 subject 조회 (만료 시 expired)
 * 2) checkin_ticket RPC — 권한·주문 상태·재사용 검증 + 원자적 체크인
 *
 * 응답 code:
 *  ok | invalid | expired | unauthorized | forbidden | not_found
 *  | not_paid | share_invalid | fully_shared | already_used
 */
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ code: "invalid" }, { status: 400 });
  }

  const token =
    body && typeof body === "object" && "token" in body
      ? (body as { token: unknown }).token
      : undefined;
  const code =
    body && typeof body === "object" && "code" in body
      ? (body as { code: unknown }).code
      : undefined;

  const supabase = await createClient();

  let subjectType: "order" | "share";
  let subjectId: string;

  if (typeof token === "string" && token) {
    // 1-A) 긴 토큰: 서명·만료 검증
    const result = verifyTicketToken(token);
    if (!result.ok) {
      return NextResponse.json({ code: result.reason });
    }
    subjectType = result.payload.t;
    subjectId = result.payload.id;
  } else if (typeof code === "string" && code.trim()) {
    // 1-B) 짧은 코드: DB에서 subject 조회 (만료면 못 찾음 → expired)
    const { data: resolvedRows, error: resolveError } = await supabase.rpc(
      "resolve_entry_code",
      { p_code: code },
    );
    if (resolveError) {
      return NextResponse.json({ code: "error" }, { status: 500 });
    }
    const resolved = resolvedRows?.[0];
    if (!resolved) {
      return NextResponse.json({ code: "expired" });
    }
    subjectType = resolved.subject_type as "order" | "share";
    subjectId = resolved.subject_id;
  } else {
    return NextResponse.json({ code: "invalid" }, { status: 400 });
  }

  // 2단계: DB 상태 검증 + 원자적 체크인
  const { data, error } = await supabase.rpc("checkin_ticket", {
    p_subject_type: subjectType,
    p_subject_id: subjectId,
  });

  if (error) {
    console.error("checkin_ticket RPC error:", error);
    return NextResponse.json({ code: "error" }, { status: 500 });
  }

  return NextResponse.json(data);
}
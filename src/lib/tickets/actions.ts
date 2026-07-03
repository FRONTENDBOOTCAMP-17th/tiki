// 토큰 발급 서버 액션
"use server";

import { createClient } from "@/lib/supabase/server";
import { ORDER_STATUS } from "@/lib/constants/order-status";
import { createTicketToken, TICKET_TOKEN_TTL_SECONDS } from "./token";

export interface IssueTokenSuccess {
  token: string;
  /** 만료까지 남은 시간(초) — 클라이언트 자동 갱신 주기 계산용 */
  expiresIn: number;
}

export interface IssueTokenError {
  error: string;
}

export type IssueTokenResult = IssueTokenSuccess | IssueTokenError;

/** 주문자 본인 보유분 QR 토큰 발급 */
export async function issueOrderQrToken(
  orderId: string,
): Promise<IssueTokenResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "로그인이 필요합니다." };

  const { data: order } = await supabase
    .from("orders")
    .select("order_id, user_id, status")
    .eq("order_id", orderId)
    .maybeSingle();

  // RLS로 남의 주문은 조회 자체가 안 되지만, 셀러 정책 경유 조회를 막기 위해 소유자 재확인
  if (!order || order.user_id !== user.id) {
    return { error: "티켓을 찾을 수 없습니다." };
  }
  if (order.status !== ORDER_STATUS.PAID) {
    return { error: "결제 완료된 티켓만 QR 발급이 가능합니다." };
  }

  return {
    token: createTicketToken("order", orderId),
    expiresIn: TICKET_TOKEN_TTL_SECONDS,
  };
}

/** 공유받은 티켓 QR 토큰 발급 */
export async function issueShareQrToken(
  shareId: string,
): Promise<IssueTokenResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "로그인이 필요합니다." };

  const { data: share } = await supabase
    .from("ticket_share")
    .select("share_id, shared_with, status")
    .eq("share_id", shareId)
    .maybeSingle();

  if (!share || share.shared_with !== user.id) {
    return { error: "티켓을 찾을 수 없습니다." };
  }
  if (share.status !== "accepted") {
    return { error: "수락된 공유 티켓만 QR 발급이 가능합니다." };
  }

  return {
    token: createTicketToken("share", shareId),
    expiresIn: TICKET_TOKEN_TTL_SECONDS,
  };
}
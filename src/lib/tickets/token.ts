// HMAC 서명/검증, 서버 전용
import { createHmac, timingSafeEqual } from "node:crypto";

/** QR 토큰 TTL (초) — 5분 */
export const TICKET_TOKEN_TTL_SECONDS = 300;

const TOKEN_VERSION = "1";

export type TicketSubjectType = "order" | "share";

export interface TicketTokenPayload {
  /** 토큰 버전 */
  v: string;
  /** 대상 타입: order(주문자 본인분) | share(공유받은 티켓) */
  t: TicketSubjectType;
  /** order_id 또는 share_id */
  id: string;
  /** 만료 시각 (unix seconds) */
  exp: number;
}

function getSecret(): string {
  const secret = process.env.TICKET_QR_SECRET;
  if (!secret) {
    throw new Error("TICKET_QR_SECRET 환경변수가 설정되지 않았습니다.");
  }
  return secret;
}

function sign(data: string): string {
  return createHmac("sha256", getSecret()).update(data).digest("base64url");
}

/** 서명 토큰 생성: base64url(payload).signature */
export function createTicketToken(
  type: TicketSubjectType,
  id: string,
  ttlSeconds: number = TICKET_TOKEN_TTL_SECONDS,
): string {
  const payload: TicketTokenPayload = {
    v: TOKEN_VERSION,
    t: type,
    id,
    exp: Math.floor(Date.now() / 1000) + ttlSeconds,
  };
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${body}.${sign(body)}`;
}

export type TicketTokenVerifyResult =
  | { ok: true; payload: TicketTokenPayload }
  | { ok: false; reason: "invalid" | "expired" };

/** 서명·만료 검증. 서명이 유효하지 않으면 payload를 신뢰하지 않음 */
export function verifyTicketToken(token: string): TicketTokenVerifyResult {
  const parts = token.split(".");
  if (parts.length !== 2) return { ok: false, reason: "invalid" };

  const [body, sig] = parts;

  // 타이밍 공격 방지를 위해 timingSafeEqual 사용
  const expected = Buffer.from(sign(body));
  const actual = Buffer.from(sig);
  if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) {
    return { ok: false, reason: "invalid" };
  }

  let payload: TicketTokenPayload;
  try {
    payload = JSON.parse(Buffer.from(body, "base64url").toString("utf8"));
  } catch {
    return { ok: false, reason: "invalid" };
  }

  if (
    payload.v !== TOKEN_VERSION ||
    (payload.t !== "order" && payload.t !== "share") ||
    typeof payload.id !== "string" ||
    typeof payload.exp !== "number"
  ) {
    return { ok: false, reason: "invalid" };
  }

  if (payload.exp < Math.floor(Date.now() / 1000)) {
    return { ok: false, reason: "expired" };
  }

  return { ok: true, payload };
}
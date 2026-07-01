import type { Tables } from "@/types/database";

export interface SettlementOrder {
  event_id: string;
  event_title: string;
  amount: number;
  quantity: number;
  status: string;
  month: string;
}

// seller_stores 생성 타입에서 정산 계좌 필드만 파생
export type BankAccount = Pick<
  Tables<"seller_stores">,
  "bank_name" | "bank_account_number" | "bank_holder_name"
>;

export interface MonthSummary {
  month: string;
  count: number;
  gross: number;
  fee: number;
  net: number;
}

// 정산 신청 1건 (신청 범위 = period_start ~ period_end, 양끝 포함)
export type SettlementRequest = Pick<
  Tables<"settlement_request">,
  | "settlement_id"
  | "period_start"
  | "period_end"
  | "gross"
  | "fee"
  | "net"
  | "status"
  | "requested_at"
  | "approved_at"
>;

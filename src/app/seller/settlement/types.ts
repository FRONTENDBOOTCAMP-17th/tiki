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

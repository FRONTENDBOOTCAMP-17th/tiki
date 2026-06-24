export interface SettlementOrder {
  event_id: string;
  event_title: string;
  amount: number;
  quantity: number;
  status: string;
  month: string;
}

export interface BankAccount {
  bank_name: string | null;
  bank_account_number: string | null;
  bank_holder_name: string | null;
}

export interface MonthSummary {
  month: string;
  count: number;
  gross: number;
  fee: number;
  net: number;
}

export interface OrderRow {
  order_id: string;
  event_id: string;
  event_title: string;
  buyer_name: string;
  grade_name: string;
  slot_label: string;
  quantity: number;
  total_price: number;
  status: string;
  created_at: string;
}

export interface EventOption {
  id: string;
  title: string;
}

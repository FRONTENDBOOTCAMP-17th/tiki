export interface Event {
  event_id: string;
  seller_id: string;
  category_id: string;
  title: string;
  status: "공개" | "비공개";
  venue_name: string;
  venue_address: string;
  venue_detail_address?: string;
  start_date: string;
  end_date: string;
  start_time: string;
  thumbnail?: string;
  created_at: string;
  updated_at: string;
}

export interface EventListItem extends Event {
  totalOrders: number;
  remainingSeats: number;
  totalRevenue: number;
}

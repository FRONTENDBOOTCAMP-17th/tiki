export interface EventDetail {
  event_id: string;
  category_id: string;
  title: string;
  status: "공개" | "비공개";
  description: string | null;
  venue_name: string;
  venue_address: string;
  venue_detail_address: string | null;
  start_date: string;
  end_date: string;
  start_time: string;
  duration: number | null;
  intermission: number | null;
  thumbnail: string | null;
}

export interface Grade {
  grade_id: string;
  grade_name: string;
  price: number;
  quantity: number;
}

export interface Slot {
  slot_id: string;
  date: string;
  start_time: string;
  end_time: string;
}

export interface CategoryOption {
  category_id: string;
  category_name: string;
}

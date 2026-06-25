import type { Tables } from "@/types/database";

// event/ticket_grade/slot 생성 타입에서 파생 (status 만 앱 표기 유니온으로 좁힘)
export type EventDetail = Pick<
  Tables<"event">,
  | "event_id"
  | "category_id"
  | "title"
  | "description"
  | "venue_name"
  | "venue_address"
  | "venue_detail_address"
  | "start_date"
  | "end_date"
  | "start_time"
  | "duration"
  | "intermission"
  | "thumbnail"
> & { status: "공개" | "비공개" };

export type Grade = Pick<
  Tables<"ticket_grade">,
  "grade_id" | "grade_name" | "price" | "quantity"
>;

export type Slot = Pick<
  Tables<"slot">,
  "slot_id" | "date" | "start_time" | "end_time"
>;

export interface CategoryOption {
  category_id: string;
  category_name: string;
}

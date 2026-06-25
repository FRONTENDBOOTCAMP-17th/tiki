import type { Tables } from "@/types/database";

// event 테이블 생성 타입에서 파생 (status 만 앱 표기 유니온으로 좁힘)
export type Event = Omit<Tables<"event">, "status"> & {
  status: "공개" | "비공개";
};

export interface EventListItem extends Event {
  totalOrders: number;
  remainingSeats: number;
  totalRevenue: number;
}

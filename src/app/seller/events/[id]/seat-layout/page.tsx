import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import PageHeader from "@/app/seller/_components/PageHeader";
import SeatLayoutPageClient from "./_components/SeatLayoutPageClient";
import type { DraftSeat, DraftStage } from "@/app/seller/_components/SeatLayoutBuilder";

const DEFAULT_STAGE: DraftStage = { x: 50, y: 10, width: 40, height: 10 };

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await requireUser();
  const supabase = await createClient();

  const { data: event } = await supabase
    .from("event")
    .select("event_id, title")
    .eq("event_id", id)
    .eq("seller_id", user.id)
    .is("deleted_at", null) // 관리자가 삭제한 게시물은 접근 차단
    .maybeSingle();
  if (!event) notFound();

  // price 오름차순으로 받아서, 좌석 자동배정 시 "더 싼 등급(보통 일반석)을 먼저 채우는" 순서로 쓴다
  const { data: gradeRows } = await supabase
    .from("ticket_grade")
    .select("grade_id, grade_name, quantity, price")
    .eq("event_id", id)
    .order("price", { ascending: true });

  // 등급별 좌석 수(VIP+일반 등) 합계를 넘는 좌석을 만들지 못하게 막기 위한 상한
  const maxSeats = (gradeRows ?? []).reduce((sum, g) => sum + g.quantity, 0);

  const { data: layout } = await supabase
    .from("seat_layout")
    .select("layout_id, stage_x, stage_y, stage_width, stage_height")
    .eq("event_id", id)
    .maybeSingle();

  let seats: DraftSeat[] = [];
  let locked = false;

  if (layout) {
    const { data: seatRows } = await supabase
      .from("seat")
      .select("seat_id, label, pos_x, pos_y, grade_id, group_name")
      .eq("layout_id", layout.layout_id);

    seats = (seatRows ?? []).map((s) => ({
      id: s.seat_id,
      label: s.label,
      x: s.pos_x,
      y: s.pos_y,
      gradeId: s.grade_id,
      groupName: s.group_name,
    }));

    const seatIds = seats.map((s) => s.id);
    if (seatIds.length > 0) {
      const { data: occupied } = await supabase
        .from("order_seat")
        .select("seat_id")
        .in("seat_id", seatIds)
        .limit(1);
      locked = !!occupied && occupied.length > 0;
    }
  }

  const stage: DraftStage = layout
    ? {
        x: layout.stage_x,
        y: layout.stage_y,
        width: layout.stage_width,
        height: layout.stage_height,
      }
    : DEFAULT_STAGE;

  return (
    <div className="flex flex-col gap-6 p-6">
      <PageHeader
        title="좌석 배치도"
        description={`${event.title} · 무대와 좌석을 드래그로 배치하세요.`}
      />
      <SeatLayoutPageClient
        eventId={id}
        grades={(gradeRows ?? []).map((g) => ({
          gradeId: g.grade_id,
          name: g.grade_name,
          quantity: g.quantity,
        }))}
        initialStage={stage}
        initialSeats={seats}
        maxSeats={maxSeats}
        locked={locked}
      />
    </div>
  );
}

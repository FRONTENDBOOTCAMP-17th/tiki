import { NextRequest } from "next/server";
import { fail, success } from "@/lib/api/api-response";
import { requireUserApi } from "@/lib/api/require-user";

interface SeatLayoutBody {
  stage?: { x?: unknown; y?: unknown; width?: unknown; height?: unknown };
  seats?: unknown;
}

function clampPercent(value: unknown) {
  const num = Number(value);
  if (!Number.isFinite(num)) return null;
  return Math.min(100, Math.max(0, num));
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: eventId } = await params;
  const body = (await req.json()) as SeatLayoutBody;

  const ctx = await requireUserApi();
  if ("error" in ctx) return ctx.error;
  const { user, supabase } = ctx;

  const { data: event } = await supabase
    .from("event")
    .select("event_id")
    .eq("event_id", eventId)
    .eq("seller_id", user.id)
    .maybeSingle();
  if (!event) return fail("event_not_found", 404);

  const stageX = clampPercent(body.stage?.x);
  const stageY = clampPercent(body.stage?.y);
  const stageWidth = clampPercent(body.stage?.width);
  const stageHeight = clampPercent(body.stage?.height);
  if (stageX === null || stageY === null || stageWidth === null || stageHeight === null) {
    return fail("invalid_stage", 400);
  }
  if (!Array.isArray(body.seats)) return fail("invalid_seats", 400);

  const seats = body.seats.map((raw) => {
    const r = raw as {
      label?: unknown;
      x?: unknown;
      y?: unknown;
      gradeId?: unknown;
      groupName?: unknown;
    };
    return {
      label: typeof r.label === "string" ? r.label.trim() : "",
      x: clampPercent(r.x),
      y: clampPercent(r.y),
      gradeId: typeof r.gradeId === "string" ? r.gradeId : null,
      groupName: typeof r.groupName === "string" && r.groupName.trim() ? r.groupName.trim() : null,
    };
  });
  if (seats.some((s) => !s.label || s.x === null || s.y === null)) {
    return fail("invalid_seats", 400);
  }

  // 기존 배치도가 있고 이미 판매/홀드된 좌석이 있으면 좌석 좌표 자체를 바꾸지 못하게 막는다
  // (좌석을 지우고 다시 만드는 방식이라, 이미 팔린 좌석의 좌표를 건드리면 주문-좌석 매핑이 끊어짐)
  const { data: existingLayout } = await supabase
    .from("seat_layout")
    .select("layout_id")
    .eq("event_id", eventId)
    .maybeSingle();

  if (existingLayout) {
    const { data: existingSeats } = await supabase
      .from("seat")
      .select("seat_id")
      .eq("layout_id", existingLayout.layout_id);
    const seatIds = (existingSeats ?? []).map((s) => s.seat_id);
    if (seatIds.length > 0) {
      const { data: occupied } = await supabase
        .from("order_seat")
        .select("seat_id")
        .in("seat_id", seatIds)
        .limit(1);
      if (occupied && occupied.length > 0) {
        return fail("seats_already_sold", 409);
      }
    }
  }

  const { data: layout, error: layoutError } = await supabase
    .from("seat_layout")
    .upsert(
      {
        event_id: eventId,
        stage_x: stageX,
        stage_y: stageY,
        stage_width: stageWidth,
        stage_height: stageHeight,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "event_id" },
    )
    .select("layout_id")
    .single();
  if (layoutError || !layout) return fail("seat_layout_save_failed", 500);

  await supabase.from("seat").delete().eq("layout_id", layout.layout_id);

  if (seats.length > 0) {
    const { error: insertError } = await supabase.from("seat").insert(
      seats.map((s) => ({
        layout_id: layout.layout_id,
        label: s.label,
        pos_x: s.x as number,
        pos_y: s.y as number,
        grade_id: s.gradeId,
        group_name: s.groupName,
      })),
    );
    if (insertError) return fail("seat_save_failed", 500);
  }

  return success({ layoutId: layout.layout_id }, "saved");
}

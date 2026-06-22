import { createClient } from "@/lib/supabase/server";
import { success, fail } from "@/lib/api/api-response";
import { SlotListData } from "@/types/api/event";

// SLOT-01 이벤트별 회차 목록 — GET /api/events/{eventId}/slots
// anon 읽기 가능

type SlotRow = {
  slot_id: string;
  event_id: string;
  date: string;
  start_time: string;
  end_time: string;
  is_closed: boolean;
};

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ eventId: string }> },
) {
  const { eventId } = await params;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("slot")
    .select("slot_id, event_id, date, start_time, end_time, is_closed")
    .eq("event_id", eventId)
    .order("date", { ascending: true })
    .order("start_time", { ascending: true });

  if (error) return fail(error.message, 500);

  const rows = (data ?? []) as SlotRow[];
  const result: SlotListData = {
    slots: rows.map((r) => ({
      slotId: r.slot_id,
      eventId: r.event_id,
      date: r.date,
      startTime: r.start_time,
      endTime: r.end_time,
      isClosed: r.is_closed,
    })),
  };

  return success(result);
}

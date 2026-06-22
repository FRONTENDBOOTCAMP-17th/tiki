import { success, fail } from "@/lib/api/api-response";
import { getSlots } from "@/lib/event/queries";
import { SlotListData } from "@/types/api/event";

// SLOT-01 이벤트별 회차 목록 — GET /api/events/{eventId}/slots
// anon 읽기 가능. 조회 로직은 @/lib/event/queries 에서 공유.

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ eventId: string }> },
) {
  const { eventId } = await params;

  try {
    const result: SlotListData = { slots: await getSlots(eventId) };
    return success(result);
  } catch (error) {
    return fail(error instanceof Error ? error.message : "internal_error", 500);
  }
}

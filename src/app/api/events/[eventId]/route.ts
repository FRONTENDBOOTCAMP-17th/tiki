import { success, fail } from "@/lib/api/api-response";
import { getEventDetail } from "@/lib/event/queries";

// EVENT-02 이벤트 상세 조회 — GET /api/events/{eventId}
// 데이터 접근/매핑 로직은 @/lib/event/queries 에서 공유 (서버 컴포넌트와 공용).

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ eventId: string }> },
) {
  const { eventId } = await params;

  try {
    const event = await getEventDetail(eventId);
    if (!event) return fail("event_not_found", 404);
    return success(event);
  } catch (error) {
    console.error("[EVENT-02] event query failed:", error);
    return fail("internal_error", 500);
  }
}

import { success, fail } from "@/lib/api/api-response";
import { getGrades } from "@/lib/event/queries";
import { GradeListData } from "@/types/api/event";

// 이벤트별 좌석 등급 목록(ticket_grade) — GET /api/events/{eventId}/grades
// anon 읽기 가능. 조회 로직은 @/lib/event/queries 에서 공유.

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ eventId: string }> },
) {
  const { eventId } = await params;

  try {
    const result: GradeListData = { grades: await getGrades(eventId) };
    return success(result);
  } catch (error) {
    return fail(error instanceof Error ? error.message : "internal_error", 500);
  }
}

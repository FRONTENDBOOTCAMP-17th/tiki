import { success, fail } from "@/lib/api/api-response";
import { getReviews } from "@/lib/event/queries";

// REVIEW-04 이벤트별 리뷰 목록 — GET /api/events/{eventId}/reviews
// anon 읽기 가능. 조회 로직은 @/lib/event/queries 에서 공유.

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ eventId: string }> },
) {
  const { eventId } = await params;

  try {
    return success(await getReviews(eventId));
  } catch (error) {
    return fail(error instanceof Error ? error.message : "internal_error", 500);
  }
}

import { createClient } from "@/lib/supabase/server";
import { success, fail } from "@/lib/api/api-response";
import { ReviewListData } from "@/types/api/event";

// REVIEW-04 이벤트별 리뷰 목록 — GET /api/events/{eventId}/reviews
// anon 읽기 가능

type ReviewRow = {
  review_id: string;
  rating: number;
  memo: string | null;
  created_at: string;
};

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ eventId: string }> },
) {
  const { eventId } = await params;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("review")
    .select("review_id, rating, memo, created_at")
    .eq("event_id", eventId)
    .order("created_at", { ascending: false });

  if (error) return fail(error.message, 500);

  const rows = (data ?? []) as ReviewRow[];
  const totalCount = rows.length;
  const averageRating = totalCount
    ? Math.round((rows.reduce((s, r) => s + r.rating, 0) / totalCount) * 10) /
      10
    : 0;

  const result: ReviewListData = {
    averageRating,
    totalCount,
    reviews: rows.map((r) => ({
      reviewId: r.review_id,
      userName: "", // users 권한 잠김, 리뷰 작성하면서 연결 필요
      userProfileImage: "",
      rating: r.rating,
      memo: r.memo ?? "",
      createdAt: r.created_at,
    })),
    page: 1,
    limit: totalCount,
  };

  return success(result);
}

// 관리자 리뷰 관리: 판매자가 올린 리뷰 삭제요청 목록을 조회해 화면에 전달
// (요청 → 리뷰 → 공연/작성자/판매자 정보를 조인해서 카드로 보여줌)
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import ReviewDeleteRequests, {
  type AdminReviewRequest,
} from "./_components/ReviewDeleteRequests";

// 작성자 이름 마스킹 (홍길동 → 홍**)
function maskName(name: string) {
  const trimmed = (name ?? "").trim();
  if (!trimmed) return "익명";
  if (trimmed.length === 1) return trimmed;
  return trimmed[0] + "*".repeat(trimmed.length - 1);
}

export default async function AdminReviewsPage() {
  const supabase = getSupabaseAdmin();

  const { data: requestRows } = await supabase
    .from("review_delete_request")
    .select("request_id, review_id, seller_id, reason, status, created_at")
    .order("created_at", { ascending: false });

  const requests = requestRows ?? [];

  // 대상 리뷰 (소프트 삭제된 리뷰도 포함 — 승인된 요청 카드에 원문을 계속 보여준다)
  const reviewIds = [...new Set(requests.map((r) => r.review_id))];
  const { data: reviewRows } = reviewIds.length
    ? await supabase
        .from("review")
        .select("review_id, event_id, user_id, rating, memo, deleted_at")
        .in("review_id", reviewIds)
    : { data: [] };
  const reviewMap = new Map((reviewRows ?? []).map((r) => [r.review_id, r]));

  // 공연 정보
  const eventIds = [...new Set((reviewRows ?? []).map((r) => r.event_id))];
  const { data: eventRows } = eventIds.length
    ? await supabase
        .from("event")
        .select("event_id, title, thumbnail")
        .in("event_id", eventIds)
    : { data: [] };
  const eventMap = new Map((eventRows ?? []).map((e) => [e.event_id, e]));

  // 작성자(리뷰) + 요청 판매자 이름
  const userIds = [
    ...new Set([
      ...(reviewRows ?? []).map((r) => r.user_id),
      ...requests.map((r) => r.seller_id),
    ]),
  ];
  const { data: userRows } = userIds.length
    ? await supabase.from("users").select("id, name").in("id", userIds)
    : { data: [] };
  const userMap = new Map((userRows ?? []).map((u) => [u.id, u.name ?? ""]));

  const { data: profileRows } = requests.length
    ? await supabase
        .from("seller_profiles")
        .select("id, store_name")
        .in(
          "id",
          requests.map((r) => r.seller_id),
        )
    : { data: [] };
  const storeMap = new Map(
    (profileRows ?? []).map((p) => [p.id, p.store_name]),
  );

  const enriched: AdminReviewRequest[] = requests.map((r) => {
    const review = reviewMap.get(r.review_id);
    const event = review ? eventMap.get(review.event_id) : undefined;
    return {
      requestId: r.request_id,
      reviewId: r.review_id,
      status: r.status,
      reason: r.reason,
      requestedAt: r.created_at,
      sellerName:
        storeMap.get(r.seller_id) || userMap.get(r.seller_id) || "알 수 없음",
      eventTitle: event?.title ?? "삭제된 공연",
      eventThumbnail: event?.thumbnail ?? null,
      author: maskName(review ? (userMap.get(review.user_id) ?? "") : ""),
      rating: review?.rating ?? 0,
      memo: review?.memo ?? "",
      reviewDeleted: !!review?.deleted_at,
    };
  });

  // 처리 대기(pending)를 위로
  enriched.sort((a, b) => {
    if (a.status === b.status) return 0;
    return a.status === "pending" ? -1 : 1;
  });

  return (
    <div className="mx-auto max-w-4xl space-y-6 py-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-50">
          리뷰 관리
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          판매자가 요청한 리뷰 삭제를 검토하고 승인 또는 거절합니다.
        </p>
      </div>
      <ReviewDeleteRequests initialRequests={enriched} />
    </div>
  );
}

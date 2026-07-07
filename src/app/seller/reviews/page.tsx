import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import SellerReviewList, {
  type SellerReview,
} from "./_components/SellerReviewList";

function maskName(name: string) {
  const trimmed = name.trim();
  if (!trimmed) return "익명";
  if (trimmed.length === 1) return trimmed;
  return trimmed[0] + "*".repeat(trimmed.length - 1);
}

export default async function SellerReviewsPage() {
  const user = await requireUser();
  const supabase = await createClient();

  const { data: eventRows } = await supabase
    .from("event")
    .select("event_id, title, thumbnail")
    .eq("seller_id", user.id)
    .is("deleted_at", null); // 관리자가 삭제한 게시물 제외
  const events = eventRows ?? [];
  const eventIds = events.map((e) => e.event_id);
  const titleMap = new Map(events.map((e) => [e.event_id, e.title]));
  const thumbMap = new Map(events.map((e) => [e.event_id, e.thumbnail]));

  const { data: reviewRows } = eventIds.length
    ? await supabase
        .from("review")
        .select("review_id, event_id, user_id, rating, memo, created_at")
        .in("event_id", eventIds)
        .is("deleted_at", null) // 삭제 승인된 리뷰는 판매자 목록에서 제외
        .order("created_at", { ascending: false })
    : { data: [] };

  const userIds = [...new Set((reviewRows ?? []).map((r) => r.user_id))];
  const { data: userRows } = userIds.length
    ? await supabase.from("users").select("id, name").in("id", userIds)
    : { data: [] };
  const nameMap = new Map((userRows ?? []).map((u) => [u.id, u.name ?? ""]));

  const { data: requestRows } = await supabase
    .from("review_delete_request")
    .select("review_id, reason, created_at")
    .eq("seller_id", user.id)
    .eq("status", "pending");
  const requestMap = new Map(
    (requestRows ?? []).map((r) => [
      r.review_id,
      { reason: r.reason, requestedAt: r.created_at },
    ]),
  );

  const reviews: SellerReview[] = (reviewRows ?? []).map((r) => ({
    reviewId: r.review_id,
    eventId: r.event_id,
    eventTitle: titleMap.get(r.event_id) ?? "알 수 없음",
    eventThumbnail: thumbMap.get(r.event_id) ?? null,
    author: maskName(nameMap.get(r.user_id) ?? ""),
    rating: r.rating,
    memo: r.memo ?? "",
    createdAt: r.created_at,
    deleteRequest: requestMap.get(r.review_id) ?? null,
  }));

  return (
    <SellerReviewList
      reviews={reviews}
      events={events.map((e) => ({ id: e.event_id, title: e.title }))}
    />
  );
}

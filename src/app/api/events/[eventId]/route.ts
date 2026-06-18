import { createClient } from "@/lib/supabase/server";
import { success, fail } from "@/lib/api/api-response";
import { EventDetail } from "@/types/domain/event";

// EVENT-02 이벤트 상세 조회 — GET /api/events/{eventId}
// 평면 event 테이블 → 중첩 응답(venue/seller/images) 매핑.
// review/bookmark 테이블 미생성 → rating/reviewCount=0, isBookmarked=false (리뷰는 클라 더미).

type EventRow = {
  event_id: string;
  title: string;
  thumbnail: string | null;
  description: string | null;
  duration: number | null;
  intermission: number | null;
  start_date: string;
  end_date: string;
  status: string;
  venue_address: string | null;
  venue_detail_address: string | null;
  seller_id: string;
  // category_id FK → 중첩 조회 (to-one 이지만 방어적으로 배열도 허용)
  category: { category_name: string } | { category_name: string }[] | null;
};

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ eventId: string }> },
) {
  const { eventId } = await params;
  const supabase = await createClient();

  // 1) event + category (category_id 는 FK 있어 중첩 조회)
  const { data, error } = await supabase
    .from("event")
    .select(
      "event_id, title, thumbnail, description, duration, intermission, start_date, end_date, status, venue_address, venue_detail_address, seller_id, category:category_id ( category_name )",
    )
    .eq("event_id", eventId)
    .maybeSingle();

  if (error) return fail(error.message, 500);
  if (!data) return fail("event_not_found", 404);

  const e = data as EventRow;
  const category = Array.isArray(e.category) ? e.category[0] : e.category;

  // 2) 판매자 store_name — seller_id 에 FK 미선언이라 별도 조회
  const { data: sellerData } = await supabase
    .from("seller_profiles")
    .select("store_name")
    .eq("id", e.seller_id)
    .maybeSingle();
  const storeName = (sellerData as { store_name: string } | null)?.store_name;

  // 3) 소개 이미지 (event_image) — order 정렬, 썸네일을 맨 앞에
  const { data: imageData } = await supabase
    .from("event_image")
    .select("url, order")
    .eq("event_id", eventId)
    .order("order", { ascending: true, nullsFirst: false });
  const images = [
    ...(e.thumbnail ? [e.thumbnail] : []),
    ...((imageData as { url: string }[] | null) ?? []).map((r) => r.url),
  ];

  const eventDetail: EventDetail = {
    eventId: e.event_id,
    title: e.title,
    category: category?.category_name ?? "",
    description: e.description ?? "",
    images,
    venue: {
      address: e.venue_address ?? "",
      detailAddress: e.venue_detail_address ?? "",
    },
    seller: {
      sellerId: e.seller_id,
      storeName: storeName ?? "",
    },
    duration: e.duration ?? 0,
    intermission: e.intermission ?? 0,
    startDate: e.start_date,
    endDate: e.end_date,
    status: e.status,
    rating: 0, // review 테이블 미생성
    reviewCount: 0,
    isBookmarked: false, // bookmark 제외
  };

  return success(eventDetail);
}

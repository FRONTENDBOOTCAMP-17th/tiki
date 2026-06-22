import { createClient } from "@/lib/supabase/server";
import { EventDetail, Slot, Grade } from "@/types/domain/event";
import { ReviewListData } from "@/types/api/event";

// 이벤트 상세 페이지가 쓰는 데이터 접근 계층.
// API 라우트(GET /api/events/...)와 서버 컴포넌트(app/[eventId]/page.tsx)가 함께 사용한다.
// supabase 에러는 throw → 호출부(라우트는 500, 페이지는 에러 바운더리)에서 처리.

// 잘못된 id 가 uuid 컬럼 캐스팅 에러를 일으키기 전에 형식 검증
const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

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

type SlotRow = {
  slot_id: string;
  event_id: string;
  date: string;
  start_time: string;
  end_time: string;
  is_closed: boolean;
};

type GradeRow = {
  grade_id: string;
  event_id: string;
  grade_name: string;
  price: number;
  quantity: number;
};

type ReviewRow = {
  review_id: string;
  rating: number;
  memo: string | null;
  created_at: string;
};

// EVENT-02 이벤트 상세 — 평면 event 테이블을 중첩 응답(venue/seller/images)으로 매핑.
// 존재하지 않으면(잘못된 id 포함) null. supabase 에러는 throw.
export async function getEventDetail(
  eventId: string,
): Promise<EventDetail | null> {
  if (!UUID_RE.test(eventId)) return null;

  const supabase = await createClient();

  // 1) event + category (category_id 는 FK 있어 중첩 조회)
  const { data, error } = await supabase
    .from("event")
    .select(
      "event_id, title, thumbnail, description, duration, intermission, start_date, end_date, status, venue_address, venue_detail_address, seller_id, category:category_id ( category_name )",
    )
    .eq("event_id", eventId)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

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

  return {
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
}

// SLOT-01 이벤트별 회차 목록 (anon 읽기 가능)
export async function getSlots(eventId: string): Promise<Slot[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("slot")
    .select("slot_id, event_id, date, start_time, end_time, is_closed")
    .eq("event_id", eventId)
    .order("date", { ascending: true })
    .order("start_time", { ascending: true });

  if (error) throw error;

  return ((data ?? []) as SlotRow[]).map((r) => ({
    slotId: r.slot_id,
    eventId: r.event_id,
    date: r.date,
    startTime: r.start_time,
    endTime: r.end_time,
    isClosed: r.is_closed,
  }));
}

// 이벤트별 좌석 등급 목록 (ticket_grade — 이벤트 단위, anon 읽기 가능)
export async function getGrades(eventId: string): Promise<Grade[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("ticket_grade")
    .select("grade_id, event_id, grade_name, price, quantity")
    .eq("event_id", eventId)
    .order("price", { ascending: false });

  if (error) throw error;

  return ((data ?? []) as GradeRow[]).map((r) => ({
    gradeId: r.grade_id,
    eventId: r.event_id,
    name: r.grade_name,
    price: r.price,
    quantity: r.quantity,
  }));
}

// REVIEW-04 이벤트별 리뷰 목록 (anon 읽기 가능) — 평균 평점/개수까지 집계
export async function getReviews(eventId: string): Promise<ReviewListData> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("review")
    .select("review_id, rating, memo, created_at")
    .eq("event_id", eventId)
    .order("created_at", { ascending: false });

  if (error) throw error;

  const rows = (data ?? []) as ReviewRow[];
  const totalCount = rows.length;
  const averageRating = totalCount
    ? Math.round((rows.reduce((s, r) => s + r.rating, 0) / totalCount) * 10) /
      10
    : 0;

  return {
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
}

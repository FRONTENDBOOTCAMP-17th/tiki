import { createClient } from "@/lib/supabase/server";
import { EventDetail, Slot, Grade } from "@/types/domain/event";
import { ReviewListData } from "@/types/api/event";

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
  user_id: string;
  author_name: string | null;
  like_count: number | string | null;
  liked_by_me: boolean | null;
};

export async function getEventDetail(
  eventId: string,
): Promise<EventDetail | null> {
  if (!UUID_RE.test(eventId)) return null;

  const supabase = await createClient();

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

  const { data: sellerData } = await supabase
    .from("seller_profiles")
    .select("store_name")
    .eq("id", e.seller_id)
    .maybeSingle();
  const storeName = (sellerData as { store_name: string } | null)?.store_name;

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
    rating: 0,
    reviewCount: 0,
    isBookmarked: false,
  };
}

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

export async function getReviews(eventId: string): Promise<ReviewListData> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("get_event_reviews", {
    p_event_id: eventId,
  });

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
      userId: r.user_id,
      userName: r.author_name ?? "익명",
      rating: r.rating,
      memo: r.memo ?? "",
      createdAt: r.created_at,
      likeCount: Number(r.like_count ?? 0),
      likedByMe: !!r.liked_by_me,
    })),
    page: 1,
    limit: totalCount,
  };
}

const DAYS = ["일", "월", "화", "수", "목", "금", "토"];

export interface WritableReviewSlot {
  orderId: string;
  slotLabel: string;
}

export async function getWritableReviewSlots(
  eventId: string,
): Promise<WritableReviewSlot[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data: written } = await supabase
    .from("review")
    .select("order_id")
    .eq("event_id", eventId)
    .eq("user_id", user.id);
  const reviewedOrders = new Set((written ?? []).map((r) => r.order_id));

  const { data: orders } = await supabase
    .from("orders")
    .select("order_id, slot_id, created_at")
    .eq("user_id", user.id)
    .eq("event_id", eventId)
    .eq("status", "paid")
    .order("created_at", { ascending: false });

  const slotIds = [
    ...new Set(
      (orders ?? []).map((o) => o.slot_id).filter(Boolean) as string[],
    ),
  ];
  if (slotIds.length === 0) return [];

  const { data: slots } = await supabase
    .from("slot")
    .select("slot_id, date, start_time, end_time")
    .in("slot_id", slotIds);
  const slotMap = new Map((slots ?? []).map((s) => [s.slot_id, s]));

  const now = new Date();
  const result: WritableReviewSlot[] = [];
  for (const order of orders ?? []) {
    if (!order.slot_id || reviewedOrders.has(order.order_id)) continue;
    const slot = slotMap.get(order.slot_id);
    if (!slot) continue;
    const end = new Date(`${slot.date}T${slot.end_time.slice(0, 5)}:00+09:00`);
    if (end > now) continue;

    const d = new Date(`${slot.date}T00:00:00`);
    result.push({
      orderId: order.order_id,
      slotLabel: `${d.getMonth() + 1}/${d.getDate()}(${DAYS[d.getDay()]}) ${slot.start_time.slice(0, 5)}`,
    });
  }
  return result;
}

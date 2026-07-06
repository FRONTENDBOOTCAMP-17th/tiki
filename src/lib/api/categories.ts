import { createClient } from "@/lib/supabase/server";

export interface CategoryRow {
  category_id: string;
  category_name: string;
  slug: string;
  icon_key: string;
  display_order: number;
}

// 활성 카테고리를 display_order 오름차순으로 조회한다.
// API 라우트와 카테고리 페이지가 함께 사용.
export async function fetchCategories(): Promise<CategoryRow[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("category")
    .select("category_id, category_name, slug, icon_key, display_order")
    .eq("is_active", true)
    .order("display_order", { ascending: true });

  if (error) throw error;
  return (data ?? []) as CategoryRow[];
}

export interface CategoryEvent {
  eventId: string;
  title: string;
  startDate: string;
  endDate: string;
  venueName: string;
  thumbnail: string;
  minPrice: number | null;
}

interface EventRowWithGrades {
  event_id: string;
  title: string;
  thumbnail: string;
  start_date: string;
  end_date: string;
  venue_name: string;
  ticket_grade: { price: number }[] | null;
}

// 특정 카테고리(slug)의 "공개" 공연을 시작일 순으로 조회한다.
// 카테고리는 inner join으로 slug 필터, 가격은 ticket_grade를 임베드해 최저가 계산.
export async function fetchCategoryEvents(
  slug: string,
): Promise<CategoryEvent[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("event")
    .select(
      "event_id, title, thumbnail, start_date, end_date, venue_name, ticket_grade(price), category!inner(slug)",
    )
    .eq("category.slug", slug)
    .in("status", ["공개", "일시정지"])
    .order("created_at", { ascending: false });

  if (error) throw error;

  return ((data ?? []) as EventRowWithGrades[]).map((row) => {
    const prices = (row.ticket_grade ?? []).map((g) => g.price);
    return {
      eventId: row.event_id,
      title: row.title,
      startDate: row.start_date,
      endDate: row.end_date,
      venueName: row.venue_name,
      thumbnail: row.thumbnail,
      minPrice: prices.length > 0 ? Math.min(...prices) : null,
    };
  });
}

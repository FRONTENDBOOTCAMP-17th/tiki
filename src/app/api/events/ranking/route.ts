import { fetchRanking } from "@/lib/event/ranking";
import { success, fail } from "@/lib/api/api-response";

// GET /api/events/ranking?slug=musical&limit=10&days=30
// slug 생략 시 전체 카테고리 랭킹 반환
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get("slug") ?? undefined;
  const limit = Math.min(50, Math.max(1, Number(searchParams.get("limit")) || 10));
  const days = Math.min(365, Math.max(1, Number(searchParams.get("days")) || 30));

  try {
    const items = await fetchRanking({ slug, limit, days });
    const res = success({ items, total: items.length });
    // 탭 전환 시 불필요한 재요청 방지: CDN 10분 캐시, 이후 5분 stale-while-revalidate
    res.headers.set("Cache-Control", "s-maxage=600, stale-while-revalidate=300");
    return res;
  } catch (e) {
    const message = e instanceof Error ? e.message : "ranking fetch failed";
    return fail(message, 500);
  }
}

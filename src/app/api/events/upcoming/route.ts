import { fetchUpcoming } from "@/lib/event/upcoming";
import { success, fail } from "@/lib/api/api-response";

// GET /api/events/upcoming?slug=concert&limit=20
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get("slug") ?? undefined;
  const limit = Math.min(50, Math.max(1, Number(searchParams.get("limit")) || 20));

  try {
    const items = await fetchUpcoming({ slug, limit });
    return success({ items, total: items.length });
  } catch (e) {
    const message = e instanceof Error ? e.message : "upcoming fetch failed";
    return fail(message, 500);
  }
}

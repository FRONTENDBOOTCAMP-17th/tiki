import { getSupabaseAdmin } from "@/lib/supabase/admin";
import CategoryManager from "./_components/CategoryManager";

export default async function AdminCategoriesPage() {
  const supabase = getSupabaseAdmin();

  const { data: categories } = await supabase
    .from("category")
    .select("*")
    .order("display_order", { ascending: true });

  // 카테고리별 이벤트 수
  const categoryIds = (categories ?? []).map((c) => c.category_id);
  const { data: eventRows } =
    categoryIds.length > 0
      ? await supabase
          .from("event")
          .select("category_id")
          .in("category_id", categoryIds)
      : { data: [] };

  const eventCountMap = new Map<string, number>();
  for (const e of eventRows ?? []) {
    eventCountMap.set(e.category_id, (eventCountMap.get(e.category_id) ?? 0) + 1);
  }

  const enriched = (categories ?? []).map((c) => ({
    ...c,
    eventCount: eventCountMap.get(c.category_id) ?? 0,
  }));

  return (
    <div className="mx-auto max-w-4xl space-y-6 py-8">
      <h1 className="text-2xl font-bold text-gray-900">카테고리 관리</h1>
      <CategoryManager initialCategories={enriched} />
    </div>
  );
}

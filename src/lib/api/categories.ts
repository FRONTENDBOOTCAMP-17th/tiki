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

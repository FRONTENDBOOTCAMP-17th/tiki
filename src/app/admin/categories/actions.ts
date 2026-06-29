"use server";

import { revalidatePath } from "next/cache";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/auth";

export async function reorderCategories(
  items: { categoryId: string; displayOrder: number }[],
) {
  await requireAdmin();
  const supabase = getSupabaseAdmin();

  await Promise.all(
    items.map(({ categoryId, displayOrder }) =>
      supabase
        .from("category")
        .update({ display_order: displayOrder })
        .eq("category_id", categoryId),
    ),
  );

  revalidatePath("/admin/categories");
}

export async function updateCategory(formData: FormData) {
  await requireAdmin();
  const categoryId = String(formData.get("categoryId") ?? "");
  const name = String(formData.get("name") ?? "").trim();

  if (!categoryId || !name) return { error: "카테고리 이름을 입력해주세요" };

  const supabase = getSupabaseAdmin();
  const { error } = await supabase
    .from("category")
    .update({ category_name: name })
    .eq("category_id", categoryId);

  if (error) return { error: error.message };
  revalidatePath("/admin/categories");
  return { success: true };
}

export async function deleteCategory(categoryId: string) {
  await requireAdmin();
  const supabase = getSupabaseAdmin();

  const { count } = await supabase
    .from("event")
    .select("*", { count: "exact", head: true })
    .eq("category_id", categoryId);

  if (count && count > 0) {
    return { error: `이벤트 ${count}개가 사용 중인 카테고리입니다` };
  }

  const { error } = await supabase
    .from("category")
    .delete()
    .eq("category_id", categoryId);

  if (error) return { error: error.message };
  revalidatePath("/admin/categories");
  return { success: true };
}

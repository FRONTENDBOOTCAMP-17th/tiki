"use server";

import { revalidatePath } from "next/cache";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export async function addCategory(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const slug = String(formData.get("slug") ?? "").trim();
  const iconKey = String(formData.get("iconKey") ?? "tag").trim();
  const displayOrder = Number(formData.get("displayOrder") ?? 0);

  if (!name || !slug) return { error: "이름과 슬러그는 필수입니다" };

  const supabase = getSupabaseAdmin();

  const categoryId = `cat_${Date.now()}`;
  const { error } = await supabase.from("category").insert({
    category_id: categoryId,
    category_name: name,
    slug,
    icon_key: iconKey,
    display_order: displayOrder,
    is_active: true,
  });

  if (error) return { error: error.message };
  revalidatePath("/admin/categories");
  return { success: true };
}

export async function updateCategory(formData: FormData) {
  const categoryId = String(formData.get("categoryId") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  const slug = String(formData.get("slug") ?? "").trim();
  const iconKey = String(formData.get("iconKey") ?? "tag").trim();
  const displayOrder = Number(formData.get("displayOrder") ?? 0);
  const isActive = formData.get("isActive") === "true";

  if (!categoryId || !name || !slug) return { error: "필수 항목을 입력해주세요" };

  const supabase = getSupabaseAdmin();
  const { error } = await supabase
    .from("category")
    .update({ category_name: name, slug, icon_key: iconKey, display_order: displayOrder, is_active: isActive })
    .eq("category_id", categoryId);

  if (error) return { error: error.message };
  revalidatePath("/admin/categories");
  return { success: true };
}

export async function deleteCategory(categoryId: string) {
  const supabase = getSupabaseAdmin();

  const { count } = await supabase
    .from("event")
    .select("*", { count: "exact", head: true })
    .eq("category_id", categoryId);

  if (count && count > 0) {
    return { error: `이 카테고리에 이벤트 ${count}개가 사용 중입니다` };
  }

  const { error } = await supabase
    .from("category")
    .delete()
    .eq("category_id", categoryId);

  if (error) return { error: error.message };
  revalidatePath("/admin/categories");
  return { success: true };
}

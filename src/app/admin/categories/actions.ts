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

"use server";

import { revalidatePath } from "next/cache";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export async function banUser(userId: string) {
  const supabase = getSupabaseAdmin();
  const { error } = await supabase.auth.admin.updateUserById(userId, {
    ban_duration: "876600h",
  });
  if (error) return { error: error.message };
  revalidatePath("/admin/members");
  return { success: true };
}

export async function unbanUser(userId: string) {
  const supabase = getSupabaseAdmin();
  const { error } = await supabase.auth.admin.updateUserById(userId, {
    ban_duration: "none",
  });
  if (error) return { error: error.message };
  revalidatePath("/admin/members");
  return { success: true };
}

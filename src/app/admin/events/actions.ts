"use server";

import { revalidatePath } from "next/cache";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export async function hideEvent(eventId: string) {
  const supabase = getSupabaseAdmin();
  const { error } = await supabase
    .from("event")
    .update({ status: "비공개" })
    .eq("event_id", eventId);
  if (error) return { error: error.message };
  revalidatePath("/admin/events");
  return { success: true };
}

export async function publishEvent(eventId: string) {
  const supabase = getSupabaseAdmin();
  const { error } = await supabase
    .from("event")
    .update({ status: "공개" })
    .eq("event_id", eventId);
  if (error) return { error: error.message };
  revalidatePath("/admin/events");
  return { success: true };
}

"use server";

import { revalidatePath } from "next/cache";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/auth";

export async function hideEvent(eventId: string) {
  await requireAdmin();
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
  await requireAdmin();
  const supabase = getSupabaseAdmin();
  const { error } = await supabase
    .from("event")
    .update({ status: "공개" })
    .eq("event_id", eventId);
  if (error) return { error: error.message };
  revalidatePath("/admin/events");
  return { success: true };
}

export async function deleteEvent(eventId: string) {
  await requireAdmin();
  const supabase = getSupabaseAdmin();

  const { count } = await supabase
    .from("orders")
    .select("*", { count: "exact", head: true })
    .eq("event_id", eventId)
    .not("status", "eq", "cancelled");

  if (count && count > 0) {
    return { error: `처리 중인 예매 ${count}건이 존재합니다. 삭제할 수 없습니다.` };
  }

  await supabase.from("event_image").delete().eq("event_id", eventId);
  await supabase.from("slot").delete().eq("event_id", eventId);
  await supabase.from("ticket_grade").delete().eq("event_id", eventId);

  const { error } = await supabase.from("event").delete().eq("event_id", eventId);
  if (error) return { error: error.message };
  revalidatePath("/admin/events");
  return { success: true };
}

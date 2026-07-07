"use server";

import { revalidatePath } from "next/cache";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/auth";

export async function hideEvent(eventId: string) {
  await requireAdmin();
  const supabase = getSupabaseAdmin();
  const { error } = await supabase
    .from("event")
    .update({ status: "일시정지" })
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

// 소프트 삭제: 행을 지우지 않고 deleted_at/deleted_by만 마킹한다.
// 이미지·회차·좌석등급·리뷰가 연쇄 삭제되지 않아 기록이 보존되고 복구도 가능하다.
export async function deleteEvent(eventId: string) {
  const admin = await requireAdmin();
  const supabase = getSupabaseAdmin();

  const { count } = await supabase
    .from("orders")
    .select("*", { count: "exact", head: true })
    .eq("event_id", eventId)
    .not("status", "eq", "cancelled");

  if (count && count > 0) {
    return { error: `처리 중인 예매 ${count}건이 존재합니다. 삭제할 수 없습니다.` };
  }

  const { error } = await supabase
    .from("event")
    .update({ deleted_at: new Date().toISOString(), deleted_by: admin.id })
    .eq("event_id", eventId)
    .is("deleted_at", null); // 이미 삭제된 건 재처리 방지
  if (error) return { error: error.message };
  revalidatePath("/admin/events");
  return { success: true };
}

// 삭제 복구: deleted_at/deleted_by를 비워 다시 노출시킨다.
export async function restoreEvent(eventId: string) {
  await requireAdmin();
  const supabase = getSupabaseAdmin();

  const { error } = await supabase
    .from("event")
    .update({ deleted_at: null, deleted_by: null })
    .eq("event_id", eventId)
    .not("deleted_at", "is", null);
  if (error) return { error: error.message };
  revalidatePath("/admin/events");
  return { success: true };
}

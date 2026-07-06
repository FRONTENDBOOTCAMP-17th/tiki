"use server";

import { revalidatePath } from "next/cache";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/auth";

// 관리자 정산 승인
export async function approveSettlement(settlementId: string) {
  await requireAdmin();
  const supabase = getSupabaseAdmin();

  const { error } = await supabase
    .from("settlement_request")
    .update({ status: "approved", approved_at: new Date().toISOString() })
    .eq("settlement_id", settlementId)
    .eq("status", "requested"); // 이미 승인된 건 재승인 방지

  if (error) return { error: error.message };

  revalidatePath("/admin/settlement");
  return { success: true };
}

// 관리자 정산 반려 (사유 필수)
export async function rejectSettlement(settlementId: string, reason: string) {
  await requireAdmin();
  const trimmed = reason.trim();
  if (!trimmed) return { error: "반려 사유를 입력해주세요" };

  const supabase = getSupabaseAdmin();

  const { error } = await supabase
    .from("settlement_request")
    .update({ status: "rejected", reject_reason: trimmed })
    .eq("settlement_id", settlementId)
    .eq("status", "requested"); // 이미 처리된 건 재처리 방지

  if (error) return { error: error.message };

  revalidatePath("/admin/settlement");
  return { success: true };
}

"use server";

import { revalidatePath } from "next/cache";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/auth";

// 리뷰 삭제 요청 승인 = 소프트 삭제 (deleted_at 마킹)
// 행을 실제로 지우지 않으므로 요청 기록(사유 포함)과 리뷰 내용이 함께 보존되고,
// 필요 시 복구할 수 있다. 부분 유니크 인덱스 덕에 작성자의 재작성도 막지 않는다.
export async function approveReviewDeletion(requestId: string) {
  await requireAdmin();
  const supabase = getSupabaseAdmin();

  const { data: req } = await supabase
    .from("review_delete_request")
    .select("review_id, status")
    .eq("request_id", requestId)
    .single();

  if (!req || req.status !== "pending") {
    return { error: "이미 처리된 요청입니다" };
  }

  // 리뷰 먼저 마킹 → 요청 상태 갱신. 중간 실패 시 요청이 pending으로 남아
  // 재시도하면 이어서 처리되는 순서라 안전하다.
  const { error: reviewError } = await supabase
    .from("review")
    .update({ deleted_at: new Date().toISOString() })
    .eq("review_id", req.review_id)
    .is("deleted_at", null);
  if (reviewError) return { error: reviewError.message };

  const { error } = await supabase
    .from("review_delete_request")
    .update({ status: "approved" })
    .eq("request_id", requestId)
    .eq("status", "pending");
  if (error) return { error: error.message };

  revalidatePath("/admin/reviews");
  return { success: true };
}

// 삭제된 리뷰 복구: deleted_at을 비우고, 해당 승인 요청은 rejected로 되돌린다.
// (승인 상태를 유지한 채 리뷰만 살리면 "승인됨=삭제됨" 의미가 깨지기 때문)
export async function restoreReview(requestId: string) {
  await requireAdmin();
  const supabase = getSupabaseAdmin();

  const { data: req } = await supabase
    .from("review_delete_request")
    .select("review_id, status")
    .eq("request_id", requestId)
    .single();

  if (!req || req.status !== "approved") {
    return { error: "복구할 수 없는 요청입니다" };
  }

  const { error: reviewError } = await supabase
    .from("review")
    .update({ deleted_at: null })
    .eq("review_id", req.review_id);
  if (reviewError) {
    // 작성자가 같은 예매 건으로 이미 새 리뷰를 작성한 경우 (부분 유니크 충돌)
    if (reviewError.code === "23505") {
      return { error: "작성자가 이미 새 리뷰를 작성해 복구할 수 없습니다" };
    }
    return { error: reviewError.message };
  }

  const { error } = await supabase
    .from("review_delete_request")
    .update({ status: "rejected" })
    .eq("request_id", requestId)
    .eq("status", "approved");
  if (error) return { error: error.message };

  revalidatePath("/admin/reviews");
  return { success: true };
}

// 리뷰 삭제 요청 거절 = 요청 상태만 rejected 로 변경 (리뷰는 유지)
export async function rejectReviewDeletion(requestId: string) {
  await requireAdmin();
  const supabase = getSupabaseAdmin();

  const { error } = await supabase
    .from("review_delete_request")
    .update({ status: "rejected" })
    .eq("request_id", requestId)
    .eq("status", "pending");

  if (error) return { error: error.message };

  revalidatePath("/admin/reviews");
  return { success: true };
}

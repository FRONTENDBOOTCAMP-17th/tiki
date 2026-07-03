"use server";

import { revalidatePath } from "next/cache";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/auth";

// 리뷰 삭제 요청 승인 = 실제 리뷰 삭제
// review_delete_request 는 review_id 에 on delete cascade 로 묶여 있어
// 리뷰를 지우면 요청 행도 함께 사라진다.
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

  const { error } = await supabase
    .from("review")
    .delete()
    .eq("review_id", req.review_id);

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

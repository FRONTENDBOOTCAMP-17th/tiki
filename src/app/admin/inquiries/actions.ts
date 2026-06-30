"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type AnswerResult = { ok: true } | { ok: false; error: string };

export async function answerInquiry(
  inquiryId: string,
  formData: FormData,
): Promise<AnswerResult> {
  const answer = String(formData.get("answer") ?? "").trim();

  if (answer.length === 0) return { ok: false, error: "답변 내용을 입력해 주세요." };
  if (answer.length > 2000) return { ok: false, error: "답변은 2000자 이내로 입력해 주세요." };

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { ok: false, error: "로그인이 필요합니다." };

  // 이미 답변된 상태인지 확인 (신규 답변일 때만 알림 보내려고)
  const { data: before } = await supabase
    .from("inquiry")
    .select("status")
    .eq("inquiry_id", inquiryId)
    .maybeSingle();

  const wasAnswered = before?.status === "answered";

  const { data, error } = await supabase
    .from("inquiry")
    .update({
      answer,
      status: "answered",
      answered_at: new Date().toISOString(),
      answered_by: user.id,
      updated_at: new Date().toISOString(),
    })
    .eq("inquiry_id", inquiryId)
    .select("inquiry_id");

  if (error) {
    return { ok: false, error: "답변 등록에 실패했습니다. 잠시 후 다시 시도해 주세요." };
  }
  if (!data || data.length === 0) {
    return { ok: false, error: "권한이 없거나 문의를 찾을 수 없습니다." };
  }

  // 신규 답변일 때만 작성자에게 알림 (수정 시엔 중복 알림 방지)
  if (!wasAnswered) {
    const { error: notifyError } = await supabase.rpc("notify_inquiry_answered", {
      p_inquiry_id: inquiryId,
    });
    // 알림 실패해도 답변 자체는 성공 처리 (알림은 부가 기능)
    if (notifyError) {
      console.error("[notify_inquiry_answered]", notifyError);
    }
  }

  revalidatePath("/admin/inquiries");
  revalidatePath(`/admin/inquiries/${inquiryId}`);
  revalidatePath(`/mypage/inquiries/${inquiryId}`);
  return { ok: true };
}

export async function deleteAnswer(inquiryId: string): Promise<AnswerResult> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { ok: false, error: "로그인이 필요합니다." };

  const { data, error } = await supabase
    .from("inquiry")
    .update({
      answer: null,
      status: "pending",
      answered_at: null,
      answered_by: null,
      updated_at: new Date().toISOString(),
    })
    .eq("inquiry_id", inquiryId)
    .select("inquiry_id");

  if (error) {
    return { ok: false, error: "답변 삭제에 실패했습니다. 잠시 후 다시 시도해 주세요." };
  }
  if (!data || data.length === 0) {
    return { ok: false, error: "권한이 없거나 문의를 찾을 수 없습니다." };
  }

  revalidatePath("/admin/inquiries");
  revalidatePath(`/admin/inquiries/${inquiryId}`);
  revalidatePath(`/mypage/inquiries/${inquiryId}`);
  return { ok: true };
}
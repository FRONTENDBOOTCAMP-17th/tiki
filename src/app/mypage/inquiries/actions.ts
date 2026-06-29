"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

const CATEGORIES = ["reservation", "payment", "ticket", "account", "etc"] as const;

export type CreateInquiryResult =
  | { ok: true; inquiryId: string }
  | { ok: false; error: string };

export async function createInquiry(formData: FormData): Promise<CreateInquiryResult> {
  const category = String(formData.get("category") ?? "");
  const title = String(formData.get("title") ?? "").trim();
  const content = String(formData.get("content") ?? "").trim();

  if (!CATEGORIES.includes(category as (typeof CATEGORIES)[number])) {
    return { ok: false, error: "카테고리를 선택해 주세요." };
  }
  if (title.length === 0) return { ok: false, error: "제목을 입력해 주세요." };
  if (title.length > 100) return { ok: false, error: "제목은 100자 이내로 입력해 주세요." };
  if (content.length === 0) return { ok: false, error: "문의 내용을 입력해 주세요." };
  if (content.length > 2000) return { ok: false, error: "문의 내용은 2000자 이내로 입력해 주세요." };

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { ok: false, error: "로그인이 필요합니다." };

  const { data, error } = await supabase
    .from("inquiry")
    .insert({ user_id: user.id, category, title, content })
    .select("inquiry_id")
    .single();

  if (error) {
    return { ok: false, error: "문의 등록에 실패했습니다. 잠시 후 다시 시도해 주세요." };
  }

  revalidatePath("/mypage/inquiries");
  return { ok: true, inquiryId: data.inquiry_id };
}
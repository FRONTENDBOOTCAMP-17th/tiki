"use server";

import { revalidatePath } from "next/cache";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

type NotificationTarget = "all" | "buyer" | "seller" | "specific";

// type 필드에 대상 정보를 인코딩 → 히스토리에서 라벨로 표시
const TARGET_TYPE: Record<NotificationTarget, string> = {
  all: "admin_all",
  buyer: "admin_buyer",
  seller: "admin_seller",
  specific: "admin_specific",
};

export async function sendNotification({
  target,
  userIds,
  title,
}: {
  target: NotificationTarget;
  userIds?: string[];
  title: string;
}) {
  if (!title.trim()) return { error: "알림 내용을 입력해주세요" };

  const supabase = getSupabaseAdmin();

  let targetIds: string[] = [];

  if (target === "specific") {
    if (!userIds || userIds.length === 0) return { error: "발송 대상 회원을 선택해주세요" };
    targetIds = userIds;
  } else {
    let query = supabase.from("users").select("id");
    if (target === "buyer") query = query.eq("role", "buyer");
    if (target === "seller") query = query.eq("role", "seller");
    const { data, error } = await query;
    if (error) return { error: error.message };
    targetIds = (data ?? []).map((u) => u.id);
  }

  if (targetIds.length === 0) return { error: "발송 대상이 없습니다" };

  const rows = targetIds.map((userId) => ({
    user_id: userId,
    type: TARGET_TYPE[target],
    title: title.trim(),
    link: null,
    is_read: false,
  }));

  const { error } = await supabase.from("notification").insert(rows);
  if (error) return { error: error.message };

  revalidatePath("/admin/notifications");
  return { success: true, count: targetIds.length };
}

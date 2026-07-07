"use server";

import { revalidatePath } from "next/cache";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/auth";

type NotificationTarget = "all" | "buyer" | "seller" | "specific";
export type NotificationType = "ad" | "order" | "promo";

// 프로모션(광고)은 제목 앞에 "(광고)"를 강제로 붙인다.
const PROMO_PREFIX = "(광고) ";

export async function sendNotification({
  target,
  userIds,
  title,
  notificationType,
  link,
}: {
  target: NotificationTarget;
  userIds?: string[];
  title: string;
  notificationType: NotificationType;
  link?: string;
}) {
  await requireAdmin();
  if (!title.trim()) return { error: "알림 내용을 입력해주세요" };

  const supabase = getSupabaseAdmin();

  let targetIds: string[] = [];

  if (target === "specific") {
    if (!userIds || userIds.length === 0) return { error: "발송 대상 회원을 선택해주세요" };
    targetIds = userIds;
  } else {
    // 관리자는 발송 대상에서 제외한다. (target "all"에 관리자가 섞여
    // 본인이 보낸 공지를 스스로 수신하는 문제 방지)
    let query = supabase.from("users").select("id").neq("role", "admin");
    if (target === "buyer") query = query.eq("role", "buyer");
    if (target === "seller") query = query.eq("role", "seller");
    const { data, error } = await query;
    if (error) return { error: error.message };
    targetIds = (data ?? []).map((u) => u.id);
  }

  if (targetIds.length === 0) return { error: "발송 대상이 없습니다" };

  const trimmedTitle = title.trim();
  const finalTitle =
    notificationType === "promo" && !trimmedTitle.startsWith(PROMO_PREFIX)
      ? `${PROMO_PREFIX}${trimmedTitle}`
      : trimmedTitle;

  const rows = targetIds.map((userId) => ({
    user_id: userId,
    type: notificationType,
    title: finalTitle,
    link: link?.trim() || null,
    is_read: false,
  }));

  const { error } = await supabase.from("notification").insert(rows);
  if (error) return { error: error.message };

  revalidatePath("/admin/notifications");
  return { success: true, count: targetIds.length };
}

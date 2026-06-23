"use server";

import { redirect } from 'next/navigation';
import { revalidatePath } from "next/cache";
import { createClient } from '@/lib/supabase/server';
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect('/login');
}

// 비밀번호 변경
export async function changePassword(formData: FormData) {
  const current = String(formData.get("currentPassword") ?? "");
  const next = String(formData.get("newPassword") ?? "");

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.email) return { error: "로그인이 필요합니다" };

  // 현재 비밀번호 검증
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: user.email,
    password: current,
  });
  if (signInError) return { error: "현재 비밀번호가 올바르지 않습니다" };

  // 변경
  const { error } = await supabase.auth.updateUser({ password: next });
  if (error) return { error: error.message };

  return { success: true };
}

// 회원 탈퇴
export async function withdraw(formData: FormData) {
  const password = String(formData.get("password") ?? "");

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.email) return { error: "로그인이 필요합니다" };

  // 비밀번호 재인증
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: user.email,
    password,
  });
  if (signInError) return { error: "비밀번호가 올바르지 않습니다" };

  // 계정 삭제 (service role)
  const supabaseAdmin = getSupabaseAdmin();
  await supabaseAdmin.from("users").delete().eq("id", user.id);
  const { error } = await supabaseAdmin.auth.admin.deleteUser(user.id);
  if (error) return { error: error.message };

  await supabase.auth.signOut();
  redirect("/");
}

// 예매 취소
export async function cancelReservation(orderId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "로그인이 필요합니다" };

  const { error } = await supabase
    .from("orders")
    .update({ status: "cancelled" })
    .eq("order_id", orderId)
    .eq("user_id", user.id);
  if (error) return { error: error.message };

  revalidatePath("/mypage/reservations");
  return { success: true };
}
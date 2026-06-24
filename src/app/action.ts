'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { getCurrentUser } from '@/lib/auth';

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect('/login');
}

// 비밀번호 변경
export async function changePassword(formData: FormData) {
  const current = String(formData.get('currentPassword') ?? '');
  const next = String(formData.get('newPassword') ?? '');

  const supabase = await createClient();
  const user = await getCurrentUser();
  if (!user?.email) return { error: '로그인이 필요합니다' };

  // 현재 비밀번호 검증
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: user.email,
    password: current,
  });
  if (signInError) return { error: '현재 비밀번호가 올바르지 않습니다' };

  // 변경
  const { error } = await supabase.auth.updateUser({ password: next });
  if (error) {
    // Supabase 영문 에러 → 한글 매핑
    if (error.message.includes("should be different")) {
      return { error: "새 비밀번호는 현재 비밀번호와 달라야 합니다" };
    }
    if (error.message.includes("at least")) {
      return { error: "비밀번호는 6자 이상이어야 합니다" };
    }
    return { error: "비밀번호 변경에 실패했습니다" };
  }

  return { success: true };
}

// 회원 탈퇴
export async function withdraw(formData: FormData) {
  const password = String(formData.get('password') ?? '');

  const supabase = await createClient();
  const user = await getCurrentUser();
  if (!user?.email) return { error: '로그인이 필요합니다' };

  // 비밀번호 재인증
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: user.email,
    password,
  });
  if (signInError) return { error: '비밀번호가 올바르지 않습니다' };

  // 계정 삭제 (service role)
  const supabaseAdmin = getSupabaseAdmin();
  await supabaseAdmin.from('users').delete().eq('id', user.id);
  const { error } = await supabaseAdmin.auth.admin.deleteUser(user.id);
  if (error) return { error: error.message };

  await supabase.auth.signOut();
  redirect('/');
}

// 예매 취소
export async function cancelReservation(orderId: string) {
  const supabase = await createClient();
  const user = await getCurrentUser();
  if (!user) return { error: "로그인이 필요합니다" };

  const { data, error } = await supabase.rpc("cancel_order", {
    p_order_id: orderId,
  });
  if (error) return { error: error.message };
  if (data === false) return { error: "취소할 수 없는 예매입니다" };

  revalidatePath("/mypage/reservations");
  return { success: true };
}

export async function uploadAvatar(formData: FormData) {
  const file = formData.get("avatar") as File;
  if (!file || file.size === 0) return { error: "파일이 없습니다" };

  const supabase = await createClient();
  const user = await getCurrentUser();
  if (!user) return { error: "로그인이 필요합니다" };

  const path = `${user.id}/avatar.webp`;

  const { error: uploadError } = await supabase.storage
    .from("avatars")
    .upload(path, file, { upsert: true, contentType: "image/webp" });
  if (uploadError) return { error: uploadError.message };

  const {
    data: { publicUrl },
  } = supabase.storage.from("avatars").getPublicUrl(path);

  // 같은 경로 덮어쓰기 시 캐시 갱신용 timestamp
  const url = `${publicUrl}?t=${Date.now()}`;

  const { error } = await supabase
    .from("users")
    .update({ avatar_url: url })
    .eq("id", user.id);
  if (error) return { error: error.message };

  revalidatePath("/mypage", "layout");
  return { url };
}

export async function resetAvatar() {
  const supabase = await createClient();
  const user = await getCurrentUser();
  if (!user) return { error: "로그인이 필요합니다" };

  // Storage 파일 삭제 (없어도 에러 무시)
  await supabase.storage.from("avatars").remove([`${user.id}/avatar.webp`]);

  const { error } = await supabase
    .from("users")
    .update({ avatar_url: null })
    .eq("id", user.id);
  if (error) return { error: error.message };

  revalidatePath("/mypage", "layout");
  return { success: true };
}

export async function sendFriendRequest(email: string) {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("send_friend_request", {
    p_email: email,
  });
  if (error) return { error: error.message };

  revalidatePath("/mypage/friends");
  return data as { success?: boolean; error?: string };
}

export async function acceptFriendRequest(friendId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("accept_friend_request", {
    p_friend_id: friendId,
  });
  if (error) return { error: error.message };
  revalidatePath("/mypage/friends");
  return data as { success?: boolean; error?: string };
}

export async function rejectFriendRequest(friendId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("reject_friend_request", {
    p_friend_id: friendId,
  });
  if (error) return { error: error.message };
  revalidatePath("/mypage/friends");
  return data as { success?: boolean; error?: string };
}

export async function deleteFriend(friendId: string) {
  const supabase = await createClient();
  const me = await getCurrentUser();
  if (!me) return { error: "로그인이 필요합니다" };

  // friend 테이블 delete 정책: 내가 requester든 addressee든 삭제 가능
  const { error } = await supabase
    .from("friend")
    .delete()
    .eq("friend_id", friendId);
  if (error) return { error: error.message };

  revalidatePath("/mypage/friends");
  return { success: true };
}

export async function shareTicket(
  orderId: string,
  sharedWith: string,
  quantity: number,
) {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("share_ticket", {
    p_order_id: orderId,
    p_shared_with: sharedWith,
    p_quantity: quantity,
  });
  if (error) return { error: error.message };

  revalidatePath("/mypage/friends");
  return data as { success?: boolean; error?: string };
}
"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export interface StaffRpcResult {
  code: string;
  staff_id?: string;
  name?: string;
  status?: string;
  role?: string;
}

/** 스태프 초대 (판매자) */
export async function inviteStaff(
  eventId: string,
  email: string,
): Promise<StaffRpcResult> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("invite_event_staff", {
    p_event_id: eventId,
    p_email: email,
  });
  if (error) {
    console.error("invite_event_staff error:", error);
    return { code: "error" };
  }
  revalidatePath("/seller/staff");
  return data as unknown as StaffRpcResult;
}

/** 초대 수락 (스태프) */
export async function acceptStaffInvite(
  staffId: string,
): Promise<StaffRpcResult> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("accept_staff_invite", {
    p_staff_id: staffId,
  });
  if (error) {
    console.error("accept_staff_invite error:", error);
    return { code: "error" };
  }
  revalidatePath("/staff");
  return data as unknown as StaffRpcResult;
}

/** 초대 거절 (스태프) */
export async function rejectStaffInvite(
  staffId: string,
): Promise<StaffRpcResult> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("reject_staff_invite", {
    p_staff_id: staffId,
  });
  if (error) {
    console.error("reject_staff_invite error:", error);
    return { code: "error" };
  }
  revalidatePath("/staff");
  return data as unknown as StaffRpcResult;
}

/** 배정 해제 (판매자) */
export async function removeStaff(staffId: string): Promise<StaffRpcResult> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("remove_event_staff", {
    p_staff_id: staffId,
  });
  if (error) {
    console.error("remove_event_staff error:", error);
    return { code: "error" };
  }
  revalidatePath("/seller/staff");
  return data as unknown as StaffRpcResult;
}
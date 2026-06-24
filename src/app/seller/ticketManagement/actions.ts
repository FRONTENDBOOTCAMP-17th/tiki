"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export async function cancelOrder(orderId: string) {
  const user = await getCurrentUser();
  if (!user) throw new Error("unauthorized");

  const supabase = await createClient();
  const { data: cancelled, error } = await supabase.rpc("cancel_order", {
    p_order_id: orderId,
  });

  if (error || !cancelled) throw new Error("cancel_failed");

  revalidatePath("/seller/ticketManagement");
  revalidatePath("/seller/settlement");
  revalidatePath("/mypage/reservations");
}

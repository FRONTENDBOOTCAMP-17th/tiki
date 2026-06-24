"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export async function cancelOrder(orderId: string) {
  const user = await getCurrentUser();
  if (!user) throw new Error("unauthorized");

  const supabase = await createClient();
  const { error } = await supabase
    .from("orders")
    .update({ status: "cancelled" })
    .eq("order_id", orderId);

  if (error) throw new Error("cancel_failed");

  await getSupabaseAdmin().from("review").delete().eq("order_id", orderId);

  revalidatePath("/seller/ticketManagement");
}

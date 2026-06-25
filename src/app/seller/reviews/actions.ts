"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export async function requestReviewDeletion(reviewId: string, reason: string) {
  const user = await getCurrentUser();
  if (!user) throw new Error("unauthorized");

  const supabase = await createClient();
  const { data: ok, error } = await supabase.rpc("request_review_deletion", {
    p_review_id: reviewId,
    p_reason: reason,
  });

  if (error || !ok) throw new Error("request_failed");

  revalidatePath("/seller/reviews");
}

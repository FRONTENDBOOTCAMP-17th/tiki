"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import { getReviewValidationMessage } from "./validation";

type ReviewActionResult = {
  success: boolean;
  message: string;
};

type ReviewLikeActionResult = ReviewActionResult & {
  liked: boolean;
  likeCount: number;
};

export async function createReviewAction(input: {
  eventId: string;
  orderId: string;
  rating: number;
  memo: string;
}): Promise<ReviewActionResult> {
  const eventId = input.eventId.trim();
  const orderId = input.orderId.trim();
  const rating = Number(input.rating);
  const memo = input.memo.trim();

  if (!eventId || !orderId) {
    return { success: false, message: "관람한 회차를 선택해 주세요." };
  }

  const invalidMessage = getReviewValidationMessage(rating, memo);
  if (invalidMessage) {
    return { success: false, message: invalidMessage };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, message: "로그인이 필요합니다." };
  }

  const { error } = await supabase.from("review").insert({
    event_id: eventId,
    order_id: orderId,
    user_id: user.id,
    rating,
    memo,
  });

  if (error) {
    if (error.code === "23505") {
      return {
        success: false,
        message: "이미 후기를 작성한 예매 건입니다.",
      };
    }
    return { success: false, message: "후기를 등록할 수 없습니다." };
  }

  revalidatePath(`/${eventId}`);
  return { success: true, message: "후기가 등록되었습니다." };
}

export async function updateReviewAction(input: {
  eventId: string;
  reviewId: string;
  rating: number;
  memo: string;
}): Promise<ReviewActionResult> {
  const eventId = input.eventId.trim();
  const reviewId = input.reviewId.trim();
  const rating = Number(input.rating);
  const memo = input.memo.trim();

  if (!eventId || !reviewId) {
    return { success: false, message: "수정할 후기를 찾을 수 없습니다." };
  }

  const invalidMessage = getReviewValidationMessage(rating, memo);
  if (invalidMessage) {
    return { success: false, message: invalidMessage };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, message: "로그인이 필요합니다." };
  }

  const { data, error } = await supabase
    .from("review")
    .update({ rating, memo })
    .eq("review_id", reviewId)
    .eq("user_id", user.id)
    .select("review_id")
    .maybeSingle();

  if (error) {
    return { success: false, message: "후기를 수정할 수 없습니다." };
  }
  if (!data) {
    return { success: false, message: "수정할 후기를 찾을 수 없습니다." };
  }

  revalidatePath(`/${eventId}`);
  return { success: true, message: "후기가 수정되었습니다." };
}

export async function deleteReviewAction(input: {
  eventId: string;
  reviewId: string;
}): Promise<ReviewActionResult> {
  const eventId = input.eventId.trim();
  const reviewId = input.reviewId.trim();

  if (!eventId || !reviewId) {
    return { success: false, message: "삭제할 후기를 찾을 수 없습니다." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, message: "로그인이 필요합니다." };
  }

  const { data, error } = await supabase
    .from("review")
    .delete()
    .eq("review_id", reviewId)
    .eq("user_id", user.id)
    .select("review_id")
    .maybeSingle();

  if (error) {
    return { success: false, message: "후기를 삭제할 수 없습니다." };
  }
  if (!data) {
    return { success: false, message: "삭제할 후기를 찾을 수 없습니다." };
  }

  revalidatePath(`/${eventId}`);
  return { success: true, message: "후기가 삭제되었습니다." };
}

export async function toggleReviewLikeAction(input: {
  eventId: string;
  reviewId: string;
  liked: boolean;
}): Promise<ReviewLikeActionResult> {
  const eventId = input.eventId.trim();
  const reviewId = input.reviewId.trim();

  if (!eventId || !reviewId) {
    return {
      success: false,
      message: "후기를 찾을 수 없습니다.",
      liked: input.liked,
      likeCount: 0,
    };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      success: false,
      message: "로그인이 필요합니다.",
      liked: input.liked,
      likeCount: 0,
    };
  }

  if (input.liked) {
    const { error } = await supabase
      .from("review_like")
      .delete()
      .eq("review_id", reviewId)
      .eq("user_id", user.id);

    if (error) {
      return {
        success: false,
        message: "좋아요를 취소할 수 없습니다.",
        liked: input.liked,
        likeCount: 0,
      };
    }
  } else {
    const { error } = await supabase.from("review_like").insert({
      review_id: reviewId,
      user_id: user.id,
    });

    if (error && error.code !== "23505") {
      return {
        success: false,
        message: "좋아요를 누를 수 없습니다.",
        liked: input.liked,
        likeCount: 0,
      };
    }
  }

  const { count } = await supabase
    .from("review_like")
    .select("*", { count: "exact", head: true })
    .eq("review_id", reviewId);

  revalidatePath(`/${eventId}`);
  return {
    success: true,
    message: "ok",
    liked: !input.liked,
    likeCount: count ?? 0,
  };
}

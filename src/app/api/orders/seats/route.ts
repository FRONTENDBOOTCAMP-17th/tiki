import { NextRequest } from "next/server";

import { fail, success } from "@/lib/api/api-response";
import { MAX_TICKETS_PER_ORDER } from "@/lib/constants/order-status";
import { createClient } from "@/lib/supabase/server";

const FEE_RATE = 0.05;

interface SeatOrderRequestBody {
  eventId?: string;
  slotId?: string;
  ticketGradeId?: string;
  seatIds?: string[];
}

// 좌석 배치도가 있는 이벤트의 주문 생성. /api/orders(수량 기반)와 별개 경로.
export async function POST(req: NextRequest) {
  const body = (await req.json()) as SeatOrderRequestBody;
  const { eventId, slotId, ticketGradeId, seatIds } = body;

  if (
    !eventId ||
    !slotId ||
    !ticketGradeId ||
    !Array.isArray(seatIds) ||
    seatIds.length === 0
  ) {
    return fail("invalid order payload", 400);
  }

  if (seatIds.length > MAX_TICKETS_PER_ORDER) {
    return fail(`한 번에 최대 ${MAX_TICKETS_PER_ORDER}석까지 선택할 수 있습니다.`, 400);
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return fail("unauthorized", 401);
  }

  const { data: event, error: eventError } = await supabase
    .from("event")
    .select("status")
    .eq("event_id", eventId)
    .single();
  if (eventError || !event) return fail("event not found", 404);
  if (event.status !== "공개") return fail("event not available", 400);

  const { data: grade, error: gradeError } = await supabase
    .from("ticket_grade")
    .select("event_id, price")
    .eq("grade_id", ticketGradeId)
    .single();
  if (gradeError || !grade || grade.event_id !== eventId) {
    return fail("ticket grade not found", 404);
  }

  const { data: slot, error: slotError } = await supabase
    .from("slot")
    .select("event_id, is_closed")
    .eq("slot_id", slotId)
    .single();
  if (slotError || !slot || slot.event_id !== eventId) {
    return fail("slot not found", 404);
  }
  if (slot.is_closed) {
    return fail("slot is closed", 400);
  }

  const subtotal = grade.price * seatIds.length;
  const totalPrice = subtotal + Math.round(subtotal * FEE_RATE);

  const { data: orderId, error } = await supabase.rpc("place_seat_order", {
    p_event_id: eventId,
    p_slot_id: slotId,
    p_grade_id: ticketGradeId,
    p_seat_ids: seatIds,
    p_total_price: totalPrice,
  });
  if (error) {
    if (error.message.includes("TOO_MANY_SEATS")) {
      return fail(`한 번에 최대 ${MAX_TICKETS_PER_ORDER}석까지 선택할 수 있습니다.`, 400);
    }
    if (error.message.includes("SEAT_TAKEN")) {
      return fail("이미 선택된 좌석이 있습니다. 다시 선택해주세요.", 409);
    }
    if (error.message.includes("SOLD_OUT")) {
      return fail("잔여 수량이 부족합니다.", 409);
    }
    if (error.message.includes("UNAUTHORIZED")) {
      return fail("unauthorized", 401);
    }
    return fail("주문을 처리할 수 없습니다.", 400);
  }

  return success({ orderId }, "created", 201);
}

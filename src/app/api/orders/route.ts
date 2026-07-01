import { NextRequest } from "next/server";

import { fail, success } from "@/lib/api/api-response";
import { MAX_TICKETS_PER_ORDER, ORDER_STATUS } from "@/lib/constants/order-status";
import { createClient } from "@/lib/supabase/server";

const ALLOWED_CREATE_STATUSES = new Set<string>([ORDER_STATUS.ORDERED]);
const FEE_RATE = 0.05;

interface OrderRequestBody {
  eventId?: string;
  slotId?: string;
  ticketGradeId?: string;
  quantity?: number;
  status?: string;
}

export async function POST(req: NextRequest) {
  const body = (await req.json()) as OrderRequestBody;
  const { eventId, slotId, ticketGradeId, status = ORDER_STATUS.ORDERED } = body;
  const quantity = Number(body.quantity);

  if (
    !eventId ||
    !slotId ||
    !ticketGradeId ||
    !Number.isInteger(quantity) ||
    quantity < 1
  ) {
    return fail("invalid order payload", 400);
  }
  if (quantity > MAX_TICKETS_PER_ORDER) {
    return fail(`한 번에 최대 ${MAX_TICKETS_PER_ORDER}매까지 구매할 수 있습니다.`, 400);
  }
  if (!ALLOWED_CREATE_STATUSES.has(status)) {
    return fail("invalid order status", 400);
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
    .select("event_id, price, quantity")
    .eq("grade_id", ticketGradeId)
    .single();
  if (gradeError || !grade || grade.event_id !== eventId) {
    return fail("ticket grade not found", 404);
  }
  if (grade.quantity < quantity) {
    return fail("not enough tickets", 400);
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

  const subtotal = grade.price * quantity;
  const totalPrice = subtotal + Math.round(subtotal * FEE_RATE);

  const { data: orderId, error } = await supabase.rpc("place_order", {
    p_event_id: eventId,
    p_slot_id: slotId,
    p_grade_id: ticketGradeId,
    p_quantity: quantity,
    p_total_price: totalPrice,
    p_status: status,
  });
  if (error) {
    if (error.message.includes("SOLD_OUT")) {
      return fail("잔여 수량이 부족합니다.", 409);
    }
    if (error.message.includes("INVALID_QUANTITY")) {
      return fail("invalid order payload", 400);
    }
    if (error.message.includes("UNAUTHORIZED")) {
      return fail("unauthorized", 401);
    }
    return fail("주문을 처리할 수 없습니다.", 400);
  }

  return success({ orderId }, "created", 201);
}

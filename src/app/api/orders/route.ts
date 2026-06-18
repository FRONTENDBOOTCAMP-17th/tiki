import { NextRequest } from "next/server";

import { fail, success } from "@/lib/api/api-response";
import { createClient } from "@/lib/supabase/server";
import type { TablesInsert } from "@/types/database";

const ORDER_STATUSES = new Set(["cart", "ordered"]);
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
  const { eventId, slotId, ticketGradeId, status = "ordered" } = body;
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
  if (!ORDER_STATUSES.has(status)) {
    return fail("invalid order status", 400);
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return fail("unauthorized", 401);
  }

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
  const order: TablesInsert<"orders"> = {
    event_id: eventId,
    slot_id: slotId,
    ticket_grade_id: ticketGradeId,
    quantity,
    status,
    total_price: totalPrice,
    user_id: user.id,
  };

  const { data, error } = await supabase
    .from("orders")
    .insert(order)
    .select("order_id")
    .single();
  if (error) {
    return fail(error.message, 400);
  }

  return success({ orderId: data.order_id }, "created", 201);
}

import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import SettlementView from "./_components/SettlementView";
import type { BankAccount, SettlementOrder } from "./types";

export default async function SettlementPage() {
  const user = await requireUser();
  const supabase = await createClient();

  const { data: store } = await supabase
    .from("seller_stores")
    .select("bank_name, bank_account_number, bank_holder_name")
    .eq("user_id", user.id)
    .single();

  const { data: eventRows } = await supabase
    .from("event")
    .select("event_id, title")
    .eq("seller_id", user.id);

  const events = eventRows ?? [];
  const eventIds = events.map((event) => event.event_id);
  const titleMap = new Map(events.map((e) => [e.event_id, e.title]));

  const { data: orderRows } = eventIds.length
    ? await supabase
        .from("orders")
        .select("event_id, total_price, quantity, status, created_at")
        .in("event_id", eventIds)
    : { data: [] };

  const orders: SettlementOrder[] = (orderRows ?? []).map((order) => ({
    event_id: order.event_id,
    event_title: titleMap.get(order.event_id) ?? "알 수 없음",
    amount: order.total_price,
    quantity: order.quantity,
    status: order.status,
    month: (order.created_at ?? "").slice(0, 7),
  }));

  return (
    <SettlementView
      orders={orders}
      bank={(store ?? null) as BankAccount | null}
    />
  );
}

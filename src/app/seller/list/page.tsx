import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import EventList from "./_components/EventList";
import { sumCapacityByEvent, sumOrdersByEvent } from "../_lib/stats";
import type { Event, EventListItem } from "./types";

export default async function Page() {
  const user = await requireUser();
  const supabase = await createClient();

  const { data: events, error: eventsError } = await supabase
    .from("event")
    .select("*")
    .eq("seller_id", user.id)
    .order("created_at", { ascending: false });

  if (eventsError) {
    throw new Error(eventsError.message);
  }

  if (!events?.length) {
    return <EventList events={[]} />;
  }

  const eventIds = events.map((event) => event.event_id);

  const [
    { data: orders, error: ordersError },
    { data: grades, error: gradesError },
  ] = await Promise.all([
    supabase
      .from("orders")
      .select("event_id, quantity, total_price")
      .in("event_id", eventIds),

    supabase
      .from("ticket_grade")
      .select("event_id, quantity")
      .in("event_id", eventIds),
  ]);

  if (ordersError) {
    throw new Error(ordersError.message);
  }

  if (gradesError) {
    throw new Error(gradesError.message);
  }

  const orderStats = sumOrdersByEvent(orders ?? []);
  const capacityMap = sumCapacityByEvent(grades ?? []);

  const list: EventListItem[] = events.map((event: Event) => {
    const stats = orderStats.get(event.event_id);
    const capacity = capacityMap.get(event.event_id) ?? 0;

    const totalOrders = stats?.totalOrders ?? 0;
    const totalRevenue = stats?.totalRevenue ?? 0;

    return {
      ...event,
      totalOrders,
      totalRevenue,
      remainingSeats: Math.max(0, capacity - totalOrders),
    };
  });

  return <EventList events={list} />;
}

import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import EventDetailView from "./_components/EventDetailView";
import type { EventDetail, Grade, Slot } from "@/app/seller/events/types";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await requireUser();
  const supabase = await createClient();

  const { data: event } = await supabase
    .from("event")
    .select("*")
    .eq("event_id", id)
    .eq("seller_id", user.id)
    .single();

  if (!event) notFound();

  const [
    { data: gradeRows },
    { data: orderRows },
    { data: imageRows },
    { data: slotRows },
  ] = await Promise.all([
    supabase
      .from("ticket_grade")
      .select("grade_id, grade_name, price, quantity")
      .eq("event_id", id),
    supabase
      .from("orders")
      .select("quantity, total_price")
      .eq("event_id", id)
      .eq("status", "paid"),
    supabase
      .from("event_image")
      .select("image_id, url")
      .eq("event_id", id)
      .order("order"),
    supabase
      .from("slot")
      .select("slot_id, date, start_time, end_time")
      .eq("event_id", id)
      .order("date"),
  ]);

  const grades = (gradeRows ?? []) as Grade[];
  const images = (imageRows ?? []) as { image_id: string; url: string }[];
  const slots = (slotRows ?? []) as Slot[];
  const orders = (orderRows ?? []) as {
    quantity: number;
    total_price: number;
  }[];

  const totalOrders = orders.reduce((sum, o) => sum + o.quantity, 0);
  const totalRevenue = orders.reduce((sum, o) => sum + o.total_price, 0);
  const capacity = grades.reduce((sum, g) => sum + g.quantity, 0);

  return (
    <EventDetailView
      event={event as EventDetail}
      grades={grades}
      images={images}
      slots={slots}
      stats={{
        totalOrders,
        totalRevenue,
        remainingSeats: Math.max(0, capacity - totalOrders),
      }}
    />
  );
}

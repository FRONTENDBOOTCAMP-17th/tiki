import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import EventEditForm, { type SlotRow } from "./_components/EventEditForm";
import type { EventDetail, CategoryOption } from "@/app/seller/events/types";

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

  const [{ data: categoryRows }, { data: imageRows }, { data: slotRows }] =
    await Promise.all([
      supabase
        .from("category")
        .select("category_id, category_name")
        .order("display_order"),
      supabase
        .from("event_image")
        .select("url")
        .eq("event_id", id)
        .order("order"),
      supabase
        .from("slot")
        .select("slot_id, date, start_time, end_time")
        .eq("event_id", id)
        .order("date")
        .order("start_time"),
    ]);

  const thumbnail = (event as EventDetail).thumbnail;
  const detailUrls = (imageRows ?? []).map((row) => row.url as string);

  return (
    <EventEditForm
      event={event as EventDetail}
      categories={(categoryRows ?? []) as CategoryOption[]}
      initialThumbnail={thumbnail || null}
      initialDetails={detailUrls}
      initialSlots={(slotRows ?? []) as SlotRow[]}
    />
  );
}

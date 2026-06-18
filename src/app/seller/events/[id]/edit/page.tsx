import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import EventEditForm from "./_components/EventEditForm";
import type { EventDetail, CategoryOption } from "@/app/seller/events/types";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: event } = await supabase
    .from("event")
    .select("*")
    .eq("event_id", id)
    .eq("seller_id", user!.id)
    .single();

  if (!event) notFound();

  const { data: categoryRows } = await supabase
    .from("category")
    .select("category_id, category_name")
    .order("display_order");

  return (
    <EventEditForm
      event={event as EventDetail}
      categories={(categoryRows ?? []) as CategoryOption[]}
    />
  );
}

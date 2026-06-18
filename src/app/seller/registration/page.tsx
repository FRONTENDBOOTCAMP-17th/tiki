import { createClient } from "@/lib/supabase/server";
import EventCreateForm from "./_components/EventCreateForm";
import type { CategoryOption } from "@/app/seller/events/types";

export default async function RegistrationPage() {
  const supabase = await createClient();

  const { data: categoryRows } = await supabase
    .from("category")
    .select("category_id, category_name")
    .order("display_order");

  return (
    <EventCreateForm categories={(categoryRows ?? []) as CategoryOption[]} />
  );
}

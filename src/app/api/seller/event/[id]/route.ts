import { getCurrentUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { fail, success } from "@/lib/api/api-response";
import { NextRequest } from "next/server";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const body = await req.json();

  const user = await getCurrentUser();
  if (!user) return fail("unauthorized", 401);

  const supabase = await createClient();

  const fields: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };
  if (body.title !== undefined) fields.title = body.title;
  if (body.categoryId !== undefined) fields.category_id = body.categoryId;
  if (body.status !== undefined) fields.status = body.status;
  if (body.description !== undefined) fields.description = body.description;
  if (body.venueName !== undefined) fields.venue_name = body.venueName;
  if (body.venueAddress !== undefined) fields.venue_address = body.venueAddress;
  if (body.venueDetailAddress !== undefined)
    fields.venue_detail_address = body.venueDetailAddress;
  if (body.startDate !== undefined) fields.start_date = body.startDate;
  if (body.endDate !== undefined) fields.end_date = body.endDate;
  if (body.startTime !== undefined) fields.start_time = body.startTime;
  if (body.duration !== undefined)
    fields.duration = body.duration ? Number(body.duration) : null;
  if (body.intermission !== undefined)
    fields.intermission = body.intermission ? Number(body.intermission) : null;

  const { error } = await supabase
    .from("event")
    .update(fields)
    .eq("event_id", id)
    .eq("seller_id", user.id);

  if (error) return fail(error.message);

  return success(null, "updated");
}

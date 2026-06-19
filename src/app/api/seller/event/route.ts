import { getCurrentUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { fail, success } from "@/lib/api/api-response";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  const body = await req.json();

  const user = await getCurrentUser();
  if (!user) return fail("unauthorized", 401);

  const supabase = await createClient();

  if (!body.title || !body.categoryId) return fail("empty_required");

  const slots = (body.slots ?? []).filter(
    (s: { date?: string; startTime?: string }) => s.date && s.startTime,
  );
  if (slots.length === 0) return fail("empty_slots");

  const dates = slots.map((s: { date: string }) => s.date).sort();
  const startDate = dates[0];
  const endDate = dates[dates.length - 1];
  const startTime = slots[0].startTime;

  const now = new Date().toISOString();

  const { data: created, error } = await supabase
    .from("event")
    .insert({
      seller_id: user.id,
      category_id: body.categoryId,
      title: body.title,
      description: body.description || null,
      status: "비공개",
      start_date: startDate,
      end_date: endDate,
      start_time: startTime,
      duration: body.duration ? Number(body.duration) : null,
      intermission: body.intermission ? Number(body.intermission) : null,
      venue_name: body.venueName,
      venue_address: body.venueAddress,
      venue_detail_address: body.venueDetailAddress || null,
      thumbnail: body.thumbnail || "",
      created_at: now,
      updated_at: now,
    })
    .select("event_id")
    .single();

  if (error) return fail(error.message);

  const eventId = (created as { event_id: string } | null)?.event_id;
  if (!eventId) return fail("create_failed");

  const images = (body.images ?? [])
    .filter((url: string) => url)
    .map((url: string, i: number) => ({
      event_id: eventId,
      url,
      order: i,
      created_at: now,
    }));

  if (images.length > 0) {
    await supabase.from("event_image").insert(images);
  }

  const grades = (body.grades ?? [])
    .filter((g: { name?: string; price?: string }) => g.name && g.price)
    .map((g: { name: string; price: string; quantity: string }) => ({
      event_id: eventId,
      grade_name: g.name,
      price: Number(g.price),
      quantity: Number(g.quantity) || 0,
      created_at: now,
    }));

  if (grades.length > 0) {
    const { error: gradeError } = await supabase
      .from("ticket_grade")
      .insert(grades);
    if (gradeError) return fail(gradeError.message);
  }

  const slotRows = slots.map(
    (s: { date: string; startTime: string; endTime: string }) => ({
      event_id: eventId,
      date: s.date,
      start_time: s.startTime,
      end_time: s.endTime || s.startTime,
      is_closed: false,
      created_at: now,
    }),
  );

  const { error: slotError } = await supabase.from("slot").insert(slotRows);
  if (slotError) return fail(slotError.message);

  return success({ eventId }, "event_created");
}

import { fail, success } from "@/lib/api/api-response";
import { requireUserApi } from "@/lib/api/require-user";
import { NextRequest } from "next/server";
import { SELLER_EVENT_LIMITS } from "@/app/seller/_lib/limits";
import { generateDefaultLayout } from "@/lib/seat/defaultLayout";

interface EventCreateBody {
  title?: unknown;
  categoryId?: unknown;
  description?: unknown;
  duration?: unknown;
  intermission?: unknown;
  venueName?: unknown;
  venueAddress?: unknown;
  venueDetailAddress?: unknown;
  thumbnail?: unknown;
  images?: unknown;
  slots?: unknown;
  grades?: unknown;
}

interface SlotInput {
  date: string;
  startTime: string;
  endTime: string;
}

interface GradeInput {
  name: string;
  price: number;
  quantity: number;
}

const timePattern = /^([01]\d|2[0-3]):[0-5]\d$/;

function text(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function positiveNumber(value: unknown) {
  const num = Number(value);
  return Number.isFinite(num) ? num : 0;
}

function isDateText(value: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(value));
}

function toMinutes(value: string) {
  const [hour, minute] = value.split(":").map(Number);
  return hour * 60 + minute;
}

function hasOverlap(slots: SlotInput[]) {
  const byDate = new Map<string, SlotInput[]>();

  for (const slot of slots) {
    byDate.set(slot.date, [...(byDate.get(slot.date) ?? []), slot]);
  }

  for (const dateSlots of byDate.values()) {
    const sorted = [...dateSlots].sort(
      (a, b) => toMinutes(a.startTime) - toMinutes(b.startTime),
    );

    for (let i = 1; i < sorted.length; i++) {
      if (toMinutes(sorted[i].startTime) < toMinutes(sorted[i - 1].endTime)) {
        return true;
      }
    }
  }

  return false;
}

export async function POST(req: NextRequest) {
  const body = (await req.json()) as EventCreateBody;

  const ctx = await requireUserApi();
  if ("error" in ctx) return ctx.error;
  const { user, supabase } = ctx;

  const title = text(body.title);
  const categoryId = text(body.categoryId);
  const description = text(body.description);
  const venueName = text(body.venueName);
  const venueAddress = text(body.venueAddress);
  const venueDetailAddress = text(body.venueDetailAddress);
  const duration = positiveNumber(body.duration);
  const intermission = positiveNumber(body.intermission);

  if (!title || !categoryId || !venueName || !venueAddress) {
    return fail("empty_required");
  }
  if (title.length > SELLER_EVENT_LIMITS.maxTitleLength) {
    return fail("title_too_long");
  }
  if (description.length > SELLER_EVENT_LIMITS.maxDescriptionLength) {
    return fail("description_too_long");
  }
  if (venueName.length > SELLER_EVENT_LIMITS.maxVenueNameLength) {
    return fail("venue_name_too_long");
  }
  if (venueDetailAddress.length > SELLER_EVENT_LIMITS.maxVenueDetailLength) {
    return fail("venue_detail_too_long");
  }
  if (
    duration < SELLER_EVENT_LIMITS.minDuration ||
    duration > SELLER_EVENT_LIMITS.maxDuration
  ) {
    return fail("invalid_duration");
  }
  if (intermission < 0 || intermission > SELLER_EVENT_LIMITS.maxIntermission) {
    return fail("invalid_intermission");
  }

  const slots = Array.isArray(body.slots)
    ? body.slots
        .map((slot) => ({
          date: text((slot as { date?: unknown }).date),
          startTime: text((slot as { startTime?: unknown }).startTime),
          endTime: text((slot as { endTime?: unknown }).endTime),
        }))
        .filter((slot) => slot.date && slot.startTime && slot.endTime)
    : [];

  if (slots.length === 0) return fail("empty_slots");
  if (slots.length > SELLER_EVENT_LIMITS.maxSlotsPerEvent) {
    return fail("too_many_slots");
  }
  if (
    slots.some(
      (slot) =>
        !isDateText(slot.date) ||
        !timePattern.test(slot.startTime) ||
        !timePattern.test(slot.endTime) ||
        toMinutes(slot.endTime) <= toMinutes(slot.startTime),
    )
  ) {
    return fail("invalid_slots");
  }
  if (hasOverlap(slots)) return fail("overlap_slots");

  const dates = slots.map((s) => s.date).sort();
  const startDate = dates[0];
  const endDate = dates[dates.length - 1];
  const startTime = slots[0].startTime;
  const rangeDays =
    (new Date(endDate).getTime() - new Date(startDate).getTime()) /
      1000 /
      60 /
      60 /
      24 +
    1;

  if (rangeDays > SELLER_EVENT_LIMITS.maxDateRangeDays) {
    return fail("date_range_too_long");
  }

  const grades: GradeInput[] = Array.isArray(body.grades)
    ? body.grades
        .map((grade) => ({
          name: text((grade as { name?: unknown }).name),
          price: positiveNumber((grade as { price?: unknown }).price),
          quantity: positiveNumber((grade as { quantity?: unknown }).quantity),
        }))
        .filter((grade) => grade.name && grade.price > 0 && grade.quantity > 0)
    : [];

  const totalSeats = grades.reduce((sum, grade) => sum + grade.quantity, 0);
  if (grades.length === 0) return fail("empty_grades");
  if (totalSeats > SELLER_EVENT_LIMITS.maxSeatsPerEvent) {
    return fail("too_many_seats");
  }
  if (grades.some((grade) => grade.price > SELLER_EVENT_LIMITS.maxPrice)) {
    return fail("price_too_high");
  }

  const images = Array.isArray(body.images)
    ? body.images.map(text).filter(Boolean)
    : [];
  if (images.length > SELLER_EVENT_LIMITS.maxImagesPerEvent - 1) {
    return fail("too_many_images");
  }

  const now = new Date().toISOString();

  const { data: created, error } = await supabase
    .from("event")
    .insert({
      seller_id: user.id,
      category_id: categoryId,
      title,
      description: description || null,
      status: "비공개",
      start_date: startDate,
      end_date: endDate,
      start_time: startTime,
      duration,
      intermission,
      venue_name: venueName,
      venue_address: venueAddress,
      venue_detail_address: venueDetailAddress || null,
      thumbnail: text(body.thumbnail),
      created_at: now,
      updated_at: now,
    })
    .select("event_id")
    .single();

  if (error) return fail("event_create_failed", 500);

  const eventId = (created as { event_id: string } | null)?.event_id;
  if (!eventId) return fail("create_failed");

  const imageRows = images.map((url, i) => ({
      event_id: eventId,
      url,
      order: i,
      created_at: now,
    }));

  if (imageRows.length > 0) {
    await supabase.from("event_image").insert(imageRows);
  }

  const gradeRows = grades.map((grade) => ({
      event_id: eventId,
      grade_name: grade.name,
      price: grade.price,
      quantity: grade.quantity,
      created_at: now,
    }));

  let insertedGrades: { grade_id: string; grade_name: string; quantity: number }[] = [];
  if (gradeRows.length > 0) {
    const { data: gradeData, error: gradeError } = await supabase
      .from("ticket_grade")
      .insert(gradeRows)
      .select("grade_id, grade_name, quantity");
    if (gradeError) return fail("grade_create_failed", 500);
    insertedGrades = gradeData ?? [];
  }

  const slotRows = slots.map((slot) => ({
      event_id: eventId,
      date: slot.date,
      start_time: slot.startTime,
      end_time: slot.endTime,
      is_closed: false,
      created_at: now,
    }));

  const { error: slotError } = await supabase.from("slot").insert(slotRows);
  if (slotError) return fail("slot_create_failed", 500);

  // 기본 좌석 배치도를 자동 생성한다: 사각형 그리드를 채우고,
  // 입력한 등급 순서대로(일반석을 다 채운 뒤 VIP석 순) 등급을 매긴다.
  const orderedGrades = grades
    .map((g) => insertedGrades.find((row) => row.grade_name === g.name))
    .filter((row): row is { grade_id: string; grade_name: string; quantity: number } => !!row)
    .map((row) => ({ gradeId: row.grade_id, quantity: row.quantity }));

  if (orderedGrades.length > 0) {
    const defaultLayout = generateDefaultLayout(orderedGrades);
    const { data: layout, error: layoutError } = await supabase
      .from("seat_layout")
      .insert({
        event_id: eventId,
        stage_x: defaultLayout.stage.x,
        stage_y: defaultLayout.stage.y,
        stage_width: defaultLayout.stage.width,
        stage_height: defaultLayout.stage.height,
        created_at: now,
        updated_at: now,
      })
      .select("layout_id")
      .single();

    if (!layoutError && layout && defaultLayout.seats.length > 0) {
      await supabase.from("seat").insert(
        defaultLayout.seats.map((seat) => ({
          layout_id: layout.layout_id,
          label: seat.label,
          pos_x: seat.x,
          pos_y: seat.y,
          grade_id: seat.gradeId,
        })),
      );
    }
  }

  return success({ eventId }, "event_created");
}

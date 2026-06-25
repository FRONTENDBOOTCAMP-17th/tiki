import { fail, success } from "@/lib/api/api-response";
import { requireUserApi } from "@/lib/api/require-user";
import { NextRequest } from "next/server";
import { SELLER_EVENT_LIMITS } from "@/app/seller/_lib/limits";

interface EventUpdateBody {
  title?: unknown;
  categoryId?: unknown;
  status?: unknown;
  description?: unknown;
  venueName?: unknown;
  venueAddress?: unknown;
  venueDetailAddress?: unknown;
  startDate?: unknown;
  endDate?: unknown;
  startTime?: unknown;
  duration?: unknown;
  intermission?: unknown;
  thumbnail?: unknown;
  images?: unknown;
  slots?: unknown;
  removedSlotIds?: unknown;
}

const timePattern = /^([01]\d|2[0-3]):[0-5]\d$/;

function text(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function optionalNumber(value: unknown) {
  if (value === "" || value === null || value === undefined) return null;
  const num = Number(value);
  return Number.isFinite(num) ? num : null;
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const body = (await req.json()) as EventUpdateBody;

  const ctx = await requireUserApi();
  if ("error" in ctx) return ctx.error;
  const { user, supabase } = ctx;

  const fields: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };

  if (body.title !== undefined) {
    const title = text(body.title);
    if (!title) return fail("empty_title");
    if (title.length > SELLER_EVENT_LIMITS.maxTitleLength) {
      return fail("title_too_long");
    }
    fields.title = title;
  }
  if (body.categoryId !== undefined) fields.category_id = text(body.categoryId);
  if (body.status !== undefined) {
    const status = text(body.status);
    if (status !== "공개" && status !== "비공개") return fail("invalid_status");
    fields.status = status;
  }
  if (body.description !== undefined) {
    const description = text(body.description);
    if (description.length > SELLER_EVENT_LIMITS.maxDescriptionLength) {
      return fail("description_too_long");
    }
    fields.description = description || null;
  }
  if (body.venueName !== undefined) {
    const venueName = text(body.venueName);
    if (!venueName) return fail("empty_venue_name");
    if (venueName.length > SELLER_EVENT_LIMITS.maxVenueNameLength) {
      return fail("venue_name_too_long");
    }
    fields.venue_name = venueName;
  }
  if (body.venueAddress !== undefined) {
    const venueAddress = text(body.venueAddress);
    if (!venueAddress) return fail("empty_venue_address");
    fields.venue_address = venueAddress;
  }
  if (body.venueDetailAddress !== undefined)
    fields.venue_detail_address = text(body.venueDetailAddress) || null;
  if (body.startDate !== undefined) fields.start_date = text(body.startDate);
  if (body.endDate !== undefined) fields.end_date = text(body.endDate);
  if (body.startTime !== undefined) {
    const startTime = text(body.startTime);
    if (!timePattern.test(startTime)) return fail("invalid_start_time");
    fields.start_time = startTime;
  }
  if (body.duration !== undefined) {
    const duration = optionalNumber(body.duration);
    if (
      duration !== null &&
      (duration < SELLER_EVENT_LIMITS.minDuration ||
        duration > SELLER_EVENT_LIMITS.maxDuration)
    ) {
      return fail("invalid_duration");
    }
    fields.duration = duration;
  }
  if (body.intermission !== undefined) {
    const intermission = optionalNumber(body.intermission);
    if (
      intermission !== null &&
      (intermission < 0 ||
        intermission > SELLER_EVENT_LIMITS.maxIntermission)
    ) {
      return fail("invalid_intermission");
    }
    fields.intermission = intermission;
  }

  if (body.thumbnail !== undefined) fields.thumbnail = text(body.thumbnail);

  const { error } = await supabase
    .from("event")
    .update(fields)
    .eq("event_id", id)
    .eq("seller_id", user.id);

  if (error) return fail("event_update_failed", 500);

  if (Array.isArray(body.images)) {
    const images = body.images.map(text).filter(Boolean);
    if (images.length > SELLER_EVENT_LIMITS.maxImagesPerEvent - 1) {
      return fail("이미지 개수가 많습니다");
    }

    const { error: deleteError } = await supabase
      .from("event_image")
      .delete()
      .eq("event_id", id);
    if (deleteError) return fail("이미지 업데이트 실패(삭제)", 500);

    if (images.length > 0) {
      const now = new Date().toISOString();
      const rows = images.map((url, i) => ({
        event_id: id,
        url,
        order: i,
        created_at: now,
      }));
      const { error: insertError } = await supabase
        .from("event_image")
        .insert(rows);
      if (insertError) return fail("이미지 업데이트 실패(삽입)", 500);
    }
  }

  if (Array.isArray(body.removedSlotIds) && body.removedSlotIds.length > 0) {
    const removedIds = body.removedSlotIds.map(text).filter(Boolean);

    const { data: booked } = await supabase
      .from("orders")
      .select("slot_id")
      .in("slot_id", removedIds)
      .limit(1);
    if (booked && booked.length > 0) return fail("slot_has_orders");

    const { error: removeError } = await supabase
      .from("slot")
      .delete()
      .in("slot_id", removedIds)
      .eq("event_id", id);
    if (removeError) return fail("slot_delete_failed", 500);
  }

  if (Array.isArray(body.slots)) {
    for (const raw of body.slots) {
      const slotId = text((raw as { slotId?: unknown }).slotId);
      const startTime = text((raw as { startTime?: unknown }).startTime);
      const endTime = text((raw as { endTime?: unknown }).endTime);
      if (!slotId || !timePattern.test(startTime) || !timePattern.test(endTime)) {
        return fail("invalid_slot_time");
      }
      const { error: slotError } = await supabase
        .from("slot")
        .update({ start_time: startTime, end_time: endTime })
        .eq("slot_id", slotId)
        .eq("event_id", id);
      if (slotError) return fail("slot_update_failed", 500);
    }
  }

  return success(null, "updated");
}

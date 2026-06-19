import { getCurrentUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { fail, success } from "@/lib/api/api-response";
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

  const user = await getCurrentUser();
  if (!user) return fail("unauthorized", 401);

  const supabase = await createClient();

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

  const { error } = await supabase
    .from("event")
    .update(fields)
    .eq("event_id", id)
    .eq("seller_id", user.id);

  if (error) return fail("event_update_failed", 500);

  return success(null, "updated");
}

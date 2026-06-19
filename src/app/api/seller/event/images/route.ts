import { NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { fail, success } from "@/lib/api/api-response";
import { SELLER_EVENT_LIMITS } from "@/app/seller/_lib/limits";
import { uploadImageAsWebp } from "@/lib/image/uploadImage";

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return fail("unauthorized", 401);

  const formData = await req.formData();
  const files = formData
    .getAll("files")
    .filter((value): value is File => value instanceof File);

  if (files.length === 0) return fail("empty_files");
  if (files.length > SELLER_EVENT_LIMITS.maxImagesPerEvent) {
    return fail("too_many_images");
  }
  for (const file of files) {
    if (!file.type.startsWith("image/")) return fail("invalid_image_type");
    if (file.size > SELLER_EVENT_LIMITS.maxImageSizeMb * 1024 * 1024) {
      return fail("image_too_large");
    }
  }

  const supabase = await createClient();

  const urls: string[] = [];
  for (const file of files) {
    const url = await uploadImageAsWebp(supabase, file);
    if (!url) return fail("image_upload_failed", 500);
    urls.push(url);
  }

  return success({ urls });
}

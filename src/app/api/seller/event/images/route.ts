import { NextRequest } from "next/server";
import { fail, success } from "@/lib/api/api-response";
import { requireUserApi } from "@/lib/api/require-user";
import { SELLER_EVENT_LIMITS } from "@/app/seller/_lib/limits";
import { uploadImageAsWebp } from "@/lib/image/uploadImage";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const ctx = await requireUserApi();
  if ("error" in ctx) return ctx.error;
  const { supabase } = ctx;

  let formData: FormData;
  try {
    formData = await req.formData();
  } catch (error) {
    console.error("[event-images:formdata_parse_failed] FormData 파싱 실패", {
      error,
    });
    return fail("invalid_form_data", 400);
  }

  const files = formData
    .getAll("files")
    .filter((value): value is File => value instanceof File);

  if (files.length === 0) {
    console.error("[event-images:empty_files] 업로드 파일이 없습니다.");
    return fail("empty_files");
  }
  if (files.length > SELLER_EVENT_LIMITS.maxImagesPerEvent) {
    console.error("[event-images:too_many_files] 업로드 파일 수 초과", {
      count: files.length,
      max: SELLER_EVENT_LIMITS.maxImagesPerEvent,
    });
    return fail("too_many_images");
  }
  for (const file of files) {
    if (!file.type.startsWith("image/")) {
      console.error("[event-images:invalid_image_type] 이미지가 아닌 파일이 포함되었습니다.", {
        name: file.name,
        type: file.type,
        size: file.size,
      });
      return fail("invalid_image_type");
    }
    if (file.size > SELLER_EVENT_LIMITS.maxImageSizeMb * 1024 * 1024) {
      console.error("[event-images:image_too_large] 이미지 용량 초과", {
        name: file.name,
        type: file.type,
        size: file.size,
        maxMb: SELLER_EVENT_LIMITS.maxImageSizeMb,
      });
      return fail("image_too_large");
    }
  }

  const urls: string[] = [];
  for (const [index, file] of files.entries()) {
    const url = await uploadImageAsWebp(supabase, file);
    if (!url) {
      console.error("[event-images:file_upload_failed] 파일 업로드 처리 실패", {
        index,
        name: file.name,
        type: file.type,
        size: file.size,
      });
      return fail("image_upload_failed", 500);
    }
    urls.push(url);
  }

  return success({ urls });
}

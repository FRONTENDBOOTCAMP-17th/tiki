"use server";

import { getCurrentUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { SELLER_EVENT_LIMITS } from "@/app/seller/_lib/limits";
import { uploadImageAsWebp } from "@/lib/image/uploadImage";

// 이벤트 등록 폼에서 고른 이미지들을 webp로 변환·업로드하고 공개 URL 배열을 돌려줍니다.
// 업로드 순서를 유지해야 첫 번째가 대표 이미지가 됩니다.
export async function uploadEventImages(files: File[]): Promise<string[]> {
  const user = await getCurrentUser();
  if (!user) throw new Error("unauthorized");

  if (files.length === 0) return [];
  if (files.length > SELLER_EVENT_LIMITS.maxImagesPerEvent) {
    throw new Error("too_many_images");
  }
  for (const file of files) {
    if (!file.type.startsWith("image/")) throw new Error("invalid_image_type");
    if (file.size > SELLER_EVENT_LIMITS.maxImageSizeMb * 1024 * 1024) {
      throw new Error("image_too_large");
    }
  }

  const supabase = await createClient();

  const urls: string[] = [];
  for (const file of files) {
    const url = await uploadImageAsWebp(supabase, file);
    if (!url) throw new Error("image_upload_failed");
    urls.push(url);
  }
  return urls;
}

import "server-only";
import sharp from "sharp";
import { nanoid } from "nanoid";
import type { createClient } from "@/lib/supabase/server";

type ServerSupabase = Awaited<ReturnType<typeof createClient>>;

const MAX_SIZE = 1200;
const BUCKET = "event-images";

// sharp는 Node 전용이라 서버(라우트 핸들러/서버 액션)에서만 호출해야 한다고 하네요.
export async function uploadImageAsWebp(
  supabase: ServerSupabase,
  file: File,
): Promise<string | null> {
  const arrayBuffer = await file.arrayBuffer();
  const image = sharp(Buffer.from(arrayBuffer));

  const metadata = await image.metadata();
  if (!metadata.width || !metadata.height) return null;

  let targetWidth = metadata.width;
  let targetHeight = metadata.height;
  if (metadata.width > MAX_SIZE || metadata.height > MAX_SIZE) {
    if (metadata.width >= metadata.height) {
      targetWidth = MAX_SIZE;
      targetHeight = Math.round((metadata.height / metadata.width) * MAX_SIZE);
    } else {
      targetWidth = Math.round((metadata.width / metadata.height) * MAX_SIZE);
      targetHeight = MAX_SIZE;
    }
  }

  const webpBuffer = await image
    .resize(targetWidth, targetHeight, { fit: "inside" })
    .webp({ quality: 90 })
    .toBuffer();

  const path = `${nanoid()}.webp`;
  const { error } = await supabase.storage.from(BUCKET).upload(path, webpBuffer, {
    contentType: "image/webp",
    cacheControl: "3600",
    upsert: false,
  });
  if (error) return null;

  return supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
}

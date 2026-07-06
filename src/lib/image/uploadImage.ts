import "server-only";
import sharp from "sharp";
import { nanoid } from "nanoid";
import type { createClient } from "@/lib/supabase/server";

type ServerSupabase = Awaited<ReturnType<typeof createClient>>;

const MAX_SIZE = 1200;
const BUCKET = "event-images";
const MAX_ENCODE_ATTEMPTS = 3;

sharp.cache(false);

function isValidWebp(buffer: Buffer) {
  if (buffer.length < 12) return false;
  if (buffer.toString("ascii", 0, 4) !== "RIFF") return false;
  if (buffer.toString("ascii", 8, 12) !== "WEBP") return false;
  return buffer.readUInt32LE(4) === buffer.length - 8;
}

async function validateWebpBuffer(buffer: Buffer) {
  if (!isValidWebp(buffer)) return false;
  const metadata = await sharp(buffer).metadata();
  return metadata.format === "webp" && !!metadata.width && !!metadata.height;
}

// sharp는 Node 전용이라 서버(라우트 핸들러/서버 액션)에서만 호출해야 한다고 하네요.
export async function uploadImageAsWebp(
  supabase: ServerSupabase,
  file: File,
): Promise<string | null> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const inputBuffer = Buffer.from(arrayBuffer);

    const metadata = await sharp(inputBuffer).metadata();
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

    let webpBuffer: Buffer | null = null;
    for (let attempt = 0; attempt < MAX_ENCODE_ATTEMPTS; attempt++) {
      const candidate = await sharp(inputBuffer)
        .resize(targetWidth, targetHeight, { fit: "inside" })
        .webp({ quality: 90 })
        .toBuffer();
      if (await validateWebpBuffer(candidate)) {
        webpBuffer = candidate;
        break;
      }
    }

    if (!webpBuffer) return null;

    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();
    if (sessionError || !session?.access_token) {
      console.error("[event-images] 세션 확인 실패:", sessionError?.message);
      return null;
    }

    const path = `${nanoid()}.webp`;
    const uploadUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/${BUCKET}/${path}`;
    const webpArrayBuffer = new Uint8Array(webpBuffer).buffer;
    const uploadRes = await fetch(uploadUrl, {
      method: "POST",
      headers: {
        apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        authorization: `Bearer ${session.access_token}`,
        "cache-control": "max-age=3600",
        "content-type": "image/webp",
        "x-upsert": "false",
      },
      body: webpArrayBuffer,
    });

    if (!uploadRes.ok) {
      console.error("[event-images] Storage 업로드 실패:", await uploadRes.text());
      return null;
    }

    const { data: savedImage, error: downloadError } = await supabase.storage
      .from(BUCKET)
      .download(path);
    if (downloadError || !savedImage) {
      console.error("[event-images] 업로드 검증 다운로드 실패:", downloadError?.message);
      return null;
    }

    const savedBuffer = Buffer.from(await savedImage.arrayBuffer());
    if (!(await validateWebpBuffer(savedBuffer))) {
      await supabase.storage.from(BUCKET).remove([path]);
      console.error("[event-images] Storage 저장 후 WebP 검증 실패:", path);
      return null;
    }

    return supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
  } catch (error) {
    console.error("[event-images] 이미지 업로드 처리 실패:", error);
    return null;
  }
}

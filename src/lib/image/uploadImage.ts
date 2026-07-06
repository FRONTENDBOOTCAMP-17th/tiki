import "server-only";
import sharp, { type Metadata } from "sharp";
import { nanoid } from "nanoid";
import type { createClient } from "@/lib/supabase/server";

type ServerSupabase = Awaited<ReturnType<typeof createClient>>;

const MAX_SIZE = 1200;
const BUCKET = "event-images";
const MAX_ENCODE_ATTEMPTS = 3;

sharp.cache(false);

function fileContext(file: File) {
  return {
    name: file.name,
    type: file.type,
    size: file.size,
  };
}

function webpContext(buffer: Buffer) {
  return {
    length: buffer.length,
    riff: buffer.toString("ascii", 0, 4),
    riffSize: buffer.length >= 8 ? buffer.readUInt32LE(4) : null,
    expectedRiffSize: buffer.length - 8,
    webp: buffer.toString("ascii", 8, 12),
  };
}

function logImageError(
  code: string,
  message: string,
  context?: Record<string, unknown>,
) {
  console.error(`[event-images:${code}] ${message}`, context ?? {});
}

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
  const fileInfo = fileContext(file);
  let inputBuffer: Buffer;

  try {
    inputBuffer = Buffer.from(await file.arrayBuffer());
  } catch (error) {
    logImageError("file_read_failed", "업로드 파일을 버퍼로 읽지 못했습니다.", {
      file: fileInfo,
      error,
    });
    return null;
  }

  let metadata: Metadata;
  try {
    metadata = await sharp(inputBuffer).metadata();
  } catch (error) {
    logImageError("input_metadata_failed", "원본 이미지 메타데이터를 읽지 못했습니다.", {
      file: fileInfo,
      inputSize: inputBuffer.length,
      error,
    });
    return null;
  }

  if (!metadata.width || !metadata.height) {
    logImageError("input_dimension_missing", "원본 이미지 크기를 확인하지 못했습니다.", {
      file: fileInfo,
      metadata,
    });
    return null;
  }

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
  for (let attempt = 1; attempt <= MAX_ENCODE_ATTEMPTS; attempt++) {
    try {
      const candidate = await sharp(inputBuffer)
        .resize(targetWidth, targetHeight, { fit: "inside" })
        .webp({ quality: 90 })
        .toBuffer();
      if (await validateWebpBuffer(candidate)) {
        webpBuffer = candidate;
        break;
      }

      logImageError("webp_encode_invalid", "WebP 인코딩 결과가 유효하지 않습니다.", {
        file: fileInfo,
        attempt,
        target: { width: targetWidth, height: targetHeight },
        webp: webpContext(candidate),
      });
    } catch (error) {
      logImageError("webp_encode_failed", "WebP 인코딩 중 예외가 발생했습니다.", {
        file: fileInfo,
        attempt,
        target: { width: targetWidth, height: targetHeight },
        error,
      });
    }
  }

  if (!webpBuffer) {
    logImageError("webp_encode_exhausted", "WebP 인코딩 재시도를 모두 실패했습니다.", {
      file: fileInfo,
      attempts: MAX_ENCODE_ATTEMPTS,
    });
    return null;
  }

  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession();
  if (sessionError || !session?.access_token) {
    logImageError("session_missing", "Storage 업로드에 필요한 세션을 확인하지 못했습니다.", {
      file: fileInfo,
      sessionError: sessionError?.message,
      hasSession: !!session,
    });
    return null;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseAnonKey) {
    logImageError("env_missing", "Supabase 업로드 환경 변수가 없습니다.", {
      hasSupabaseUrl: !!supabaseUrl,
      hasAnonKey: !!supabaseAnonKey,
    });
    return null;
  }

  const path = `${nanoid()}.webp`;
  const uploadUrl = `${supabaseUrl}/storage/v1/object/${BUCKET}/${path}`;
  const webpArrayBuffer = new Uint8Array(webpBuffer).buffer;
  try {
    const uploadRes = await fetch(uploadUrl, {
      method: "POST",
      headers: {
        apikey: supabaseAnonKey,
        authorization: `Bearer ${session.access_token}`,
        "cache-control": "max-age=3600",
        "content-type": "image/webp",
        "x-upsert": "false",
      },
      body: webpArrayBuffer,
    });

    if (!uploadRes.ok) {
      logImageError("storage_upload_failed", "Storage 업로드 요청이 실패했습니다.", {
        file: fileInfo,
        path,
        status: uploadRes.status,
        statusText: uploadRes.statusText,
        body: await uploadRes.text(),
      });
      return null;
    }
  } catch (error) {
    logImageError("storage_upload_exception", "Storage 업로드 요청 중 예외가 발생했습니다.", {
      file: fileInfo,
      path,
      error,
    });
    return null;
  }

  const { data: savedImage, error: downloadError } = await supabase.storage
    .from(BUCKET)
    .download(path);
  if (downloadError || !savedImage) {
    logImageError("storage_verify_download_failed", "업로드 검증용 다운로드가 실패했습니다.", {
      file: fileInfo,
      path,
      downloadError: downloadError?.message,
      hasSavedImage: !!savedImage,
    });
    return null;
  }

  let savedBuffer: Buffer;
  try {
    savedBuffer = Buffer.from(await savedImage.arrayBuffer());
  } catch (error) {
    logImageError("storage_verify_read_failed", "검증용 다운로드 파일을 버퍼로 읽지 못했습니다.", {
      file: fileInfo,
      path,
      error,
    });
    return null;
  }

  let isSavedWebpValid = false;
  try {
    isSavedWebpValid = await validateWebpBuffer(savedBuffer);
  } catch (error) {
    logImageError("storage_saved_metadata_failed", "저장된 WebP 메타데이터 검증 중 예외가 발생했습니다.", {
      file: fileInfo,
      path,
      savedWebp: webpContext(savedBuffer),
      error,
    });
  }

  if (!isSavedWebpValid) {
    const { error: removeError } = await supabase.storage.from(BUCKET).remove([path]);
    logImageError("storage_saved_webp_invalid", "Storage 저장 후 WebP 검증이 실패했습니다.", {
      file: fileInfo,
      path,
      savedWebp: webpContext(savedBuffer),
      removeError: removeError?.message,
    });
    return null;
  }

  return supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
}

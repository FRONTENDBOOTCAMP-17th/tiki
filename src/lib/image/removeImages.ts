import "server-only";
import type { createClient } from "@/lib/supabase/server";
import { storagePathFromPublicUrl } from "./storagePath";

type ServerSupabase = Awaited<ReturnType<typeof createClient>>;

const BUCKET = "event-images";

// 주어진 public URL들의 스토리지 객체를 지운다.
// 이미지 정리는 best-effort라 실패해도 예외를 던지지 않고 로그만 남긴다.
export async function removeEventImages(
  supabase: ServerSupabase,
  urls: (string | null | undefined)[],
) {
  const paths = urls
    .map((url) => storagePathFromPublicUrl(url, BUCKET))
    .filter((path): path is string => !!path);
  if (paths.length === 0) return;

  const { error } = await supabase.storage.from(BUCKET).remove(paths);
  if (error) {
    console.error("[event-images] 스토리지 정리 실패:", error.message);
  }
}

// Supabase public URL에서 스토리지 객체 경로만 뽑아낸다.
// 형식: {SUPABASE_URL}/storage/v1/object/public/{bucket}/{path}
// 해당 버킷의 URL이 아니거나 경로가 비면 null.
const PUBLIC_SEGMENT = "/storage/v1/object/public/";

export function storagePathFromPublicUrl(
  url: string | null | undefined,
  bucket: string,
): string | null {
  if (!url) return null;

  let pathname = url;
  try {
    pathname = new URL(url).pathname;
  } catch {
    // 절대 URL이 아니면 원본 문자열로 그대로 파싱 시도
  }

  const marker = `${PUBLIC_SEGMENT}${bucket}/`;
  const index = pathname.indexOf(marker);
  if (index === -1) return null;

  const path = pathname.slice(index + marker.length);
  if (!path) return null;

  try {
    return decodeURIComponent(path);
  } catch {
    return path;
  }
}

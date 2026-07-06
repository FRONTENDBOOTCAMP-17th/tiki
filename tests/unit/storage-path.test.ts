import { describe, expect, it } from "vitest";
import { storagePathFromPublicUrl } from "@/lib/image/storagePath";

const BUCKET = "event-images";
const BASE = "https://abc.supabase.co/storage/v1/object/public";

describe("storagePathFromPublicUrl", () => {
  it("public URL에서 버킷 이후 경로를 뽑는다", () => {
    expect(storagePathFromPublicUrl(`${BASE}/${BUCKET}/abc123.webp`, BUCKET)).toBe(
      "abc123.webp",
    );
  });

  it("하위 폴더가 있는 경로도 그대로 반환한다", () => {
    expect(
      storagePathFromPublicUrl(`${BASE}/${BUCKET}/2026/07/poster.webp`, BUCKET),
    ).toBe("2026/07/poster.webp");
  });

  it("URL 인코딩된 경로를 디코드한다", () => {
    expect(
      storagePathFromPublicUrl(`${BASE}/${BUCKET}/hello%20world.webp`, BUCKET),
    ).toBe("hello world.webp");
  });

  it("다른 버킷 URL이면 null", () => {
    expect(
      storagePathFromPublicUrl(`${BASE}/avatars/abc.webp`, BUCKET),
    ).toBeNull();
  });

  it("버킷 뒤 경로가 비면 null", () => {
    expect(storagePathFromPublicUrl(`${BASE}/${BUCKET}/`, BUCKET)).toBeNull();
  });

  it("스토리지 URL이 아니면 null", () => {
    expect(
      storagePathFromPublicUrl("https://example.com/foo/bar.png", BUCKET),
    ).toBeNull();
  });

  it("빈 값/누락은 null", () => {
    expect(storagePathFromPublicUrl("", BUCKET)).toBeNull();
    expect(storagePathFromPublicUrl(null, BUCKET)).toBeNull();
    expect(storagePathFromPublicUrl(undefined, BUCKET)).toBeNull();
  });
});

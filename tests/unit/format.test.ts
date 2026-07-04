import { describe, expect, it } from "vitest";
import {
  formatDotDate,
  formatKstDate,
  formatKstDateWithDay,
  formatPriceFrom,
  formatShortDate,
} from "@/lib/format";

describe("format utilities", () => {
  it("월/일 형식으로 날짜를 줄여서 표시한다", () => {
    expect(formatShortDate("2026-06-04")).toBe("6월 4일");
    expect(formatShortDate("2026-12-25", "오픈")).toBe("12월 25일 오픈");
  });

  it("가격에 한국어 천 단위 구분자와 접미사를 붙인다", () => {
    expect(formatPriceFrom(1000)).toBe("1,000원~");
    expect(formatPriceFrom(125000, "부터")).toBe("125,000원부터");
    expect(formatPriceFrom(0, "")).toBe("0원");
  });

  it("ISO 날짜를 점 구분 날짜로 변환한다", () => {
    expect(formatDotDate("2026-06-14T10:30:00Z")).toBe("2026.06.14");
    expect(formatDotDate("2026-01-01")).toBe("2026.01.01");
  });

  it("UTC 시간을 KST 날짜 기준으로 표시한다", () => {
    expect(formatKstDate("2026-06-14T15:10:00.000Z")).toBe("2026.06.15");
    expect(formatKstDateWithDay("2026-06-14T15:10:00.000Z")).toBe(
      "2026.06.15 (월)",
    );
  });
});

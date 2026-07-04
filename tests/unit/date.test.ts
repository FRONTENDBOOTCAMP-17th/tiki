import { afterEach, describe, expect, it, vi } from "vitest";
import { todayKST } from "@/lib/date";

describe("todayKST", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("현재 시간을 한국 날짜 기준 YYYY-MM-DD로 반환한다", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-07-03T15:30:00.000Z"));

    expect(todayKST()).toBe("2026-07-04");
  });
});

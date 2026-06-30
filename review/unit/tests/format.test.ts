import { describe, it, expect } from "vitest";
import { formatShortDate, formatPriceFrom, formatDotDate } from "@/lib/format";

// 홈·카테고리 카드가 공통으로 쓰는 포맷 함수들. 순수 함수라 테스트가 쉽고,
// 여기서 한 번 못 박아 두면 카드 표시가 조마다 흔들리지 않습니다.
describe("formatShortDate", () => {
  it("'2026-06-14'를 '6월 14일'로 바꾼다", () => {
    expect(formatShortDate("2026-06-14")).toBe("6월 14일");
  });

  it("suffix를 주면 뒤에 붙인다('6월 14일 오픈')", () => {
    expect(formatShortDate("2026-06-14", "오픈")).toBe("6월 14일 오픈");
  });

  it("앞자리 0을 떼서 '6월 4일'처럼 자연스럽게 만든다", () => {
    expect(formatShortDate("2026-06-04")).toBe("6월 4일");
  });
});

describe("formatPriceFrom", () => {
  it("1000을 '1,000원~'으로 보여준다", () => {
    expect(formatPriceFrom(1000)).toBe("1,000원~");
  });

  it("suffix를 '부터'로 바꿔 쓸 수 있다", () => {
    expect(formatPriceFrom(15000, "부터")).toBe("15,000원부터");
  });
});

describe("formatDotDate", () => {
  it("ISO 문자열의 날짜 부분만 점 표기로 바꾼다", () => {
    expect(formatDotDate("2026-06-14T09:30:00.000Z")).toBe("2026.06.14");
  });
});

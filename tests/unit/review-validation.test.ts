import { describe, expect, it } from "vitest";
import {
  getReviewValidationMessage,
  REVIEW_MEMO_MAX_LENGTH,
} from "@/lib/reviews/validation";

describe("getReviewValidationMessage", () => {
  it("정상 별점과 후기면 null을 반환한다", () => {
    expect(getReviewValidationMessage(5, "좋았어요")).toBeNull();
    expect(getReviewValidationMessage(1, "a")).toBeNull();
  });

  it("별점이 정수 1~5 범위를 벗어나면 메시지를 반환한다", () => {
    expect(getReviewValidationMessage(0, "좋았어요")).toBe(
      "별점을 선택해 주세요.",
    );
    expect(getReviewValidationMessage(6, "좋았어요")).toBe(
      "별점을 선택해 주세요.",
    );
    expect(getReviewValidationMessage(3.5, "좋았어요")).toBe(
      "별점을 선택해 주세요.",
    );
  });

  it("후기가 비어 있거나 최대 길이를 넘으면 메시지를 반환한다", () => {
    const message = `후기는 1자 이상 ${REVIEW_MEMO_MAX_LENGTH}자 이하로 입력해 주세요.`;

    expect(getReviewValidationMessage(5, "")).toBe(message);
    expect(getReviewValidationMessage(5, "a".repeat(1001))).toBe(message);
  });
});

export const REVIEW_MEMO_MIN_LENGTH = 1;
export const REVIEW_MEMO_MAX_LENGTH = 1000;
export const REVIEW_RATINGS = [1, 2, 3, 4, 5] as const;

export const REVIEW_RATING_LABEL: Record<number, string> = {
  1: "별로예요",
  2: "아쉬워요",
  3: "괜찮아요",
  4: "좋았어요",
  5: "최고예요",
};

export function getReviewValidationMessage(rating: number, memo: string) {
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return "별점을 선택해 주세요.";
  }

  if (
    memo.length < REVIEW_MEMO_MIN_LENGTH ||
    memo.length > REVIEW_MEMO_MAX_LENGTH
  ) {
    return `후기는 ${REVIEW_MEMO_MIN_LENGTH}자 이상 ${REVIEW_MEMO_MAX_LENGTH}자 이하로 입력해 주세요.`;
  }

  return null;
}

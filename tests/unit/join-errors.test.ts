import { describe, expect, it } from "vitest";
import { toKoreanJoinError } from "@/lib/auth/join-errors";

describe("toKoreanJoinError", () => {
  it("알려진 회원가입 에러 코드를 한국어 메시지로 바꾼다", () => {
    expect(toKoreanJoinError("email_already_exists")).toBe(
      "이미 사용 중인 이메일입니다.",
    );
    expect(toKoreanJoinError("invalid_password")).toBe(
      "비밀번호는 영문, 숫자, 특수문자를 포함한 8자 이상이어야 합니다.",
    );
  });

  it("코드가 없거나 알 수 없으면 기본 실패 메시지를 반환한다", () => {
    expect(toKoreanJoinError(undefined)).toBe("회원가입에 실패했습니다.");
    expect(toKoreanJoinError("unknown")).toBe("회원가입에 실패했습니다.");
  });
});

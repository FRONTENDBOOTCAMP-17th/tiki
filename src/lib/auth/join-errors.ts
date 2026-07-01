const JOIN_ERROR_MESSAGES: Record<string, string> = {
  email_already_exists: "이미 사용 중인 이메일입니다.",
  invalid_password:
    "비밀번호는 영문, 숫자, 특수문자를 포함한 8자 이상이어야 합니다.",
  signup_failed:
    "회원가입 처리 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.",
};

export function toKoreanJoinError(code: string | undefined): string {
  if (!code) return "회원가입에 실패했습니다.";
  return JOIN_ERROR_MESSAGES[code] ?? "회원가입에 실패했습니다.";
}

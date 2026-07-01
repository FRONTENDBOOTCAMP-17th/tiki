// 카드/목록 화면에서 공통으로 쓰는 날짜/가격 포맷 유틸 (홈 · 카테고리 카드 · 마이페이지 예매내역 등)

// "2026-06-14" -> "6월 14일" (suffix를 주면 "6월 14일 오픈"처럼 뒤에 붙는다)
export function formatShortDate(date: string, suffix = "") {
  const [, month, day] = date.split("-");
  const formatted = `${parseInt(month)}월 ${parseInt(day)}일`;
  return suffix ? `${formatted} ${suffix}` : formatted;
}

// 1000 -> "1,000원~" (suffix 기본값은 "~", "부터" 등으로 바꿔 쓸 수 있다)
export function formatPriceFrom(price: number, suffix = "~") {
  return `${price.toLocaleString("ko-KR")}원${suffix}`;
}

// "2026-06-14T..." -> "2026.06.14"
export function formatDotDate(iso: string) {
  return iso.slice(0, 10).replace(/-/g, ".");
}

const KST_DAYS = ["일", "월", "화", "수", "목", "금", "토"];

// timestamptz(UTC) 또는 날짜 문자열 → "2026.06.14" (KST 기준으로 변환)
// formatDotDate와 달리 문자열을 자르지 않고 타임존을 반영하므로, 한국 날짜로 정확히 표시할 때 사용.
export function formatKstDate(iso: string) {
  const parts = new Intl.DateTimeFormat("ko-KR", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date(iso));

  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "";
  return `${get("year")}.${get("month")}.${get("day")}`;
}

// timestamptz(UTC) 또는 날짜 문자열 → "2026.06.14 (일)" (KST 기준, 요일 포함)
export function formatKstDateWithDay(iso: string) {
  const weekday = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Seoul",
    weekday: "short",
  }).format(new Date(iso));

  const dayIndex = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(
    weekday,
  );
  return `${formatKstDate(iso)} (${KST_DAYS[dayIndex]})`;
}
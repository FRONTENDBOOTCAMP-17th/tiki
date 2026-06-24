// 홈/카테고리 화면 카드들이 공통으로 쓰는 날짜/가격 포맷 유틸.

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

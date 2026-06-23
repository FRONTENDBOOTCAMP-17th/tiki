// "2026-01-20" (또는 "2026-01-20T19:00:00") → "1월 20일"
export function formatEventDate(date: string) {
  const [, month, day] = date.split("-");
  return `${parseInt(month)}월 ${parseInt(day)}일`;
}

// 39000 → "39,000원"
export function formatPrice(price: number) {
  return price.toLocaleString("ko-KR") + "원";
}

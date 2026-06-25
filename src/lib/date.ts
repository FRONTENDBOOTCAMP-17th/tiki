// 한국 시간(KST) 기준 오늘 날짜 (YYYY-MM-DD).
// en-CA 로케일이 ISO 형식(YYYY-MM-DD)으로 출력한다.
export function todayKST(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

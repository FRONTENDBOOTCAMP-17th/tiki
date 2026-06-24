// "시간:분" -> 분으로 바꾸기
export function toMin(t: string) {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

// 반대로 분 -> 시간
export function toTime(min: number) {
  const h = Math.floor(min / 60) % 24;
  const m = min % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

// 시작일~종료일 날짜 하나하나 다 뽑아와서 리턴하게 했습니다
export function datesBetween(start: string, end: string) {
  const out: string[] = [];
  const d = new Date(start);
  const last = new Date(end);
  while (d <= last) {
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    out.push(`${d.getFullYear()}-${mm}-${dd}`);
    d.setDate(d.getDate() + 1);
  }
  return out;
}

// 그 달 날짜 전부 (달력에서 다 선택되게 하려고)
export function monthDates(month: Date) {
  const year = month.getFullYear();
  const m = month.getMonth();
  const days = new Date(year, m + 1, 0).getDate();
  const set = new Set<string>();

  for (let d = 1; d <= days; d++) {
    const mm = String(m + 1).padStart(2, "0");
    const dd = String(d).padStart(2, "0");
    set.add(`${year}-${mm}-${dd}`);
  }
  return set;
}
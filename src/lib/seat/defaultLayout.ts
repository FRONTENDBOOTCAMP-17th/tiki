export interface DefaultLayoutGrade {
  gradeId: string;
  quantity: number;
}

export interface DefaultLayoutSeat {
  label: string;
  x: number;
  y: number;
  gradeId: string;
}

export interface DefaultLayoutResult {
  stage: { x: number; y: number; width: number; height: number };
  seats: DefaultLayoutSeat[];
}

const DEFAULT_STAGE = { x: 50, y: 10, width: 40, height: 10 };

// 이벤트 생성 시 자동으로 만들어주는 기본 좌석 배치도.
// 등급 좌석 수 합계만큼 정사각형에 가까운 직사각형 그리드를 채우고,
// grades 배열 순서대로(예: 일반석 다 채운 뒤 VIP석) 등급을 매긴다.
export function generateDefaultLayout(grades: DefaultLayoutGrade[]): DefaultLayoutResult {
  const total = grades.reduce((sum, g) => sum + g.quantity, 0);
  if (total <= 0) return { stage: DEFAULT_STAGE, seats: [] };

  const cols = Math.ceil(Math.sqrt(total));
  const rows = Math.ceil(total / cols);

  const startX = 10;
  const endX = 90;
  const startY = 25;
  const endY = 90;
  const gapX = cols > 1 ? (endX - startX) / (cols - 1) : 0;
  const gapY = rows > 1 ? (endY - startY) / (rows - 1) : 0;

  const gradeQueue: string[] = grades.flatMap((g) => Array(g.quantity).fill(g.gradeId));

  const seats: DefaultLayoutSeat[] = [];
  let i = 0;
  for (let r = 0; r < rows && i < total; r++) {
    for (let c = 0; c < cols && i < total; c++) {
      seats.push({
        label: `A${i + 1}`,
        x: startX + gapX * c,
        y: startY + gapY * r,
        gradeId: gradeQueue[i],
      });
      i++;
    }
  }

  return { stage: DEFAULT_STAGE, seats };
}

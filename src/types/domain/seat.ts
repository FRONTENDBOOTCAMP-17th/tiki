/** 좌석 배치도 메타 (seat_layout 테이블) — 이벤트당 1개, 캔버스 기준 무대 위치/크기(%) */
export interface SeatLayout {
  layoutId: string;
  eventId: string;
  stageX: number;
  stageY: number;
  stageWidth: number;
  stageHeight: number;
}

/** 개별 좌석 (seat 테이블) — 좌표/등급은 이벤트 단위로 모든 회차가 공유 */
export interface Seat {
  seatId: string;
  layoutId: string;
  label: string; // 화면에 보여줄 좌석 번호, 예: "A1"
  posX: number; // 캔버스 가로 기준 % (0~100)
  posY: number; // 캔버스 세로 기준 % (0~100)
  gradeId: string | null;
}

/** 좌석의 회차별 점유 상태 — 비어있는 좌석은 별도 데이터가 없으므로 occupied 목록으로만 표현 */
export type SeatOccupancyStatus = "held" | "sold";

export interface SeatOccupancy {
  seatId: string;
  status: SeatOccupancyStatus;
}

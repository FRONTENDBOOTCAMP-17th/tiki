import Link from "next/link";
import ReservationCard, {
  type Reservation,
} from "@/components/mypage/ReservationCard";

const reservations: Reservation[] = [
  {
    id: "1",
    title: "미드나잇 라이브 2026",
    status: "confirmed",
    statusLabel: "예매 확정",
    seat: "R석",
    count: 2,
    bookedAt: "2026.04.15",
    date: "2026.05.18 (일)",
    time: "19:00",
    place: "서울 마포구 홍대 라이브홀",
    orderNo: "TK12345678",
    price: 110000,
  },
  {
    id: "2",
    title: "재즈 피아노 콘서트",
    status: "confirmed",
    statusLabel: "예매 확정",
    seat: "VIP석",
    count: 1,
    bookedAt: "2026.05.01",
    date: "2026.05.20 (화)",
    time: "20:00",
    place: "블루노트 서울",
    orderNo: "TK87654321",
    price: 45000,
  },
  {
    id: "3",
    title: "스프링 페스티벌 2026",
    status: "entered",
    statusLabel: "입장 완료",
    seat: "S석",
    count: 2,
    bookedAt: "2026.03.10",
    date: "2026.04.05 (토)",
    time: "18:00",
    place: "올림픽공원 88잔디마당",
    orderNo: "TK11223344",
    price: 88000,
  },
  {
    id: "4",
    title: "어쿠스틱 나이트",
    status: "cancelled",
    statusLabel: "예매 취소",
    seat: "A석",
    count: 1,
    bookedAt: "2026.02.20",
    date: "2026.03.15 (토)",
    time: "19:30",
    place: "롤링홀",
    orderNo: "TK55667788",
    price: 33000,
  },
];

const FILTERS = [
  { label: "전체", value: "all" },
  { label: "예매 확정", value: "confirmed" },
  { label: "입장 완료", value: "entered" },
  { label: "예매 취소", value: "cancelled" },
];

export default async function ReservationsPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string }>;
}) {
  const { filter = "all" } = await searchParams;
  const list =
    filter === "all"
      ? reservations
      : reservations.filter((r) => r.status === filter);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap gap-2">
        {FILTERS.map((f) => {
          const active = filter === f.value;
          const href =
            f.value === "all"
              ? "/mypage/reservations"
              : `/mypage/reservations?filter=${f.value}`;
          return (
            <Link
              key={f.value}
              href={href}
              className={
                active
                  ? "rounded-full bg-gradient-to-r from-primary-400 to-secondary-400 px-4 py-1.5 text-sm font-semibold text-white"
                  : "rounded-full border border-gray-200 bg-white px-4 py-1.5 text-sm text-gray-600 hover:bg-gray-50"
              }
            >
              {f.label}
            </Link>
          );
        })}
      </div>

      <div className="flex flex-col gap-4">
        {list.map((r) => (
          <ReservationCard key={r.id} reservation={r} />
        ))}
      </div>
    </div>
  );
}

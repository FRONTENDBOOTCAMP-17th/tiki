import { Calendar, Clock, MapPin } from "lucide-react";
import ReservationActions from "./ReservationActions";

export interface Reservation {
  id: string;
  eventId: string;
  title: string;
  status: "confirmed" | "cancelled";
  statusLabel: string;
  seat: string;
  count: number;
  bookedAt: string;
  date: string;
  time: string;
  place: string;
  orderNo: string;
  price: number;
  isEnded: boolean;
}

const STATUS_STYLE: Record<Reservation["status"], string> = {
  confirmed: "bg-primary-100 text-primary-700",
  cancelled: "bg-danger-100 text-danger-600",
};

export default function ReservationCard({
  reservation: r,
}: {
  reservation: Reservation;
}) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
      {/* 상단: 공연 정보(좌) / 예매번호·가격(우) */}
      <div className="flex justify-between gap-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-bold text-gray-900">{r.title}</h3>
            <span
              className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_STYLE[r.status]}`}
            >
              {r.statusLabel}
            </span>
          </div>
          <div className="mt-2 flex flex-col gap-1 text-sm text-gray-600">
            <span className="flex items-center gap-1.5">
              <Calendar size={14} className="shrink-0 text-gray-400" />
              {r.date}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock size={14} className="shrink-0 text-gray-400" />
              {r.time}
            </span>
            <span className="flex items-center gap-1.5">
              <MapPin size={14} className="shrink-0 text-gray-400" />
              {r.place}
            </span>
          </div>
        </div>

        <div className="flex shrink-0 flex-col items-end justify-between">
          <div className="text-right">
            <p className="text-xs text-gray-400">예매번호</p>
            <p className="text-sm text-gray-600">{r.orderNo}</p>
          </div>
          <p className="text-lg font-bold text-danger-500">
            {r.price.toLocaleString()}원
          </p>
        </div>
      </div>

      {/* 하단: 좌석 정보(좌) / 액션(우) */}
      <div className="mt-4 flex flex-col gap-3 border-t border-gray-100 pt-4 lg:flex-row lg:items-center lg:justify-between">
        <p className="text-sm text-gray-400">
          {r.seat} · {r.count}매 · 예매일 {r.bookedAt}
        </p>
        <ReservationActions reservation={r} />
      </div>
    </div>
  );
}

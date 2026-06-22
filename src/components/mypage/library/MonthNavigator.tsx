import Link from "next/link";

interface MonthNavigatorProps {
  year: number;
  month: number; // 0-based
}

const toParam = (d: Date) =>
  `?month=${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;

export default function MonthNavigator({ year, month }: MonthNavigatorProps) {
  return (
    <div className="flex items-center gap-3">
      <Link
        href={toParam(new Date(year, month - 1))}
        aria-label="이전 달"
        className="rounded-full px-2 py-1 text-gray-400 hover:bg-gray-100"
      >
        ‹
      </Link>
      <h1 className="text-2xl font-bold">
        {year}년 {month + 1}월
      </h1>
      <Link
        href={toParam(new Date(year, month + 1))}
        aria-label="다음 달"
        className="rounded-full px-2 py-1 text-gray-400 hover:bg-gray-100"
      >
        ›
      </Link>
    </div>
  );
}

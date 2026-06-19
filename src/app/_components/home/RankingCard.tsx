import Image from "next/image";
import Link from "next/link";

export interface RankingCardItem {
  eventId: string;
  rank: number;
  title: string;
  startDate: string;
  venueName: string;
  thumbnail: string;
  minPrice: number | null;
}

// "2026-06-14" -> "6월 14일"
function formatDate(date: string) {
  const [, month, day] = date.split("-");
  return `${parseInt(month)}월 ${parseInt(day)}일`;
}

function formatPrice(price: number) {
  return `${price.toLocaleString("ko-KR")}원~`;
}

// 예매 랭킹에 쓰는 세로형 포스터 카드. 클릭하면 상세 페이지로 이동한다.
export default function RankingCard({ item }: { item: RankingCardItem }) {
  return (
    <Link
      href={`/${item.eventId}`}
      className="flex w-36 shrink-0 flex-col gap-2 md:w-full"
    >
      <div className="relative aspect-3/4 w-full overflow-hidden rounded-xl">
        {item.thumbnail ? (
          <Image
            src={item.thumbnail}
            alt={item.title}
            fill
            sizes="200px"
            className="object-cover"
          />
        ) : (
          <div className="h-full w-full bg-linear-to-br from-accent-300 to-primary-500" />
        )}
        <span className="absolute left-2 top-2 flex size-6 items-center justify-center rounded-full bg-black/60 text-xs font-bold text-white">
          {item.rank}
        </span>
      </div>
      <div className="flex flex-col gap-1">
        <h4 className="truncate text-sm font-semibold text-gray-900">
          {item.title}
        </h4>
        <p className="text-xs text-gray-500">{formatDate(item.startDate)}</p>
        <p className="truncate text-xs text-gray-400">{item.venueName}</p>
        {item.minPrice != null && (
          <p className="text-xs font-medium text-primary-700">
            {formatPrice(item.minPrice)}
          </p>
        )}
      </div>
    </Link>
  );
}

import { MapPin } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

// 인기 공연 / 검색결과 카드가 공통으로 쓰는 데이터 형태
export type EventCardItem = {
  id?: string | number; // 이벤트 상세(/[eventId])로 이동할 식별자. 없으면 링크 비활성
  title: string;
  date: string; // ISO 문자열 ("2026-01-20")
  location?: string;
  image?: string;
};

// "2026-01-20" -> "1월 20일"
function formatDate(date: string) {
  const [, month, day] = date.split("-");
  return `${parseInt(month)}월 ${parseInt(day)}일`;
}

// rank가 있으면 앞에 순위 번호를 표시(인기순), 없으면 생략(검색결과)
export default function EventCard({
  item,
  rank,
}: {
  item: EventCardItem;
  rank?: number;
}) {
  const cardClass =
    "flex items-center gap-3 px-4 py-3 bg-search-background-pink rounded-2xl";

  const content = (
    <>
      {rank != null && (
        <span className="w-5 text-center text-md font-bold text-primary-700 shrink-0">
          {rank}
        </span>
      )}
      <div className="w-18 aspect-9/16 rounded-xl overflow-hidden shrink-0">
        {item.image ? (
          <Image
            src={item.image}
            alt={item.title}
            width={160}
            height={90}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-linear-to-br from-accent-300 to-primary-500" />
        )}
      </div>
      <div className="flex flex-col gap-2 min-w-0">
        <h4 className="text-sm font-semibold text-gray-900 truncate">
          {item.title}
        </h4>
        <div className="flex flex-col">
          <p className="text-xs text-gray-500">{formatDate(item.date)}</p>
          {item.location && (
            <div className="flex items-center gap-1 text-xs text-gray-400">
              <MapPin className="w-3 h-3 shrink-0" />
              <span className="truncate">{item.location}</span>
            </div>
          )}
        </div>
      </div>
    </>
  );

  return (
    <li>
      {item.id != null ? (
        <Link
          href={`/${item.id}`}
          className={`${cardClass} transition hover:brightness-95`}
        >
          {content}
        </Link>
      ) : (
        <div className={cardClass}>{content}</div>
      )}
    </li>
  );
}

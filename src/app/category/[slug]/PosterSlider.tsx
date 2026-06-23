import Image from "next/image";
import Link from "next/link";

export interface PosterSlideItem {
  eventId: string;
  title: string;
  startDate: string;
  endDate?: string;
  venueName: string;
  thumbnail: string;
}

const SECONDS_PER_CARD = 5; // 카드 1장이 지나가는 시간(속도)

// "2026-07-17" -> "26.07.17"
function formatDate(date: string) {
  const [year, month, day] = date.split("-");
  return `${year.slice(2)}.${month}.${day}`;
}

// 세로 포스터가 끊김 없이 흐르는 마퀴(무한 스크롤) 캐러셀.
// 아이템을 두 벌 이어붙여 translateX(-50%)로 순환 → 이음새 없이 무한 반복.
// CSS 애니메이션이라 JS 불필요. hover 시 일시정지, 모션 최소화 설정 시 정지.
export default function PosterSlider({
  items,
  title,
}: {
  items: PosterSlideItem[];
  title: string;
}) {
  if (items.length === 0) return null;

  const loop = [...items, ...items];
  const duration = items.length * SECONDS_PER_CARD;

  return (
    <section className="overflow-hidden py-6">
      <h2 className="mb-4 flex items-center gap-2 px-4 text-lg font-bold text-gray-900 md:px-8 md:text-xl lg:px-16">
        <span className="inline-block h-5 w-1.5 rounded-full bg-primary-500" />
        {title}
      </h2>
      <ul
        className="flex w-max animate-marquee hover:[animation-play-state:paused] motion-reduce:animate-none"
        style={{ animationDuration: `${duration}s` }}
      >
        {loop.map((item, i) => (
          <li
            key={`${item.eventId}-${i}`}
            className="mr-6 w-56 shrink-0 md:w-72"
            aria-hidden={i >= items.length}
          >
            <Link href={`/${item.eventId}`} className="flex flex-col gap-2">
              <div className="relative aspect-3/4 w-full overflow-hidden rounded-2xl">
                <Image
                  src={item.thumbnail}
                  alt={item.title}
                  fill
                  sizes="(min-width: 768px) 288px, 224px"
                  className="object-cover"
                />
              </div>
              <div className="flex flex-col gap-0.5">
                <h3 className="line-clamp-2 text-sm font-semibold text-gray-900">
                  {item.title}
                </h3>
                <p className="truncate text-xs text-gray-500">
                  {item.venueName}
                </p>
                <p className="text-xs text-gray-400">
                  {formatDate(item.startDate)}
                  {item.endDate ? ` ~ ${formatDate(item.endDate)}` : ""}
                </p>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

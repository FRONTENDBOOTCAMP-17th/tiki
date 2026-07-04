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
  showRank = false,
}: {
  items: PosterSlideItem[];
  title?: string;
  /** 카드에 순위 숫자 표시 (랭킹 용도에서만) */
  showRank?: boolean;
}) {
  if (items.length === 0) return null;

  const loop = [...items, ...items];
  const duration = items.length * SECONDS_PER_CARD;

  return (
    <section className="overflow-hidden py-6 dark:bg-surface-0">
      {title && (
        <h2 className="mb-4 px-4 text-lg font-bold tracking-tight text-gray-950 dark:text-gray-50 md:px-8 md:text-xl lg:px-16">
          {title}
        </h2>
      )}
      <ul
        className="flex w-max animate-marquee hover:[animation-play-state:paused] motion-reduce:animate-none"
        style={{ animationDuration: `${duration}s` }}
      >
        {loop.map((item, i) => (
          <li
            key={`${item.eventId}-${i}`}
            className="mr-4 w-48 shrink-0 md:mr-5 md:w-60"
            aria-hidden={i >= items.length}
          >
            <Link
              href={`/${item.eventId}`}
              className="group flex flex-col gap-2"
            >
              <div className="relative aspect-3/4 w-full overflow-hidden rounded-xl bg-gray-100 shadow-sm transition-shadow group-hover:shadow-md">
                <div className="relative size-full transition-transform duration-300 group-hover:scale-105">
                  <Image
                    src={item.thumbnail}
                    alt={item.title}
                    fill
                    sizes="(min-width: 768px) 240px, 192px"
                    className="object-cover"
                  />
                </div>
                {showRank && (
                  <span
                    aria-hidden="true"
                    className="absolute bottom-1.5 left-2.5 text-4xl font-black leading-none text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.55)] md:text-5xl"
                  >
                    {(i % items.length) + 1}
                  </span>
                )}
              </div>
              <div className="flex flex-col gap-1">
                <h3 className="line-clamp-2 text-[15px] font-semibold text-gray-900 transition-colors group-hover:text-primary-700 dark:text-gray-50 dark:group-hover:text-gray-200">
                  {item.title}
                </h3>
                <p className="truncate text-xs text-gray-500 dark:text-gray-400">
                  {item.venueName}
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500">
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

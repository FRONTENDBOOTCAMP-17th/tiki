import Link from 'next/link';
import Image from 'next/image';

export interface TicketOpenEventItem {
  eventId: string;
  title: string;
  startDate: string;
  venueName: string;
  thumbnail: string;
  minPrice: number | null;
}

// "2026-06-14" -> "6월 14일 오픈"
function formatOpenDate(date: string) {
  const [, month, day] = date.split('-');
  return `${parseInt(month)}월 ${parseInt(day)}일 오픈`;
}

function formatPrice(price: number) {
  return `${price.toLocaleString('ko-KR')}원부터`;
}

// 티켓 오픈: 최근에 새로 등록된 공연을 그라데이션 카드로 강조해서 보여준다.
export default function TicketOpenSection({
  events,
}: {
  events: TicketOpenEventItem[];
}) {
  if (events.length === 0) return null;

  return (
    <section className='px-4 py-6 md:px-8 lg:px-16'>
      <h2 className='mb-3 text-lg font-bold text-gray-900 md:text-xl'>
        티켓 오픈
      </h2>
      <ul className='grid grid-cols-1 gap-3 md:grid-cols-3'>
        {events.map((event) => (
          <li key={event.eventId}>
            <Link
              href={`/${event.eventId}`}
              className='flex items-center gap-3 rounded-2xl bg-gradient-to-r from-primary-400 to-secondary-400 p-4 transition-opacity hover:opacity-90'
            >
              <div className='relative h-20 w-14 shrink-0 overflow-hidden rounded-lg bg-white/40'>
                {event.thumbnail ? (
                  <Image
                    src={event.thumbnail}
                    alt={event.title}
                    fill
                    sizes='56px'
                    className='object-cover'
                  />
                ) : (
                  <div className='h-full w-full bg-linear-to-br from-accent-300 to-primary-500' />
                )}
              </div>
              <div className='flex min-w-0 flex-col gap-1'>
                <p className='truncate text-sm font-semibold text-white'>
                  {event.title}
                </p>
                <p className='text-xs text-white/80'>
                  {formatOpenDate(event.startDate)}
                </p>
                {event.minPrice != null && (
                  <p className='text-xs text-white/80'>
                    {formatPrice(event.minPrice)}
                  </p>
                )}
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

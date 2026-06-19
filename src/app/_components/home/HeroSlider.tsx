'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export interface HeroSlideItem {
  eventId: string;
  title: string;
  startDate: string;
  thumbnail: string;
}

const AUTOPLAY_INTERVAL_MS = 4000;

// "2026-06-14" -> "6월 14일"
function formatDate(date: string) {
  const [, month, day] = date.split('-');
  return `${parseInt(month)}월 ${parseInt(day)}일`;
}

// 홈 화면 최상단 히어로 배너. 실제 공연 데이터를 자동으로 넘어가는 슬라이드로 보여준다.
// 배경은 같은 이미지를 확대+블러 처리해서 깔고, 그 위에 원본 이미지를 잘리지 않게(contain) 올린다.
export default function HeroSlider({ slides }: { slides: HeroSlideItem[] }) {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (slides.length <= 1) return;

    const timer = setInterval(() => {
      setActiveIndex((index) => (index + 1) % slides.length);
    }, AUTOPLAY_INTERVAL_MS);

    return () => clearInterval(timer);
  }, [slides.length]);

  if (slides.length === 0) return null;

  return (
    <section className='px-4 py-6 md:px-8 lg:px-16'>
      <div className='relative h-56 w-full overflow-hidden rounded-2xl md:h-72 lg:h-80'>
        <div
          className='flex h-full transition-transform duration-500 ease-out'
          style={{ transform: `translateX(-${activeIndex * 100}%)` }}
        >
          {slides.map((slide) => (
            <Link
              key={slide.eventId}
              href={`/eventDetail/${slide.eventId}`}
              className='relative h-full w-full shrink-0'
            >
              {/* 확대 + 블러 배경: 카드 전체를 채우는 모던한 느낌의 배경 */}
              <Image
                src={slide.thumbnail}
                alt=''
                fill
                aria-hidden
                className='scale-125 object-cover blur-2xl brightness-90'
              />
              {/* 원본 이미지: 잘리지 않고 전체가 보이도록 contain */}
              <Image
                src={slide.thumbnail}
                alt={slide.title}
                fill
                sizes='(min-width: 1024px) 1024px, 100vw'
                className='object-contain drop-shadow-lg'
              />
              <div className='absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-4 text-white'>
                <p className='text-sm font-semibold md:text-base'>
                  {slide.title}
                </p>
                <p className='text-xs text-white/80'>
                  {formatDate(slide.startDate)}
                </p>
              </div>
            </Link>
          ))}
        </div>

        {slides.length > 1 && (
          <div className='absolute bottom-3 right-4 flex gap-1.5'>
            {slides.map((slide, index) => (
              <button
                key={slide.eventId}
                type='button'
                aria-label={`${index + 1}번째 배너로 이동`}
                onClick={() => setActiveIndex(index)}
                className={`size-1.5 rounded-full transition-colors ${
                  index === activeIndex ? 'bg-white' : 'bg-white/40'
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { cn } from "@/lib/cn";
import { formatShortDate } from "@/lib/format";
import { useSwipe } from "@/hooks/useSwipe";
import type { EventCardItem } from "@/types/domain/event";
import ThumbnailImage from "./ThumbnailImage";

const AUTOPLAY_INTERVAL_MS = 4000;

// 홈/카테고리 화면 최상단 히어로 배너. 실제 공연 데이터를 자동으로 넘어가는 슬라이드로 보여준다.
// 배경은 같은 이미지를 확대+블러 처리해서 깔고, 포스터는 한쪽에 크게, 제목/날짜는 그 옆에 크게 보여준다.
// 마우스/터치로 좌우 드래그하면 슬라이드를 직접 넘길 수 있다.
export default function HeroSlider({ slides }: { slides: EventCardItem[] }) {
  const [activeIndex, setActiveIndex] = useState(0);

  function goToNext() {
    setActiveIndex((index) => (index + 1) % slides.length);
  }
  function goToPrev() {
    setActiveIndex((index) => (index - 1 + slides.length) % slides.length);
  }

  const { onPointerDown, onPointerMove, onPointerUp, onClickCapture } =
    useSwipe({ onSwipeLeft: goToNext, onSwipeRight: goToPrev });

  useEffect(() => {
    if (slides.length <= 1) return;

    const timer = setInterval(goToNext, AUTOPLAY_INTERVAL_MS);
    return () => clearInterval(timer);
    // activeIndex가 바뀔 때마다(자동/수동 모두) 다음 전환까지의 타이머를 새로 시작한다.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slides.length, activeIndex]);

  if (slides.length === 0) return null;

  return (
    <section className="w-full px-4 py-7 md:px-8 lg:px-16">
      <div className="mx-auto w-full max-w-[1440px]">
        <div className="relative h-80 w-full overflow-hidden rounded-2xl bg-mirage shadow-sm select-none md:h-96 lg:h-112 dark:bg-surface-0">
          <div
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onClickCapture={onClickCapture}
            className="flex h-full cursor-grab touch-pan-y transition-transform duration-500 ease-out"
            style={{ transform: `translateX(-${activeIndex * 100}%)` }}
          >
            {slides.map((slide, index) => (
              <Link
                key={slide.eventId}
                href={`/${slide.eventId}`}
                className="group relative flex h-full w-full shrink-0 items-center justify-center px-4 py-8 text-white md:px-8 lg:px-16"
              >
                {/* 확대 + 블러 배경: 카드 전체를 채우는 모던한 느낌의 배경 (장식용, 로딩 처리 불필요).
                    포스터보다 차지하는 면적이 커서 실제 LCP 후보가 되는 경우가 많으므로,
                    첫 슬라이드는 priority로 즉시 fetch하도록 한다. */}
                <Image
                  src={slide.thumbnail}
                  alt=""
                  fill
                  aria-hidden
                  sizes="100vw"
                  priority={index === 0}
                  className="scale-125 object-cover blur-2xl brightness-105"
                />
                <div className="absolute inset-0 bg-black/15" />

                <div className="relative z-10 mx-auto flex w-full max-w-[1440px] flex-col items-center justify-center gap-5 text-center md:flex-row md:gap-12 md:text-left">
                  {/* 포스터: 슬라이드 높이의 대부분을 차지하도록 크게, hover 시 살짝 확대 */}
                  <div className="relative aspect-3/4 h-48 shrink-0 overflow-hidden rounded-xl shadow-2xl ring-1 ring-white/20 transition-transform duration-300 group-hover:scale-[1.02] md:h-72 lg:h-80">
                    <ThumbnailImage
                      src={slide.thumbnail}
                      alt={slide.title}
                      sizes="(min-width: 1024px) 288px, 220px"
                      className="object-cover"
                      priority={index === 0}
                    />
                  </div>

                  {/* 제목/날짜: 작은 캡션이 아니라 눈에 띄는 크기로 */}
                  <div className="flex max-w-xl flex-col items-center gap-2 md:items-start">
                    <h1 className="line-clamp-2 text-2xl font-bold leading-tight drop-shadow-md md:text-4xl lg:text-5xl">
                      {slide.title}
                    </h1>
                    <p className="text-sm text-white/90 md:text-lg">
                      {formatShortDate(slide.startDate)}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {slides.length > 1 && (
            <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-1.5">
              {slides.map((slide, index) => (
                <button
                  key={slide.eventId}
                  type="button"
                  aria-label={`${index + 1}번째 배너로 이동`}
                  onClick={() => setActiveIndex(index)}
                  className={cn(
                    "size-1.5 rounded-full transition-all hover:scale-125 active:scale-90",
                    index === activeIndex ? "bg-white" : "bg-white/40",
                  )}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

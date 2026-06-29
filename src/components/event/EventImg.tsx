import Image from "next/image";
import EventPosterZoom from "./EventPosterZoom";

interface EventImgProps {
  poster: string; // 포스터 이미지 URL
  title?: string;
}

export default function EventImg({ poster, title = "" }: EventImgProps) {
  return (
    // fill 기준 박스 + 배경 클립
    <div className="relative h-64 overflow-hidden rounded-lg md:h-80 lg:h-[420px]">
      {/* 배경: 확대 + 블러 */}
      <Image
        src={poster}
        alt=""
        aria-hidden
        fill
        sizes="(max-width: 1024px) 100vw, 720px"
        priority
        className="scale-110 object-cover blur-2xl brightness-90"
      />

      {/* 원본: 포스터 비율 박스 (rounded 위해 overflow-hidden) */}
      <div className="absolute inset-0 z-10 flex items-center justify-center p-3 lg:p-5">
        <EventPosterZoom src={poster} alt={title} />
      </div>
    </div>
  );
}

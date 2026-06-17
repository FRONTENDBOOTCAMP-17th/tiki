import Image from "next/image";

interface EventImgProps {
  poster: string; // 포스터 이미지 URL
  title?: string;
}

export default function EventImg({ poster, title = "" }: EventImgProps) {
  return (
    // fill 기준 박스 + 배경 클립
    <div className="relative mx-4 h-70 overflow-hidden rounded-2xl md:h-90">
      {/* 배경: 확대 + 블러 */}
      <Image
        src={poster}
        alt=""
        aria-hidden
        fill
        sizes="100vw"
        priority
        className="scale-110 object-cover blur-2xl brightness-90"
      />

      {/* 원본: 포스터 비율 박스 (rounded 위해 overflow-hidden) */}
      <div className="absolute inset-0 z-10 flex items-center justify-center p-4">
        <div className="relative aspect-5/7 h-full overflow-hidden rounded-2xl shadow-md">
          <Image
            src={poster}
            alt={title}
            fill
            sizes="(max-width: 768px) 60vw, 360px"
            priority
            className="object-cover"
          />
        </div>
      </div>
    </div>
  );
}

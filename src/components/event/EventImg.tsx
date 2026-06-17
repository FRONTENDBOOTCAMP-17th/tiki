import Image from 'next/image';

interface EventImgProps {
  poster: string; // 포스터 이미지 URL
  title?: string; // 접근성용 alt
}

export default function EventImg({ poster, title = '' }: EventImgProps) {
  return (
    // relative + 고정 높이 + overflow-hidden : fill 기준 박스이자, 확대/블러 배경을 잘라줌
    <div className="relative h-70 w-full overflow-hidden md:h-90">
      {/* 배경 : object-cover 로 좌우 꽉 채우고 확대(scale-110) + 블러(blur-2xl) */}
      <Image
        src={poster}
        alt=""
        aria-hidden
        fill
        sizes="100vw"
        priority
        className="scale-110 object-cover blur-2xl brightness-90"
      />

      {/* 원본 : object-contain 으로 비율 유지하며 중앙에 또렷하게, z-10 으로 배경 위 */}
      <Image
        src={poster}
        alt={title}
        fill
        sizes="100vw"
        priority
        className="z-10 object-contain"
      />
    </div>
  );
}

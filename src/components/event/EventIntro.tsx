import Image from "next/image";

interface EventIntroProps {
  images: string[]; // 소개용 이미지 (썸네일 제외, 포스터·출연자·줄거리 등)
}

export default function EventIntro({ images }: EventIntroProps) {
  if (images.length === 0) return null;

  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-lg font-bold text-gray-900">공연 소개</h2>
      <div className="flex flex-col gap-3">
        {images.map((src, index) => (
          // 크기 미상 이미지 → 자연 비율 풀폭
          <Image
            key={index}
            src={src}
            alt={`공연 소개 이미지 ${index + 1}`}
            width={0}
            height={0}
            sizes="(min-width: 1024px) 760px, 100vw"
            className="h-auto w-full rounded-2xl"
          />
        ))}
      </div>
    </section>
  );
}

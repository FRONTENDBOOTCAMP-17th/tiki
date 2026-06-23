"use client";

import { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/cn";

interface ThumbnailImageProps {
  src: string;
  alt: string;
  sizes: string;
  className?: string;
  /** LCP에 영향을 주는 화면 최상단 이미지(예: 히어로 첫 슬라이드)에만 true로 설정 */
  priority?: boolean;
}

// 썸네일이 없으면 그라데이션 placeholder, 있으면 로딩 중 스켈레톤 -> 로드 완료 시 페이드인.
// 카드형 이미지에서 공통으로 쓰는 컴포넌트라 fill 기준이며, 부모에 position:relative가 필요하다.
export default function ThumbnailImage({
  src,
  alt,
  sizes,
  className,
  priority,
}: ThumbnailImageProps) {
  const [loaded, setLoaded] = useState(false);

  if (!src) {
    return (
      <div className="h-full w-full bg-linear-to-br from-accent-300 to-primary-500" />
    );
  }

  return (
    <>
      {!loaded && <div className="absolute inset-0 animate-pulse bg-gray-200" />}
      <Image
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        priority={priority}
        onLoad={() => setLoaded(true)}
        className={cn(
          "transition-opacity duration-300",
          loaded ? "opacity-100" : "opacity-0",
          className,
        )}
      />
    </>
  );
}

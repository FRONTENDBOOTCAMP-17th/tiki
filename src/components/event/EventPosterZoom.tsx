"use client";

import Image from "next/image";
import { useRef, type PointerEvent } from "react";

const LENS_SIZE = 128;
const ZOOM_SCALE = 2.2;

interface EventPosterZoomProps {
  src: string;
  alt: string;
}

export default function EventPosterZoom({ src, alt }: EventPosterZoomProps) {
  const lensRef = useRef<HTMLDivElement>(null);

  function handlePointerMove(event: PointerEvent<HTMLDivElement>) {
    const lens = lensRef.current;
    if (!lens) return;

    const rect = event.currentTarget.getBoundingClientRect();
    const x = Math.min(
      100,
      Math.max(0, ((event.clientX - rect.left) / rect.width) * 100),
    );
    const y = Math.min(
      100,
      Math.max(0, ((event.clientY - rect.top) / rect.height) * 100),
    );

    lens.style.setProperty("--lens-x", `${x}%`);
    lens.style.setProperty("--lens-y", `${y}%`);
  }

  return (
    <div
      className="group relative aspect-5/7 h-full overflow-hidden rounded-lg shadow-md"
      onPointerMove={handlePointerMove}
    >
      <Image
        src={src}
        alt={alt}
        fill
        sizes="(max-width: 768px) 60vw, 360px"
        priority
        className="object-cover"
      />
      <div
        ref={lensRef}
        aria-hidden="true"
        className="pointer-events-none absolute rounded-full border-2 border-white bg-white opacity-0 shadow-2xl ring-1 ring-black/10 transition-opacity duration-150 group-hover:opacity-100"
        style={{
          width: LENS_SIZE,
          height: LENS_SIZE,
          left: `calc(var(--lens-x, 50%) - ${LENS_SIZE / 2}px)`,
          top: `calc(var(--lens-y, 50%) - ${LENS_SIZE / 2}px)`,
          backgroundImage: `url(${src})`,
          backgroundSize: `${ZOOM_SCALE * 100}% ${ZOOM_SCALE * 100}%`,
          backgroundPosition: "var(--lens-x, 50%) var(--lens-y, 50%)",
          backgroundRepeat: "no-repeat",
        }}
      />
      <div className="pointer-events-none absolute inset-0 rounded-lg ring-1 ring-white/20" />
    </div>
  );
}

"use client";
import { useRef, useState, useEffect, useTransition } from "react";
import { Camera, ImageUp, RotateCcw } from "lucide-react";
import { uploadAvatar, resetAvatar } from "@/app/action";
import Image from "next/image";

// 이미지를 webp로 변환 + 리사이즈 (최대 512px)
async function toWebp(file: File, maxSize = 512): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, maxSize / Math.max(bitmap.width, bitmap.height));
  const w = Math.round(bitmap.width * scale);
  const h = Math.round(bitmap.height * scale);

  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0, w, h);
  bitmap.close();

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("변환 실패"))),
      "image/webp",
      0.85,
    );
  });
}

export default function AvatarUpload({
  initialUrl,
}: {
  initialUrl: string | null;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const [url, setUrl] = useState(initialUrl);
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  // 바깥 클릭 / ESC 닫기
  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      alert("10MB 이하 이미지만 업로드 가능합니다.");
      return;
    }

    const webp = await toWebp(file);
    const formData = new FormData();
    formData.append("avatar", webp, "avatar.webp");

    startTransition(async () => {
      const result = await uploadAvatar(formData);
      if (result?.error) {
        alert(result.error);
        return;
      }
      if (result?.url) setUrl(result.url);
      setOpen(false);
    });
  };

  const handleReset = () => {
    startTransition(async () => {
      const result = await resetAvatar();
      if (result?.error) {
        alert(result.error);
        return;
      }
      setUrl(null);
      setOpen(false);
    });
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <div ref={wrapRef} className="relative">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          disabled={pending}
          className="relative block disabled:opacity-50"
        >
          <div className="relative size-20 overflow-hidden rounded-full bg-gradient-to-br from-primary-300 to-secondary-300">
            {url && (
              <Image src={url} alt="프로필" fill sizes="80px" className="object-cover" />
            )}
          </div>
          <span className="absolute bottom-0 right-0 flex size-7 items-center justify-center rounded-full bg-primary-500 text-white shadow-md">
            <Camera size={14} />
          </span>
        </button>

        {/* 팝오버 */}
        {open && (
          <div className="absolute left-1/2 top-[calc(100%+8px)] z-20 w-44 -translate-x-1/2 overflow-hidden rounded-xl border border-gray-100 bg-white py-1 shadow-lg">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={pending}
              className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-sm text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50"
            >
              <ImageUp size={16} className="text-primary-700" />
              사진 변경
            </button>
            {url && (
              <button
                type="button"
                onClick={handleReset}
                disabled={pending}
                className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-sm text-danger-600 transition-colors hover:bg-gray-50 disabled:opacity-50"
              >
                <RotateCcw size={16} className="text-danger-500" />
                기본 이미지로 변경
              </button>
            )}
          </div>
        )}
      </div>

      <p className="text-xs text-gray-400">
        {pending ? "업로드 중..." : "10MB 이하 이미지만 업로드 가능합니다."}
      </p>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        hidden
        onChange={handleChange}
      />
    </div>
  );
}

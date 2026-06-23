"use client";
import { useRef, useState, useTransition } from "react";
import { Camera, ImageUp, RotateCcw } from "lucide-react";
import { uploadAvatar, resetAvatar } from "@/app/action";
import Modal from "@/components/modal/Modal";

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
  const [url, setUrl] = useState(initialUrl);
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

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
      <button
        type="button"
        onClick={() => setOpen(true)}
        disabled={pending}
        className="relative disabled:opacity-50"
      >
        <div className="size-20 overflow-hidden rounded-full bg-gradient-to-br from-primary-300 to-secondary-300">
          {url && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={url} alt="프로필" className="size-20 object-cover" />
          )}
        </div>
        <span className="absolute bottom-0 right-0 flex size-7 items-center justify-center rounded-full bg-accent-400 text-white shadow-md">
          <Camera size={14} />
        </span>
      </button>

      <p className="text-xs text-gray-400">
        {pending ? "업로드 중..." : "10MB 이하 이미지만 업로드 가능합니다."}
      </p>

      <Modal open={open} onClose={() => setOpen(false)} position="sheet">
        <Modal.Header>프로필 사진</Modal.Header>
        <Modal.Body>
          <div className="flex flex-col gap-2">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={pending}
              className="flex items-center gap-3 rounded-xl border border-gray-100 p-4 text-left transition-colors hover:bg-gray-50 disabled:opacity-50"
            >
              <ImageUp size={20} className="text-primary-600" />
              <span className="font-medium text-gray-900">사진 변경</span>
            </button>

            {url && (
              <button
                type="button"
                onClick={handleReset}
                disabled={pending}
                className="flex items-center gap-3 rounded-xl border border-gray-100 p-4 text-left transition-colors hover:bg-gray-50 disabled:opacity-50"
              >
                <RotateCcw size={20} className="text-danger-500" />
                <span className="font-medium text-danger-600">
                  기본 이미지로 변경
                </span>
              </button>
            )}
          </div>
        </Modal.Body>
      </Modal>

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

"use client";

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import Image from "next/image";
import { Plus, X, Star } from "lucide-react";
import useToast from "@/hooks/useToast";
import { SELLER_EVENT_LIMITS } from "@/app/seller/_lib/limits";

export interface EventImageFieldsHandle {
  resolve: () => Promise<{ thumbnail: string; images: string[] }>;
}

type ImageItem = { key: string; url?: string; file?: File; preview?: string };

interface Props {
  initialThumbnail?: string | null;
  initialDetails?: string[];
}

const MAX = SELLER_EVENT_LIMITS.maxImagesPerEvent;

const newKey = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2);

function fromFile(file: File): ImageItem {
  return { key: newKey(), file, preview: URL.createObjectURL(file) };
}

function srcOf(item: ImageItem) {
  return item.url ?? item.preview ?? "";
}

const EventImageFields = forwardRef<EventImageFieldsHandle, Props>(
  function EventImageFields({ initialThumbnail, initialDetails = [] }, ref) {
    const toast = useToast();
    const [images, setImages] = useState<ImageItem[]>(() => {
      const start = initialThumbnail
        ? [initialThumbnail, ...initialDetails]
        : initialDetails;
      return start.map((url) => ({ key: newKey(), url }));
    });

    const liveRef = useRef<ImageItem[]>([]);
    useEffect(() => {
      liveRef.current = images;
    }, [images]);
    useEffect(() => {
      return () => {
        liveRef.current.forEach(
          (item) => item.preview && URL.revokeObjectURL(item.preview),
        );
      };
    }, []);

    function addFiles(list: FileList | null) {
      if (!list) return;
      const selected = Array.from(list);
      if (
        selected.some(
          (f) => f.size > SELLER_EVENT_LIMITS.maxImageSizeMb * 1024 * 1024,
        )
      ) {
        toast.error(`이미지는 ${SELLER_EVENT_LIMITS.maxImageSizeMb}MB 이하만 올릴 수 있어요`);
        return;
      }
      const room = MAX - images.length;
      if (room <= 0) {
        toast.error(`이미지는 최대 ${MAX}장까지예요`);
        return;
      }
      if (selected.length > room) {
        toast.error(`이미지는 최대 ${MAX}장까지예요`);
      }
      setImages((prev) => [...prev, ...selected.slice(0, room).map(fromFile)]);
    }

    function remove(i: number) {
      setImages((prev) => {
        const target = prev[i];
        if (target?.preview) URL.revokeObjectURL(target.preview);
        return prev.filter((_, idx) => idx !== i);
      });
    }

    function makeCover(i: number) {
      setImages((prev) => {
        if (i === 0) return prev;
        const next = [...prev];
        const [picked] = next.splice(i, 1);
        next.unshift(picked);
        return next;
      });
    }

    useImperativeHandle(ref, () => ({
      async resolve() {
        const fileItems = images.filter((item) => item.file);
        let uploaded: string[] = [];
        if (fileItems.length > 0) {
          const form = new FormData();
          fileItems.forEach((item) => form.append("files", item.file!));
          const res = await fetch("/api/seller/event/images", {
            method: "POST",
            body: form,
          });
          if (!res.ok) throw new Error("image_upload_failed");
          const json = await res.json();
          uploaded = json.data.urls as string[];
        }
        let cursor = 0;
        const resolved = images.map((item) => item.url ?? uploaded[cursor++]);
        return {
          thumbnail: resolved[0] ?? "",
          images: resolved.slice(1),
        };
      },
    }));

    return (
      <div>
        <p className="mb-3 text-sm text-gray-500">
          ★ 을 누른 사진이 대표 이미지(맨 앞)가 돼요. 최대 {MAX}장 (
          {images.length}/{MAX})
        </p>

        <div className="flex flex-wrap gap-3">
          {images.map((item, i) => {
            const isCover = i === 0;
            return (
              <div key={item.key} className="relative h-28 w-28">
                <Image
                  src={srcOf(item)}
                  alt=""
                  fill
                  unoptimized
                  className="rounded-lg object-cover"
                />

                {isCover && (
                  <span className="absolute left-1 top-1 rounded bg-primary-700 px-1.5 py-0.5 text-[10px] font-medium text-white">
                    대표
                  </span>
                )}

                <button
                  type="button"
                  onClick={() => remove(i)}
                  className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-gray-900 text-white"
                >
                  <X size={12} />
                </button>

                <button
                  type="button"
                  onClick={() => makeCover(i)}
                  aria-label="대표 이미지로 지정"
                  className={`absolute bottom-1 right-1 flex h-7 w-7 items-center justify-center rounded-full transition-colors ${
                    isCover
                      ? "bg-primary-700 text-white"
                      : "bg-white/85 text-gray-500 hover:text-primary-700 dark:bg-surface-1/90 dark:text-gray-300 dark:hover:text-white"
                  }`}
                >
                  <Star size={15} fill={isCover ? "currentColor" : "none"} />
                </button>
              </div>
            );
          })}

          {images.length < MAX && (
            <label className="flex h-28 w-28 cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-gray-200 text-gray-400 hover:border-primary-300 hover:text-primary-600 dark:border-surface-3 dark:bg-surface-2 dark:text-gray-500 dark:hover:border-gray-500 dark:hover:text-gray-100">
              <Plus size={20} />
              <span className="text-[11px]">이미지 추가</span>
              <input
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(e) => {
                  addFiles(e.target.files);
                  e.target.value = "";
                }}
              />
            </label>
          )}
        </div>
      </div>
    );
  },
);

export default EventImageFields;

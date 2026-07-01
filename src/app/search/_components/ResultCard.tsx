import Image from "next/image";
import Link from "next/link";
import { MapPin } from "lucide-react";
import type { SortItem } from "@/components/Search/filterSort";
import { formatEventDate, formatPrice } from "./utils";

// 검색결과 1건 — 세로 포스터형 카드. id가 있으면 상세로 이동.
export default function ResultCard({ item }: { item: SortItem }) {
  const content = (
    <>
      <div className="relative aspect-3/4 w-full overflow-hidden rounded-2xl bg-linear-to-br from-primary-200 to-accent-200">
        {item.image && (
          <Image
            src={item.image}
            alt={item.name}
            fill
            sizes="(min-width: 1024px) 20vw, 45vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        )}
      </div>
      <div className="flex flex-col gap-1 px-0.5 pt-2.5">
        <h3 className="truncate text-sm font-semibold text-gray-900 dark:text-gray-50">
          {item.name}
        </h3>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          {formatEventDate(item.date)}
        </p>
        {item.location && (
          <span className="flex items-center gap-1 text-xs text-gray-400 dark:text-gray-500">
            <MapPin className="h-3 w-3 shrink-0" />
            <span className="truncate">{item.location}</span>
          </span>
        )}
        {item.minPrice != null && (
          <p className="mt-0.5 text-xs font-semibold text-primary-700">
            {formatPrice(item.minPrice)}~
          </p>
        )}
      </div>
    </>
  );

  return (
    <li>
      {item.id != null ? (
        <Link href={`/${item.id}`} className="group block">
          {content}
        </Link>
      ) : (
        <div className="block">{content}</div>
      )}
    </li>
  );
}

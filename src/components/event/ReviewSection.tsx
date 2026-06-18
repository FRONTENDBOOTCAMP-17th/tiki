import { Star } from "lucide-react";
import Avatar from "@/components/Avatar";
import { cn } from "@/lib/cn";
import { Review } from "@/types/domain/event";

// 현재 리뷰 작성 기능이 없어 예시 데이터를 불러오면 작성자 이름이 없음
// -> 현재 익명으로 나오고 나중에 추가해야 함

interface ReviewSectionProps {
  rating: number;
  reviewCount: number;
  reviews: Review[];
}
// 가운데 이름 마스킹
function maskName(name: string) {
  if (name.length <= 1) return name;
  if (name.length === 2) return `${name[0]}*`;
  return `${name[0]}${"*".repeat(name.length - 2)}${name[name.length - 1]}`;
}

function formatDate(iso: string) {
  return iso.slice(0, 10).replace(/-/g, ".");
}

function Stars({ rating, className }: { rating: number; className?: string }) {
  return (
    <div className={cn("flex items-center gap-0.5", className)}>
      {[0, 1, 2, 3, 4].map((i) => (
        <Star
          key={i}
          className={cn(
            "h-3.5 w-3.5",
            i < Math.round(rating)
              ? "fill-yellow-400 text-yellow-400"
              : "text-gray-300",
          )}
        />
      ))}
    </div>
  );
}

export default function ReviewSection({
  rating,
  reviewCount,
  reviews,
}: ReviewSectionProps) {
  return (
    <section className="flex flex-col gap-4">
      {/* 헤더 : 관람 후기 + 평균 평점 + 개수 */}
      <div className="flex items-center gap-2">
        <h2 className="text-lg font-bold text-gray-900">관람 후기</h2>
        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
        <span className="text-sm font-semibold text-gray-900">{rating}</span>
        <span className="text-sm text-gray-400">({reviewCount}개)</span>
      </div>

      {/* 리스트 */}
      {reviews.length === 0 ? (
        <p className="text-sm text-gray-400">아직 등록된 후기가 없습니다.</p>
      ) : (
        <ul className="flex flex-col divide-y divide-gray-100">
          {reviews.map((review) => {
            // users 권한 잠김으로 이름이 없을 수 있음 → "익명"
            const displayName = review.userName
              ? maskName(review.userName)
              : "익명";
            return (
              <li
                key={review.reviewId}
                className="flex flex-col gap-2 py-4 first:pt-0"
              >
                <div className="flex items-center gap-3">
                  <Avatar
                    seed={review.userName || "익명"}
                    className="size-9 text-sm"
                  />
                  <div className="flex flex-col gap-0.5">
                    <span className="text-sm font-semibold text-gray-900">
                      {displayName}
                    </span>
                    <Stars rating={review.rating} />
                  </div>
                  <span className="ml-auto text-xs text-gray-400">
                    {formatDate(review.createdAt)}
                  </span>
                </div>
                <p className="text-sm text-gray-700">{review.memo}</p>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

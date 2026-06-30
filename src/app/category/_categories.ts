import {
  Spotlight,
  HandHeart,
  Theater,
  Landmark,
  School,
  Volleyball,
  Balloon,
  Drama,
  Presentation,
  Music,
  Tag,
  type LucideIcon,
} from "lucide-react";

export interface Category {
  slug: string;
  name: string;
  Icon: LucideIcon;
}

// 이름/정렬은 DB(category 테이블)에서 가져오고, 아이콘만 slug 기준으로 코드에서 매핑한다.
// slug 값은 DB의 category.slug 기준.
export const categories: Category[] = [
  { slug: "concert", name: "콘서트", Icon: Spotlight },
  { slug: "fanmeeting", name: "팬미팅", Icon: HandHeart },
  { slug: "musical", name: "뮤지컬/연극", Icon: Theater },
  { slug: "exhibition", name: "전시", Icon: Landmark },
  { slug: "class", name: "클래스", Icon: School },
  { slug: "sports", name: "스포츠", Icon: Volleyball },
  { slug: "festival", name: "축제/행사", Icon: Balloon },
  { slug: "performance", name: "공연", Icon: Drama },
  { slug: "speech", name: "강연", Icon: Presentation },
  { slug: "music", name: "음악", Icon: Music },
];

const iconBySlug = new Map(categories.map((c) => [c.slug, c.Icon]));

// slug에 매핑된 아이콘 (없으면 기본 아이콘)
export function getCategoryIcon(slug: string): LucideIcon {
  return iconBySlug.get(slug) ?? Tag;
}

// 카테고리 타일 아이콘 색 (slug 기준). purge 때문에 전체 클래스 문자열로 둔다.
const colorBySlug: Record<string, string> = {
  concert: "bg-violet-100 text-violet-600",
  fanmeeting: "bg-rose-100 text-rose-600",
  musical: "bg-amber-100 text-amber-600",
  exhibition: "bg-emerald-100 text-emerald-600",
  class: "bg-sky-100 text-sky-600",
  sports: "bg-orange-100 text-orange-600",
  festival: "bg-fuchsia-100 text-fuchsia-600",
  performance: "bg-indigo-100 text-indigo-600",
  speech: "bg-teal-100 text-teal-600",
  music: "bg-pink-100 text-pink-600",
};

// slug에 매핑된 아이콘 색 (없으면 기본 회색)
export function getCategoryColor(slug: string): string {
  return colorBySlug[slug] ?? "bg-gray-100 text-gray-500";
}

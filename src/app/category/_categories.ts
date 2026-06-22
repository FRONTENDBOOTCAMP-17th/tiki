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

import {
  Presentation,
  School,
  Spotlight,
  Landmark,
  HandHeart,
  Balloon,
  Music,
  Theater,
  Drama,
  Volleyball,
  type LucideIcon,
} from "lucide-react";

export interface Category {
  slug: string;
  name: string;
  Icon: LucideIcon;
}

// 고정 카테고리 (API 없이 코드에서 직접 관리)
export const categories: Category[] = [
  { slug: "lecture", name: "강연", Icon: Presentation },
  { slug: "class", name: "클래스", Icon: School },
  { slug: "concert", name: "콘서트", Icon: Spotlight },
  { slug: "exhibition", name: "전시", Icon: Landmark },
  { slug: "fanmeeting", name: "팬미팅", Icon: HandHeart },
  { slug: "festival", name: "축제/행사", Icon: Balloon },
  { slug: "music", name: "음악", Icon: Music },
  { slug: "musical", name: "뮤지컬/연극", Icon: Theater },
  { slug: "performance", name: "공연", Icon: Drama },
  { slug: "sports", name: "스포츠", Icon: Volleyball },
];

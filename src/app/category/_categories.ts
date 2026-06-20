import {
  Shapes,
  Spotlight,
  HandHeart,
  Theater,
  Landmark,
  School,
  Volleyball,
  Balloon,
  type LucideIcon,
} from "lucide-react";

export interface Category {
  slug: string;
  name: string;
  Icon: LucideIcon;
}

// 고정 카테고리 (API 없이 코드에서 직접 관리)
export const categories: Category[] = [
  { slug: "all", name: "전체", Icon: Shapes },
  { slug: "concert", name: "콘서트", Icon: Spotlight },
  { slug: "fanmeeting", name: "팬미팅", Icon: HandHeart },
  { slug: "musical", name: "뮤지컬/연극", Icon: Theater },
  { slug: "exhibition", name: "전시", Icon: Landmark },
  { slug: "class", name: "클래스", Icon: School },
  { slug: "sports", name: "스포츠", Icon: Volleyball },
  { slug: "festival", name: "축제/행사", Icon: Balloon },
];

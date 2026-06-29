import type { EventCardItem } from "@/types/domain/event";

export interface HomeEventCardItem extends EventCardItem {
  endDate?: string;
  createdAt?: string;
}

export interface BestReviewItem {
  reviewId: string;
  eventId: string;
  eventTitle: string;
  eventThumbnail: string;
  author: string;
  rating: number;
  memo: string;
  likeCount: number;
}

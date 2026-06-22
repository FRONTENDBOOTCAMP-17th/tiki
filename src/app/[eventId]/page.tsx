"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ChevronLeft, MapPin, User, Star, Clock, Calendar } from "lucide-react";

import Header from "@/components/Header";
import useAuthStatus from "@/hooks/useAuthStatus";
import Spinner from "@/components/Spinner";
import EventImg from "@/components/event/EventImg";
import Notice from "@/components/Notice";
import BookingWidget from "@/components/event/BookingWidget";
import { BookingSelection } from "@/components/event/BookingPanel";
import ReviewSection from "@/components/event/ReviewSection";
import EventIntro from "@/components/event/EventIntro";
import { EventDetail, Slot, Grade, Review } from "@/types/domain/event";
import {
  EventDetailResponse,
  SlotListResponse,
  GradeListResponse,
  ReviewListResponse,
} from "@/types/api/event";

// 예시데이터
const MOCK_EVENT: EventDetail = {
  eventId: "evt_mock",
  title: "미드나잇 라이브 2026",
  category: "콘서트",
  description:
    "미드나잇 라이브 2026에 오신 것을 환영합니다. 공연 시작 30분 전부터 입장 가능하며, 공연 중 사진 및 영상 촬영은 금지됩니다.",
  images: [
    "https://picsum.photos/seed/tiki-poster/400/560", // [0] 썸네일
    "https://picsum.photos/seed/tiki-intro1/1200/1600", // [1~] 공연 소개 이미지
    "https://picsum.photos/seed/tiki-intro2/1200/900",
    "https://picsum.photos/seed/tiki-intro3/1200/1500",
  ],
  venue: { address: "서울 마포구 홍대 라이브홀", detailAddress: "B1 라이브홀" },
  seller: {
    sellerId: "sel_mock",
    storeName: "미드나잇 프로덕션",
  },
  duration: 150,
  intermission: 15,
  startDate: "2026-06-14",
  endDate: "2026-06-21",
  status: "on_sale", // "closed" 라면 "매진되었습니다" 표시
  rating: 4.8,
  reviewCount: 2,
  isBookmarked: false,
};

// 예시 회차 (SLOT-01 미연결)
const MOCK_SLOTS: Slot[] = [
  {
    slotId: "slt_1",
    eventId: "evt_mock",
    date: "2026-06-14",
    startTime: "19:00",
    endTime: "21:30",
    isClosed: false,
  },
  {
    slotId: "slt_2",
    eventId: "evt_mock",
    date: "2026-06-15",
    startTime: "19:00",
    endTime: "21:30",
    isClosed: false,
  },
  {
    slotId: "slt_3",
    eventId: "evt_mock",
    date: "2026-06-21",
    startTime: "19:00",
    endTime: "21:30",
    isClosed: false,
  },
];

// 예시 등급 (ticket_grade 미연결) — 이벤트 단위, quantity 0 이면 매진
const MOCK_GRADES: Grade[] = [
  {
    gradeId: "grd_1",
    eventId: "evt_mock",
    name: "일반석",
    price: 44000,
    quantity: 50,
  },
  {
    gradeId: "grd_2",
    eventId: "evt_mock",
    name: "VIP석",
    price: 68000,
    quantity: 0,
  },
];

// 예시 후기 (REVIEW-04 불러오기는 완성함. 리뷰 작성하기 만든 후 불러와야 함)
const MOCK_REVIEWS: Review[] = [
  {
    reviewId: "rev_1",
    userName: "강민영",
    userProfileImage: "",
    rating: 5,
    memo: "정말 멋진 공연이었어요! 음향도 좋고 분위기도 최고였습니다. 다음에 또 오고 싶어요.",
    createdAt: "2026-05-20",
  },
  {
    reviewId: "rev_2",
    userName: "이민수",
    userProfileImage: "",
    rating: 5,
    memo: "공연 퀄리티는 훌륭했는데 좌석이 조금 불편했어요. 그래도 전반적으로 만족스러웠습니다.",
    createdAt: "2026-05-19",
  },
];

// 최초 공연 날짜 (가장 이른 회차)
function formatFirstDate(slots: Slot[]) {
  if (!slots.length) return null;
  const earliest = slots.map((s) => s.date).sort()[0];
  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "short",
  }).format(new Date(`${earliest}T00:00:00`));
}

// 특정 섹션으로 부드럽게 스크롤
function scrollToId(id: string) {
  document
    .getElementById(id)
    ?.scrollIntoView({ behavior: "smooth", block: "start" });
}

// 공연 기간 (event.start_date ~ end_date)
function formatPeriod(start: string, end: string) {
  const toDot = (d: string) => d.replace(/-/g, ".");
  return start === end ? toDot(start) : `${toDot(start)} ~ ${toDot(end)}`;
}

export default function EventDetailPage() {
  const router = useRouter();
  const { eventId } = useParams<{ eventId: string }>();
  const loggedIn = useAuthStatus();

  // 로딩 중에는 스피너만 노출. fetch 실패/데이터 없을 때만 예시 데이터로 폴백 (나중에 예시데이터 삭제 필요)
  const [event, setEvent] = useState<EventDetail | null>(null);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  // 미연결 시 예시 데이터로 대체
  const displaySlots = slots.length ? slots : MOCK_SLOTS;
  const displayGrades = grades.length ? grades : MOCK_GRADES;
  const displayReviews = reviews.length ? reviews : MOCK_REVIEWS;
  const firstShowDate = formatFirstDate(displaySlots);

  // 평점/리뷰수는 표시 중인 리뷰에서 집계 (REVIEW-04 결과 또는 mock)
  const reviewCount = displayReviews.length;
  const averageRating = reviewCount
    ? Math.round(
        (displayReviews.reduce((s, r) => s + r.rating, 0) / reviewCount) * 10,
      ) / 10
    : 0;

  async function createOrder(
    selection: BookingSelection,
    status: "cart" | "ordered",
  ) {
    const res = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        eventId,
        slotId: selection.slotId,
        ticketGradeId: selection.gradeId,
        quantity: selection.quantity,
        status,
      }),
    });
    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.message || "예매 처리에 실패했습니다.");
    }
    return json.data as { orderId: string };
  }
  async function handleAddToCart(selection: BookingSelection) {
    try {
      await createOrder(selection, "cart");
      alert("장바구니에 담았습니다.");
    } catch (error) {
      alert(
        error instanceof Error ? error.message : "장바구니 담기에 실패했습니다.",
      );
    }
  }
  async function handleBookNow(selection: BookingSelection) {
    try {
      const { orderId } = await createOrder(selection, "ordered");
      router.push(`/payment/${orderId}`);
    } catch (error) {
      alert(error instanceof Error ? error.message : "예매 처리에 실패했습니다.");
    }
  }

  // EVENT-02 이벤트 상세 조회
  useEffect(() => {
    if (!eventId) return;
    let ignore = false;

    (async () => {
      try {
        const res = await fetch(`/api/events/${eventId}`);
        const json: EventDetailResponse = await res.json();
        if (ignore) return;
        // 데이터 있으면 실제 값, 없으면(시드 미존재 등) 예시 데이터로 폴백
        setEvent(json.success ? json.data : MOCK_EVENT);
      } catch {
        if (!ignore) setEvent(MOCK_EVENT); // 네트워크 실패 시 예시 데이터 폴백
      } finally {
        if (!ignore) setLoading(false);
      }
    })();

    return () => {
      ignore = true;
    };
  }, [eventId]);

  // SLOT-01 이벤트별 회차 목록
  useEffect(() => {
    if (!eventId) return;
    let ignore = false;

    (async () => {
      try {
        const res = await fetch(`/api/events/${eventId}/slots`);
        const json: SlotListResponse = await res.json();
        if (!ignore && json.success) setSlots(json.data.slots);
      } catch {
        if (!ignore) setSlots([]);
      }
    })();

    return () => {
      ignore = true;
    };
  }, [eventId]);

  // 이벤트별 좌석 등급 목록 (ticket_grade)
  useEffect(() => {
    if (!eventId) return;
    let ignore = false;

    (async () => {
      try {
        const res = await fetch(`/api/events/${eventId}/grades`);
        const json: GradeListResponse = await res.json();
        if (!ignore && json.success) setGrades(json.data.grades);
      } catch {
        if (!ignore) setGrades([]);
      }
    })();

    return () => {
      ignore = true;
    };
  }, [eventId]);

  // REVIEW-04 이벤트별 리뷰 목록
  useEffect(() => {
    if (!eventId) return;
    let ignore = false;

    (async () => {
      try {
        const res = await fetch(`/api/events/${eventId}/reviews`);
        const json: ReviewListResponse = await res.json();
        if (!ignore && json.success) setReviews(json.data.reviews);
      } catch {
        if (!ignore) setReviews([]);
      }
    })();

    return () => {
      ignore = true;
    };
  }, [eventId]);

  return (
    <>
      {/* Header: 풀폭 (max-width 밖) */}
      <Header loggedIn={loggedIn} />

      <main className="mx-auto w-full max-w-7xl pb-24">
        {/* 목록으로 */}
        <button
          type="button"
          onClick={() => router.back()}
          className="flex items-center gap-1 px-4 py-3 text-sm text-gray-600"
        >
          <ChevronLeft className="h-4 w-4" />
          목록으로
        </button>

        {loading && (
          <div className="flex justify-center py-24">
            <Spinner size="lg" color="primary" />
          </div>
        )}

        {!loading && !event && (
          <p className="p-8 text-center text-gray-500">
            존재하지 않는 공연입니다.
          </p>
        )}

        {event && (
          <>
            <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start lg:gap-8 lg:px-4">
              {/* 좌측 : 상세 본문 */}
              <div>
                {/* 상단 포스터 : 블러 배경 + 원본 (썸네일은 images[0]) */}
                <EventImg poster={event.images[0] ?? ""} title={event.title} />

                <div className="flex flex-col gap-6 px-4 pt-4 lg:px-0">
                  {/* 카테고리 + 제목 + 메타 */}
                  <section className="flex flex-col gap-3">
                    <span className="w-fit rounded-xl bg-[#E891FF] px-3 py-1 text-xs font-medium text-white">
                      {event.category}
                    </span>
                    <h1 className="text-2xl font-bold text-gray-900">
                      {event.title}
                    </h1>

                    <ul className="flex flex-col gap-2 text-sm text-gray-600">
                      {firstShowDate && (
                        <li>
                          <button
                            type="button"
                            onClick={() => scrollToId("event-info")}
                            className="flex items-center gap-2 hover:text-primary-700"
                          >
                            <Clock className="h-4 w-4 shrink-0 text-primary-600" />
                            최초공연날짜 : {firstShowDate}
                          </button>
                        </li>
                      )}
                      <li>
                        <button
                          type="button"
                          onClick={() => scrollToId("event-info")}
                          className="flex items-center gap-2 hover:text-primary-700"
                        >
                          <MapPin className="h-4 w-4 shrink-0 text-primary-600" />
                          {event.venue.address}
                        </button>
                      </li>
                      <li>
                        <button
                          type="button"
                          onClick={() => scrollToId("event-intro")}
                          className="flex items-center gap-2 hover:text-primary-700"
                        >
                          <User className="h-4 w-4 shrink-0 text-primary-600" />
                          {event.seller?.storeName || "비공개"}
                        </button>
                      </li>
                      <li>
                        <button
                          type="button"
                          onClick={() => scrollToId("event-reviews")}
                          className="flex items-center gap-2 hover:text-primary-700"
                        >
                          <Star className="h-4 w-4 shrink-0 text-yellow-400" />
                          {averageRating} ({reviewCount}개 리뷰)
                        </button>
                      </li>
                    </ul>
                  </section>

                  {/* 공연정보 */}
                  <section id="event-info" className="flex flex-col gap-3">
                    <h2 className="text-lg font-bold text-gray-900">
                      공연정보
                    </h2>
                    <ul className="flex flex-col gap-4 rounded-2xl border border-info-border p-4">
                      {/* 기간 (event.start_date ~ end_date) */}
                      <li className="flex items-center gap-3">
                        <Calendar className="h-5 w-5 shrink-0 text-info-accent" />
                        <div className="flex flex-col gap-0.5">
                          <p className="text-xs font-medium text-info-accent">
                            기간
                          </p>
                          <p className="text-sm text-gray-900">
                            {formatPeriod(event.startDate, event.endDate)}
                          </p>
                        </div>
                      </li>

                      {/* 시간 */}
                      <li className="flex items-center gap-3">
                        <Clock className="h-5 w-5 shrink-0 text-info-accent" />
                        <div className="flex flex-col gap-0.5">
                          <p className="text-xs font-medium text-info-accent">
                            시간
                          </p>
                          <p className="text-sm text-gray-900">
                            {`${event.duration}분 (${
                              event.intermission
                                ? `인터미션 ${event.intermission}분 포함`
                                : "인터미션 없음"
                            })`}
                          </p>
                        </div>
                      </li>

                      {/* 장소 */}
                      <li className="flex items-center gap-3">
                        <MapPin className="h-5 w-5 shrink-0 text-info-accent" />
                        <div className="flex flex-col gap-0.5">
                          <p className="text-xs font-medium text-info-accent">
                            장소
                          </p>
                          <p className="text-sm text-gray-900">
                            {event.venue.address} {event.venue.detailAddress}
                          </p>
                        </div>
                      </li>
                    </ul>
                  </section>

                  {/* 안내사항 */}
                  {event.description && (
                    <Notice title="안내사항" description={event.description} />
                  )}

                  {/* 공연 소개 : 판매자 소개 이미지 (썸네일 제외) */}
                  <div id="event-intro">
                    <EventIntro images={event.images.slice(1)} />
                  </div>
                </div>
              </div>

              {/* 우측 : 예매 위젯 (데스크탑 사이드 / 모바일 하단 시트) */}
              <BookingWidget
                slots={displaySlots}
                grades={displayGrades}
                soldOut={event.status === "closed"}
                onAddToCart={handleAddToCart}
                onBookNow={handleBookNow}
              />
            </div>

            {/* 관람 후기 : 모바일/태블릿/데스크탑 모두 풀폭 (그리드 밖) */}
            <div id="event-reviews" className="px-4 pt-6 lg:px-4">
              <ReviewSection
                rating={averageRating}
                reviewCount={reviewCount}
                reviews={displayReviews}
              />
            </div>
          </>
        )}
      </main>
    </>
  );
}

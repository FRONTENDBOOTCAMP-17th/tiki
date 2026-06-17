"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ChevronLeft, MapPin, User, Star, Clock } from "lucide-react";

import EventImg from "@/components/event/EventImg";
import Notice from "@/components/Notice";
import { EventDetail, Slot } from "@/types/domain/event";
import { EventDetailResponse, SlotListResponse } from "@/types/api/event";

// TODO: EVENT-02 API 연결되면 제거. 지금은 화면 확인용 임시 데이터.
const MOCK_EVENT: EventDetail = {
  eventId: "evt_mock",
  title: "미드나잇 라이브 2026",
  category: "콘서트",
  description:
    "미드나잇 라이브 2026에 오신 것을 환영합니다. 공연 시작 30분 전부터 입장 가능하며, 공연 중 사진 및 영상 촬영은 금지됩니다.",
  images: ["https://picsum.photos/seed/tiki-poster/400/560"],
  venue: { address: "서울 마포구 홍대 라이브홀", detailAddress: "B1 라이브홀" },
  seller: { sellerId: "sel_mock", storeName: "미드나잇 프로덕션", verified: true },
  duration: 150,
  intermission: 15,
  rating: 4.8,
  reviewCount: 2,
  isBookmarked: false,
};

function formatSlotDateTime(slots: Slot[]) {
  if (!slots.length) return null;

  const sortedSlots = [...slots].sort(
    (a, b) =>
      `${a.date}T${a.startTime}`.localeCompare(`${b.date}T${b.startTime}`),
  );
  const firstSlot = sortedSlots[0];
  const date = new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "short",
  }).format(new Date(`${firstSlot.date}T00:00:00`));
  const extraCount = sortedSlots.length - 1;

  return `${date} ${firstSlot.startTime}~${firstSlot.endTime}${
    extraCount ? ` 외 ${extraCount}회` : ""
  }`;
}

export default function EventDetailPage() {
  const router = useRouter();
  const { eventId } = useParams<{ eventId: string }>();

  // 임시: mock 으로 초기화해 바로 렌더. fetch 성공 시 실제 데이터로 교체됨.
  const [event, setEvent] = useState<EventDetail | null>(MOCK_EVENT);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loading, setLoading] = useState(false);
  const slotDateTime = formatSlotDateTime(slots);

  // EVENT-02 이벤트 상세 조회
  useEffect(() => {
    if (!eventId) return;
    let ignore = false;

    (async () => {
      try {
        const res = await fetch(`/api/events/${eventId}`);
        const json: EventDetailResponse = await res.json();
        if (!ignore && json.success) setEvent(json.data);
      } catch {
        // 실패 시 event 는 null 로 남아 아래 not-found 분기로 처리
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

  return (
    <main className="mx-auto w-full max-w-3xl pb-24">
      {/* 목록으로 */}
      <button
        type="button"
        onClick={() => router.back()}
        className="flex items-center gap-1 px-4 py-3 text-sm text-gray-600"
      >
        <ChevronLeft className="h-4 w-4" />
        목록으로
      </button>

      {loading && <p className="p-8 text-center text-gray-500">불러오는 중…</p>}

      {!loading && !event && (
        <p className="p-8 text-center text-gray-500">
          존재하지 않는 공연입니다.
        </p>
      )}

      {event && (
        <>
          {/* 상단 포스터 : 블러 배경 + 원본 (썸네일은 images[0]) */}
          <EventImg poster={event.images[0] ?? ""} title={event.title} />

          <div className="flex flex-col gap-6 px-4 pt-4">
            {/* 카테고리 + 제목 + 메타 */}
            <section className="flex flex-col gap-3">
              <span className="w-fit rounded-b-xl bg-primary-500 px-3 py-1 text-xs font-medium text-white">
                {event.category}
              </span>
              <h1 className="text-2xl font-bold text-gray-900">
                {event.title}
              </h1>

              <ul className="flex flex-col gap-2 text-sm text-gray-600">
                {slotDateTime && (
                  <li className="flex items-center gap-2">
                    <Clock className="h-4 w-4 shrink-0 text-primary-600" />
                    {slotDateTime}
                  </li>
                )}
                <li className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 shrink-0 text-primary-600" />
                  {event.venue.address}
                </li>
                <li className="flex items-center gap-2">
                  <User className="h-4 w-4 shrink-0 text-primary-600" />
                  {event.seller.storeName}
                </li>
                <li className="flex items-center gap-2">
                  <Star className="h-4 w-4 shrink-0 text-yellow-400" />
                  {event.rating} ({event.reviewCount}개 리뷰)
                </li>
              </ul>
            </section>

            {/* 공연정보 */}
            <section className="flex flex-col gap-3">
              <h2 className="text-lg font-bold text-gray-900">공연정보</h2>

              <div className="flex items-center gap-3 rounded-2xl bg-primary-100 p-4">
                <Clock className="h-5 w-5 shrink-0 text-primary-700" />
                <div className="flex flex-col">
                  <p className="text-sm text-primary-700">시간</p>
                  <p className="text-gray-900">
                    {event.duration}분
                    {event.intermission
                      ? ` (인터미션 ${event.intermission}분 포함)`
                      : ""}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 rounded-2xl bg-primary-100 p-4">
                <MapPin className="h-5 w-5 shrink-0 text-primary-700" />
                <div className="flex flex-col">
                  <p className="text-sm text-primary-700">장소</p>
                  <p className="text-gray-900">
                    {event.venue.address} {event.venue.detailAddress}
                  </p>
                </div>
              </div>

              {/* TODO(API): 기간(start_date~end_date)·관람연령 — EVENT-02 응답에 없음. 백엔드 협의 필요 */}
            </section>

            {/* 안내사항 */}
            {event.description && (
              <Notice title="안내사항" description={event.description} />
            )}

            {/* TODO: 관람 후기 섹션 (REVIEW-04) */}
            {/* TODO: 예매 위젯 — 모바일 슬라이드업 / 데스크탑 캘린더. 회차 선택까지만 */}
          </div>
        </>
      )}
    </main>
  );
}

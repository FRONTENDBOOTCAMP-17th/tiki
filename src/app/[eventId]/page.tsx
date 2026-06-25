import { MapPin, Star, Clock, Calendar } from "lucide-react";

import Header from "@/components/Header";
import { getCurrentUser } from "@/lib/auth";
import {
  getEventDetail,
  getSlots,
  getGrades,
  getReviews,
  getWritableReviewSlots,
} from "@/lib/event/queries";
import EventImg from "@/components/event/EventImg";
import Notice from "@/components/Notice";
import BookingWidget from "@/components/event/BookingWidget";
import EventIntro from "@/components/event/EventIntro";
import { Slot } from "@/types/domain/event";
import BackButton from "./_components/BackButton";
import DetailTabs from "./_components/DetailTabs";
import ReviewComposer from "./_components/reviews/ReviewComposer";
import ReviewSection from "./_components/reviews/ReviewSection";

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

// 공연 기간 (event.start_date ~ end_date)
function formatPeriod(start: string, end: string) {
  const toDot = (d: string) => d.replace(/-/g, ".");
  return start === end ? toDot(start) : `${toDot(start)} ~ ${toDot(end)}`;
}

export default async function EventDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ eventId: string }>;
  searchParams: Promise<{ reviewSort?: string; reviewDirection?: string }>;
}) {
  const { eventId } = await params;
  const { reviewSort, reviewDirection } = await searchParams;
  const user = await getCurrentUser();
  const loggedIn = !!user;

  // 상세/회차/등급/리뷰를 서버에서 병렬 조회 (존재하지 않는 공연이면 event 가 null)
  const [event, slots, grades, reviewData, writableSlots] = await Promise.all([
    getEventDetail(eventId),
    getSlots(eventId),
    getGrades(eventId),
    getReviews(eventId),
    getWritableReviewSlots(eventId),
  ]);

  const firstShowDate = formatFirstDate(slots);
  const { averageRating, totalCount: reviewCount, reviews } = reviewData;
  const tabs = [
    { id: "event-info", label: "공연정보" },
    { id: "event-detail", label: "상세정보" },
    { id: "event-reviews", label: "구매평", badge: String(reviewCount) },
    { id: "venue", label: "장소" },
  ];

  return (
    <>
      {/* Header: 풀폭 (max-width 밖) */}
      <Header loggedIn={loggedIn} />

      <main className="mx-auto w-full max-w-[1180px] px-4 pb-24 sm:px-6 lg:px-8">
        {/* 목록으로 */}
        <BackButton />

        {!event ? (
          <p className="p-8 text-center text-gray-500">
            존재하지 않는 공연입니다.
          </p>
        ) : (
          <>
            <div className="lg:grid lg:grid-cols-[minmax(0,700px)_340px] lg:items-start lg:gap-7 xl:grid-cols-[minmax(0,720px)_360px] xl:gap-8">
              <div className="min-w-0">
                {/* 상단 포스터 : 블러 배경 + 원본 (썸네일은 images[0]) */}
                <EventImg poster={event.images[0] ?? ""} title={event.title} />

                <div className="pt-4">
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
                        <li className="flex items-center gap-2">
                          <Clock className="h-4 w-4 shrink-0 text-primary-600" />
                          최초공연날짜 : {firstShowDate}
                        </li>
                      )}
                      <li className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 shrink-0 text-primary-600" />
                        {event.venue.address}
                      </li>
                      <li className="flex items-center gap-2">
                        <Star className="h-4 w-4 shrink-0 text-yellow-400" />
                        {averageRating} ({reviewCount}개 리뷰)
                      </li>
                    </ul>
                  </section>
                </div>

                <div className="mt-8">
                  <DetailTabs tabs={tabs}>
                    <section className="flex min-w-0 flex-col gap-6">
                      <h2 className="text-xl font-bold text-gray-900">
                        공연정보
                      </h2>

                      <ul className="grid gap-3 rounded-lg border border-info-border p-4 sm:grid-cols-2">
                        <li className="flex items-center gap-3">
                          <Calendar className="h-5 w-5 shrink-0 text-info-accent" />
                          <div className="flex flex-col gap-0.5">
                            <p className="text-xs font-medium text-info-accent">
                              공연기간
                            </p>
                            <p className="text-sm text-gray-900">
                              {formatPeriod(event.startDate, event.endDate)}
                            </p>
                          </div>
                        </li>

                        <li className="flex items-center gap-3">
                          <Clock className="h-5 w-5 shrink-0 text-info-accent" />
                          <div className="flex flex-col gap-0.5">
                            <p className="text-xs font-medium text-info-accent">
                              공연시간
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

                        <li className="flex items-center gap-3">
                          <MapPin className="h-5 w-5 shrink-0 text-info-accent" />
                          <div className="flex flex-col gap-0.5">
                            <p className="text-xs font-medium text-info-accent">
                              공연장
                            </p>
                            <p className="text-sm text-gray-900">
                              {event.venue.address} {event.venue.detailAddress}
                            </p>
                          </div>
                        </li>

                      </ul>

                      {event.description && (
                        <Notice
                          title="안내사항"
                          description={event.description}
                        />
                      )}
                    </section>

                    <section className="flex min-w-0 flex-col gap-6">
                      <h2 className="text-xl font-bold text-gray-900">
                        상세정보
                      </h2>

                      <EventIntro images={event.images.slice(1)} />
                      {event.images.length <= 1 && (
                        <p className="rounded-lg border border-gray-100 p-8 text-center text-sm text-gray-400">
                          등록된 상세 이미지가 없습니다.
                        </p>
                      )}
                    </section>

                    <section className="flex min-w-0 flex-col gap-5">
                      {writableSlots.length > 0 && (
                        <ReviewComposer
                          eventId={eventId}
                          slots={writableSlots}
                        />
                      )}
                      <ReviewSection
                        eventId={eventId}
                        rating={averageRating}
                        reviewCount={reviewCount}
                        reviews={reviews}
                        currentUserId={user?.id}
                        sortKey={reviewSort}
                        sortDirection={reviewDirection}
                      />
                    </section>

                    <section className="min-w-0">
                      <div className="flex flex-col gap-4">
                        <h2 className="text-xl font-bold text-gray-900">
                          장소
                        </h2>
                        <div className="flex flex-col gap-4 rounded-lg border border-gray-200 p-4 text-sm">
                          <dl className="grid gap-3 md:grid-cols-2">
                            <div className="flex flex-col gap-1">
                              <dt className="text-xs font-medium text-gray-400">
                                공연장
                              </dt>
                              <dd className="font-semibold text-gray-900">
                                {event.venue.address}
                              </dd>
                            </div>
                            <div className="flex flex-col gap-1">
                              <dt className="text-xs font-medium text-gray-400">
                                상세주소
                              </dt>
                              <dd className="font-semibold text-gray-900">
                                {event.venue.detailAddress || "-"}
                              </dd>
                            </div>
                          </dl>

                          <div className="flex min-h-48 items-center justify-center rounded-lg border border-dashed border-gray-200 bg-gray-50 px-4 text-center text-sm font-medium text-gray-400">
                            지도 API 등록 예정
                          </div>
                        </div>
                      </div>
                    </section>
                  </DetailTabs>
                </div>
              </div>

              {/* 우측 : 예매 위젯 (데스크탑 사이드 / 모바일 하단 시트) */}
              <BookingWidget
                eventId={event.eventId}
                slots={slots}
                grades={grades}
                suspended={event.status === "비공개"}
                soldOut={event.status === "closed"}
              />
            </div>
          </>
        )}
      </main>
    </>
  );
}

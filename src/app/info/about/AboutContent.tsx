import Image from "next/image";
import Link from "next/link";
import {
  Armchair,
  Bell,
  CheckCircle2,
  MessageSquareText,
  QrCode,
  Search,
  Share2,
  Store,
  Ticket,
  type LucideIcon,
} from "lucide-react";

const SERVICE_FLOW = [
  "티켓 선택",
  "날짜/시간 선택",
  "예매",
  "QR 발급",
  "친구 공유",
  "입장",
  "라이브러리 기록",
];

const TARGETS = [
  {
    title: "구매자",
    desc: "공연, 클래스, 전시, 팬미팅처럼 일정이 있는 상품을 찾고 예매할 수 있습니다.",
  },
  {
    title: "판매자",
    desc: "소규모 공연 기획자, 프리랜서 강사, 로컬 이벤트 주최자가 직접 티켓을 등록하고 판매할 수 있습니다.",
  },
];

const FEATURES: { Icon: LucideIcon; title: string; desc: string }[] = [
  {
    Icon: Search,
    title: "검색과 카테고리",
    desc: "공연명, 장소, 카테고리로 원하는 이벤트를 빠르게 찾습니다.",
  },
  {
    Icon: Ticket,
    title: "회차 기반 예매",
    desc: "날짜와 시간 슬롯을 선택하고, 등급별 잔여석을 확인한 뒤 예매합니다.",
  },
  {
    Icon: Armchair,
    title: "좌석 선택",
    desc: "좌석 배치도가 있는 이벤트는 원하는 좌석을 직접 고를 수 있습니다.",
  },
  {
    Icon: QrCode,
    title: "QR 티켓",
    desc: "예매가 완료되면 QR 티켓을 발급하고, 현장에서 입장 확인에 사용합니다.",
  },
  {
    Icon: Share2,
    title: "친구 공유",
    desc: "친구에게 티켓을 공유하고, 공유받은 티켓도 QR로 입장할 수 있습니다.",
  },
  {
    Icon: MessageSquareText,
    title: "후기",
    desc: "관람한 이벤트에 후기를 남기고 다른 사용자의 리뷰를 참고합니다.",
  },
  {
    Icon: Bell,
    title: "알림",
    desc: "예매, 친구 요청, 티켓 공유처럼 확인이 필요한 소식을 알려줍니다.",
  },
  {
    Icon: Store,
    title: "판매자 관리",
    desc: "이벤트 등록, 예매 관리, 매출 확인을 판매자 페이지에서 처리합니다.",
  },
];

// 서비스 소개 콘텐츠(탭 구조 제거 후 단일 페이지로 수정, 친구 공유 핵심 기능 추가)
export default function AboutContent() {
  return (
    <div className="space-y-10">
      <section className="grid gap-6 rounded-2xl border border-gray-200 bg-white p-6 dark:border-[#3c4043] dark:bg-[#2a2b2f] sm:p-8 lg:grid-cols-[220px_minmax(0,1fr)] lg:items-center">
        <div className="mx-auto flex size-40 items-center justify-center overflow-hidden rounded-3xl bg-gray-50 dark:bg-[#303134] sm:size-48">
          <Image
            src="/tiki-character-readme.svg"
            alt="TiKi 캐릭터 로고"
            width={192}
            height={192}
            priority
            className="size-full object-contain"
          />
        </div>

        <div>
          <p className="text-sm font-semibold text-primary-700 dark:text-gray-300">
            예약형 티켓 오픈마켓
          </p>
          <h2 className="mt-3 text-2xl font-bold leading-snug text-gray-950 dark:text-gray-50 sm:text-3xl">
            작은 이벤트도 직접 등록하고,
            <br className="hidden sm:block" />
            필요한 사람에게 판매할 수 있도록
          </h2>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-gray-600 dark:text-gray-300">
            TiKi는 대형 플랫폼 입점이 어려운 판매자도 일정 기반 상품을
            직접 등록하고 판매할 수 있는 서비스입니다. 구매자는 공연, 클래스,
            전시, 팬미팅 등 다양한 이벤트를 찾고 예매할 수 있으며, 함께 가는
            친구에게 티켓을 공유할 수 있습니다.
          </p>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2">
        {TARGETS.map((item) => (
          <div
            key={item.title}
            className="rounded-xl border border-gray-200 bg-white p-5 dark:border-[#3c4043] dark:bg-[#2a2b2f]"
          >
            <h3 className="text-base font-bold text-gray-950 dark:text-gray-50">
              {item.title}
            </h3>
            <p className="mt-2 text-sm leading-6 text-gray-600 dark:text-gray-300">
              {item.desc}
            </p>
          </div>
        ))}
      </section>

      <section className="rounded-xl border border-gray-200 bg-white p-5 dark:border-[#3c4043] dark:bg-[#2a2b2f] sm:p-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-primary-700 dark:text-gray-300">
              서비스 흐름
            </p>
            <h3 className="mt-1 text-lg font-bold text-gray-950 dark:text-gray-50">
              예매부터 관람 기록까지 한 번에 이어집니다
            </h3>
          </div>
        </div>

        <div className="mt-5 grid gap-2 sm:grid-cols-3 lg:grid-cols-7">
          {SERVICE_FLOW.map((step, index) => (
            <div
              key={step}
              className="flex items-center gap-3 rounded-lg bg-gray-50 px-3 py-3 dark:bg-[#303134] lg:flex-col lg:items-start"
            >
              <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-gray-900 text-xs font-semibold text-white dark:bg-gray-100 dark:text-gray-950">
                {index + 1}
              </span>
              <span className="text-sm font-medium text-gray-800 dark:text-gray-100">
                {step}
              </span>
            </div>
          ))}
        </div>
      </section>

      <section>
        <div className="mb-4">
          <p className="text-sm font-semibold text-primary-700 dark:text-gray-300">
            주요 기능
          </p>
          <h3 className="mt-1 text-lg font-bold text-gray-950 dark:text-gray-50">
            TiKi에서 할 수 있는 일
          </h3>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {FEATURES.map(({ Icon, title, desc }) => (
            <div
              key={title}
              className="flex gap-4 rounded-xl border border-gray-200 bg-white p-5 dark:border-[#3c4043] dark:bg-[#2a2b2f]"
            >
              <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-700 dark:bg-[#303134] dark:text-gray-100">
                <Icon className="size-5" strokeWidth={1.6} />
              </span>
              <div className="flex flex-col gap-1">
                <h4 className="text-sm font-semibold text-gray-950 dark:text-gray-50">
                  {title}
                </h4>
                <p className="text-sm leading-6 text-gray-500 dark:text-gray-400">
                  {desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-xl border border-gray-200 bg-gray-50 p-5 dark:border-[#3c4043] dark:bg-[#303134] sm:p-6">
        <div className="flex gap-3">
          <Share2
            className="mt-0.5 size-5 shrink-0 text-primary-700 dark:text-gray-100"
            aria-hidden="true"
          />
          <div>
            <h3 className="font-bold text-gray-950 dark:text-gray-50">
              친구에게 티켓을 공유할 수 있어요
            </h3>
            <p className="mt-2 text-sm leading-7 text-gray-600 dark:text-gray-300">
              예매한 티켓 중 공유 가능한 수량을 선택해 친구에게 보낼 수 있습니다.
              친구가 공유를 수락하면 받은 티켓에 QR이 생성되고, 해당 QR로 함께
              입장할 수 있습니다.
            </p>
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-gray-200 bg-gray-50 p-5 dark:border-[#3c4043] dark:bg-[#303134] sm:p-6">
        <div className="flex gap-3">
          <CheckCircle2
            className="mt-0.5 size-5 shrink-0 text-primary-700 dark:text-gray-100"
            aria-hidden="true"
          />
          <div>
            <h3 className="font-bold text-gray-950 dark:text-gray-50">
              TiKi가 집중한 것
            </h3>
            <p className="mt-2 text-sm leading-7 text-gray-600 dark:text-gray-300">
              등록부터 예매, QR 입장, 티켓 공유, 후기와 라이브러리 기록까지
              하나의 흐름으로 이어지게 만드는 것에 집중했습니다. 이벤트를 여는
              사람과 참여하는 사람이 같은 공간에서 관리할 수 있도록 구성했습니다.
            </p>
          </div>
        </div>
      </section>

      <Link
        href="/"
        className="inline-flex rounded-lg bg-gray-950 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-gray-800 dark:bg-gray-100 dark:text-gray-950 dark:hover:bg-gray-200"
      >
        공연 둘러보기
      </Link>
    </div>
  );
}

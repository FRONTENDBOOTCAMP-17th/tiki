import Link from "next/link";
import {
  CalendarDays,
  ClipboardList,
  ImagePlus,
  ReceiptText,
  Star,
  Ticket,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export const metadata = { title: "판매자 가이드" };

const GUIDE_ITEMS: { Icon: LucideIcon; title: string; desc: string }[] = [
  {
    Icon: ImagePlus,
    title: "이벤트 등록",
    desc: "제목, 소개, 장소, 기간, 포스터 이미지를 입력해 판매할 이벤트를 만듭니다.",
  },
  {
    Icon: CalendarDays,
    title: "회차와 티켓 등급 설정",
    desc: "날짜/시간 슬롯을 만들고, 등급별 가격과 수량을 설정합니다.",
  },
  {
    Icon: Ticket,
    title: "좌석 관리",
    desc: "좌석 배치가 필요한 이벤트는 좌석 레이아웃을 등록해 예매 시 좌석 선택을 받을 수 있습니다.",
  },
  {
    Icon: ClipboardList,
    title: "예매 관리",
    desc: "예매자 목록, 결제 상태, 영수증 정보를 확인하고 필요한 처리를 진행합니다.",
  },
  {
    Icon: Star,
    title: "리뷰 확인",
    desc: "이벤트별 리뷰와 평점을 확인해 이후 이벤트 운영에 참고할 수 있습니다.",
  },
  {
    Icon: ReceiptText,
    title: "매출 확인",
    desc: "이벤트별 매출과 월별 정산 예정 금액을 매출 · 정산 화면에서 확인합니다.",
  },
];

const TIPS = [
  "이벤트 소개에는 관람 시간, 입장 안내, 환불 기준처럼 구매자가 꼭 알아야 하는 내용을 적어 주세요.",
  "회차와 티켓 등급을 등록한 뒤에는 실제 예매 화면에서 날짜와 잔여석이 잘 보이는지 확인해 주세요.",
  "판매 중인 이벤트를 잠시 중단해야 할 때는 이벤트 상태를 비공개로 전환할 수 있습니다.",
];

// 판매자 가이드 페이지(이벤트 등록부터 매출 확인까지 안내 추가)
export default function SellerGuidePage() {
  return (
    <section>
      <p className="text-sm font-semibold text-primary-700 dark:text-gray-300">
        판매자 안내
      </p>
      <h2 className="mt-2 text-2xl font-bold text-gray-950 dark:text-gray-50">
        판매자 가이드
      </h2>
      <p className="mt-3 max-w-2xl text-sm leading-7 text-gray-600 dark:text-gray-300">
        판매자 페이지에서는 이벤트 등록, 예매 관리, 리뷰 확인, 매출 확인을
        한곳에서 처리할 수 있습니다. 이벤트를 등록하기 전 필요한 정보를 먼저
        정리해 두면 운영이 훨씬 수월합니다.
      </p>

      <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {GUIDE_ITEMS.map(({ Icon, title, desc }) => (
          <div
            key={title}
            className="flex gap-4 rounded-xl border border-gray-200 bg-white p-5 dark:border-[#3c4043] dark:bg-[#2a2b2f]"
          >
            <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-700 dark:bg-[#303134] dark:text-gray-100">
              <Icon className="size-5" strokeWidth={1.6} aria-hidden="true" />
            </span>
            <div>
              <h3 className="text-sm font-bold text-gray-950 dark:text-gray-50">
                {title}
              </h3>
              <p className="mt-1 text-sm leading-6 text-gray-600 dark:text-gray-300">
                {desc}
              </p>
            </div>
          </div>
        ))}
      </div>

      <section className="mt-8 rounded-xl border border-gray-200 bg-gray-50 p-5 dark:border-[#3c4043] dark:bg-[#303134]">
        <h3 className="font-bold text-gray-950 dark:text-gray-50">
          운영할 때 참고해 주세요
        </h3>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-6 text-gray-600 dark:text-gray-300">
          {TIPS.map((tip) => (
            <li key={tip}>{tip}</li>
          ))}
        </ul>
      </section>

      <div className="mt-8 flex flex-wrap gap-2">
        <Link
          href="/seller/registration"
          className="rounded-lg bg-gray-950 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-gray-800 dark:bg-gray-100 dark:text-gray-950 dark:hover:bg-gray-200"
        >
          이벤트 등록하기
        </Link>
        <Link
          href="/info/settlement"
          className="rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50 dark:border-[#3c4043] dark:text-gray-200 dark:hover:bg-[#303134]"
        >
          정산 안내 보기
        </Link>
      </div>
    </section>
  );
}

"use client";

import { useState } from "react";

type Faq = {
  category: string;
  q: string;
  a: string;
};

const FAQS: Faq[] = [
  {
    category: "reservation",
    q: "예매한 티켓은 어디서 확인하나요?",
    a: "마이페이지 > 예매 내역에서 확인할 수 있습니다. 공연 당일에는 받은 티켓의 QR 코드를 입장 시 제시하시면 됩니다.",
  },
  {
    category: "reservation",
    q: "예매를 취소하고 싶어요. 환불은 어떻게 되나요?",
    a: "마이페이지 > 예매 내역에서 해당 예매를 선택해 취소할 수 있습니다. 환불 금액과 가능 기간은 공연별 취소 규정에 따라 다르며, 결제 수단으로 환불됩니다.",
  },
  {
    category: "ticket",
    q: "친구에게 티켓을 나눠줄 수 있나요?",
    a: "네. 마이페이지 > 예매 내역에서 친구에게 티켓을 공유할 수 있습니다. 친구가 수락하면 받은 티켓 탭에 표시되며, 공유 가능 수량은 예매 수량 내에서만 가능합니다.",
  },
  {
    category: "ticket",
    q: "공유받은 티켓으로 입장할 수 있나요?",
    a: "공유를 수락하면 마이페이지의 받은 티켓 탭에 QR 코드가 생성됩니다. 해당 QR로 정상 입장할 수 있습니다.",
  },
  {
    category: "ticket",
    q: "관람 후 후기를 작성하고 싶어요.",
    a: "공연이 종료된 예매 또는 공유받은 티켓에 한해 후기를 작성할 수 있습니다. 마이페이지의 예매 내역에서 후기 작성 버튼을 확인해 주세요.",
  },
  {
    category: "account",
    q: "회원 정보를 변경하거나 탈퇴하고 싶어요.",
    a: "마이페이지 > 설정에서 비밀번호 변경 및 회원 탈퇴를 진행할 수 있습니다. 탈퇴 시 일부 정보는 관련 법령에 따라 일정 기간 보관될 수 있습니다.",
  },
];

const FILTERS = [
  { value: "all", label: "전체" },
  { value: "reservation", label: "예매/취소" },
  { value: "ticket", label: "티켓" },
  { value: "account", label: "계정" },
] as const;

export default function FaqSection() {
  const [filter, setFilter] = useState<string>("all");

  const visible =
    filter === "all" ? FAQS : FAQS.filter((f) => f.category === filter);

  return (
    <section id="faq" className="scroll-mt-24">
      <h2 className="mb-4 text-lg font-semibold text-gray-900">
        자주 묻는 질문
      </h2>

      <div className="mb-5 flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            type="button"
            onClick={() => setFilter(f.value)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              filter === f.value
                ? "bg-primary-700 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <ul className="flex flex-col gap-3">
        {visible.map((faq, i) => (
          <li
            key={`${filter}-${i}`}
            className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm"
          >
            <details className="group">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 font-medium text-gray-900 transition-colors hover:bg-primary-100">
                <span>{faq.q}</span>
                <svg
                  className="h-5 w-5 shrink-0 text-primary-600 transition-transform duration-200 group-open:rotate-180"
                  viewBox="0 0 20 20"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    d="M6 8l4 4 4-4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </summary>
              <div className="border-t border-gray-100 px-5 py-4 text-sm leading-relaxed text-gray-600">
                {faq.a}
              </div>
            </details>
          </li>
        ))}
      </ul>
    </section>
  );
}

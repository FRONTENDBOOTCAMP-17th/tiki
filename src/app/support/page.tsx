import Link from "next/link";

type Faq = {
  q: string;
  a: string;
};

const FAQS: Faq[] = [
  {
    q: "예매한 티켓은 어디서 확인하나요?",
    a: "마이페이지 > 예매 내역에서 확인할 수 있습니다. 공연 당일에는 받은 티켓의 QR 코드를 입장 시 제시하시면 됩니다.",
  },
  {
    q: "예매를 취소하고 싶어요. 환불은 어떻게 되나요?",
    a: "마이페이지 > 예매 내역에서 해당 예매를 선택해 취소할 수 있습니다. 환불 금액과 가능 기간은 공연별 취소 규정에 따라 다르며, 결제 수단으로 환불됩니다.",
  },
  {
    q: "친구에게 티켓을 나눠줄 수 있나요?",
    a: "네. 마이페이지 > 예매 내역에서 친구에게 티켓을 공유할 수 있습니다. 친구가 수락하면 받은 티켓 탭에 표시되며, 공유 가능 수량은 예매 수량 내에서만 가능합니다.",
  },
  {
    q: "공유받은 티켓으로 입장할 수 있나요?",
    a: "공유를 수락하면 마이페이지의 받은 티켓 탭에 QR 코드가 생성됩니다. 해당 QR로 정상 입장할 수 있습니다.",
  },
  {
    q: "관람 후 후기를 작성하고 싶어요.",
    a: "공연이 종료된 예매 또는 공유받은 티켓에 한해 후기를 작성할 수 있습니다. 마이페이지의 예매 내역에서 후기 작성 버튼을 확인해 주세요.",
  },
  {
    q: "회원 정보를 변경하거나 탈퇴하고 싶어요.",
    a: "마이페이지 > 설정에서 비밀번호 변경 및 회원 탈퇴를 진행할 수 있습니다. 탈퇴 시 일부 정보는 관련 법령에 따라 일정 기간 보관될 수 있습니다.",
  },
];

const CONTACTS: { label: string; value: string }[] = [
  {
    label: "고객센터 운영시간",
    value: "평일 10:00 ~ 18:00 (주말·공휴일 휴무)",
  },
  { label: "이메일 문의", value: "help@tiki.com" },
  { label: "전화 문의", value: "1588-0000" },
];

export default function SupportPage() {
  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-10 sm:py-14">
      {/* 헤더 */}
      <header className="mb-10">
        <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
          고객센터
        </h1>
        <p className="mt-2 text-sm text-gray-500">
          자주 묻는 질문을 먼저 확인하시고, 해결되지 않으면 1:1 문의를
          남겨주세요.
        </p>
      </header>

      {/* 자주 묻는 질문 */}
      <section id="faq" className="scroll-mt-24">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">
          자주 묻는 질문
        </h2>
        <ul className="flex flex-col gap-3">
          {FAQS.map((faq, i) => (
            <li
              key={i}
              className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm"
            >
              <details className="group">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 font-medium text-gray-900 transition-colors hover:bg-violet-50/60">
                  <span>{faq.q}</span>
                  <svg
                    className="h-5 w-5 shrink-0 text-violet-400 transition-transform duration-200 group-open:rotate-180"
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

      {/* 1:1 문의 / 연락처 */}
      <section id="contact" className="mt-12 scroll-mt-24">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">문의하기</h2>

        <div className="rounded-2xl bg-gradient-to-br from-violet-50 to-purple-50 p-6 sm:p-8">
          <p className="text-sm leading-relaxed text-gray-700">
            궁금한 점이 해결되지 않으셨나요? 1:1 문의를 남겨주시면 순차적으로
            답변드립니다. 답변은 마이페이지의 1:1 문의 내역에서 확인할 수
            있습니다.
          </p>
          <Link
            href="/mypage/inquiries"
            className="mt-5 inline-flex items-center justify-center rounded-xl bg-violet-500 px-6 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-violet-600"
          >
            1:1 문의하기
          </Link>
        </div>

        <dl className="mt-6 divide-y divide-gray-100 rounded-2xl border border-gray-100 bg-white">
          {CONTACTS.map((c) => (
            <div
              key={c.label}
              className="flex flex-col gap-1 px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <dt className="text-sm text-gray-500">{c.label}</dt>
              <dd className="text-sm font-medium text-gray-900">{c.value}</dd>
            </div>
          ))}
        </dl>
      </section>
    </main>
  );
}

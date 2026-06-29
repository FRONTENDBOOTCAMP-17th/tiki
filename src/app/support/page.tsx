import Link from "next/link";
import FaqSection from "./FaqSection";

export const metadata = { title: "고객센터 | TiKi" };

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
      <header className="mb-10">
        <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
          고객센터
        </h1>
        <p className="mt-2 text-sm text-gray-500">
          자주 묻는 질문을 먼저 확인하시고, 해결되지 않으면 1:1 문의를
          남겨주세요.
        </p>
      </header>

      <FaqSection />

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

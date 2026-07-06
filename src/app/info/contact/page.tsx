import Link from "next/link";

export const metadata = { title: "고객센터" };

const CONTACTS: { label: string; value: string }[] = [
  { label: "고객센터 운영시간", value: "평일 10:00 ~ 18:00 (주말·공휴일 휴무)" },
  { label: "이메일 문의", value: "help@tiki.com" },
  { label: "전화 문의", value: "1588-0000" },
];

export default function ContactPage() {
  return (
    <section>
      <h2 className="mb-6 text-xl font-bold text-gray-900 dark:text-gray-100">
        고객센터
      </h2>

      <div className="rounded-2xl bg-gradient-to-br from-primary-100 to-secondary-100 p-6 sm:p-8 dark:from-surface-1 dark:to-surface-header">
        <p className="text-sm leading-relaxed text-gray-700 dark:text-gray-300">
          궁금한 점이 해결되지 않으셨나요? 1:1 문의를 남겨주시면 순차적으로
          답변드립니다. 답변은 마이페이지의 1:1 문의 내역에서 확인할 수 있습니다.
        </p>
        <Link
          href="/mypage/inquiries"
          className="mt-5 inline-flex items-center justify-center rounded-xl bg-primary-700 px-6 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-primary-800"
        >
          1:1 문의하기
        </Link>
      </div>

      <dl className="mt-6 divide-y divide-gray-100 rounded-2xl border border-gray-100 bg-white dark:divide-surface-3 dark:border-surface-3 dark:bg-surface-1">
        {CONTACTS.map((c) => (
          <div
            key={c.label}
            className="flex flex-col gap-1 px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <dt className="text-sm text-gray-500 dark:text-gray-400">
              {c.label}
            </dt>
            <dd className="text-sm font-medium text-gray-900 dark:text-gray-100">
              {c.value}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

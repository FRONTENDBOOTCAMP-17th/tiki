import Link from "next/link";
import { Banknote, CalendarCheck, Receipt, WalletCards } from "lucide-react";

export const metadata = { title: "정산 안내" };

const SETTLEMENT_STEPS = [
  {
    title: "매출 확인",
    desc: "판매자 페이지의 매출 · 정산 화면에서 월별 결제액, 수수료, 정산 예정액을 확인합니다.",
  },
  {
    title: "정산 계좌 확인",
    desc: "스토어 정보에 등록된 정산 계좌가 정확한지 확인합니다.",
  },
  {
    title: "월별 정산 신청",
    desc: "매출 · 정산 화면에서 정산하려는 월을 선택한 뒤 정산 신청 버튼을 눌러 신청합니다.",
  },
  {
    title: "정산 처리",
    desc: "신청한 월의 정산 대상 금액을 확인한 뒤 등록된 계좌로 정산이 진행됩니다.",
  },
];

const NOTES = [
  "정산 신청은 월마다 진행할 수 있습니다.",
  "정산 계좌가 등록되어 있어야 정산 신청을 원활하게 진행할 수 있습니다.",
  "취소 또는 환불된 주문은 정산 대상 금액에서 제외될 수 있습니다.",
];

// 정산 안내 페이지(매출 · 정산 화면에서 월별 정산 신청 가능하도록 안내 추가)
export default function SettlementInfoPage() {
  return (
    <section>
      <p className="text-sm font-semibold text-primary-700 dark:text-gray-300">
        판매자 안내
      </p>
      <h2 className="mt-2 text-2xl font-bold text-gray-950 dark:text-gray-50">
        정산 안내
      </h2>
      <p className="mt-3 max-w-2xl text-sm leading-7 text-gray-600 dark:text-gray-300">
        판매자는 판매자 페이지의 매출 · 정산 화면에서 월별 매출과 정산 예정액을
        확인할 수 있습니다. 정산은 월마다 신청할 수 있으며, 신청 전 정산 계좌를
        먼저 확인해 주세요.
      </p>

      <div className="mt-8 grid gap-3 sm:grid-cols-2">
        {SETTLEMENT_STEPS.map((step, index) => (
          <div
            key={step.title}
            className="rounded-xl border border-gray-200 bg-white p-5 dark:border-surface-3 dark:bg-surface-1"
          >
            <div className="flex items-center gap-3">
              <span className="flex size-8 items-center justify-center rounded-full bg-gray-900 text-sm font-semibold text-white dark:bg-gray-100 dark:text-gray-950">
                {index + 1}
              </span>
              <h3 className="font-bold text-gray-950 dark:text-gray-50">
                {step.title}
              </h3>
            </div>
            <p className="mt-3 text-sm leading-6 text-gray-600 dark:text-gray-300">
              {step.desc}
            </p>
          </div>
        ))}
      </div>

      <section className="mt-8 grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl bg-gray-50 p-4 dark:bg-surface-2">
          <Banknote className="size-5 text-gray-700 dark:text-gray-100" />
          <p className="mt-3 text-sm font-semibold text-gray-950 dark:text-gray-50">
            총 결제액
          </p>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            결제가 완료된 주문 금액
          </p>
        </div>
        <div className="rounded-xl bg-gray-50 p-4 dark:bg-surface-2">
          <Receipt className="size-5 text-gray-700 dark:text-gray-100" />
          <p className="mt-3 text-sm font-semibold text-gray-950 dark:text-gray-50">
            수수료
          </p>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            서비스 이용 수수료
          </p>
        </div>
        <div className="rounded-xl bg-gray-50 p-4 dark:bg-surface-2">
          <WalletCards className="size-5 text-gray-700 dark:text-gray-100" />
          <p className="mt-3 text-sm font-semibold text-gray-950 dark:text-gray-50">
            정산 예정액
          </p>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            정산 신청 가능한 금액
          </p>
        </div>
      </section>

      <section className="mt-8 rounded-xl border border-gray-200 bg-gray-50 p-5 dark:border-surface-3 dark:bg-surface-2">
        <div className="flex gap-3">
          <CalendarCheck
            className="mt-0.5 size-5 shrink-0 text-primary-700 dark:text-gray-100"
            aria-hidden="true"
          />
          <div>
            <h3 className="font-bold text-gray-950 dark:text-gray-50">
              정산 신청 전 확인사항
            </h3>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-6 text-gray-600 dark:text-gray-300">
              {NOTES.map((note) => (
                <li key={note}>{note}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <div className="mt-8 flex flex-wrap gap-2">
        <Link
          href="/seller/settlement"
          className="rounded-lg bg-gray-950 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-gray-800 dark:bg-gray-100 dark:text-gray-950 dark:hover:bg-gray-200"
        >
          매출 · 정산 화면으로 이동
        </Link>
        <Link
          href="/seller/storeInfo"
          className="rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50 dark:border-surface-3 dark:text-gray-200 dark:hover:bg-surface-2"
        >
          정산 계좌 확인
        </Link>
      </div>
    </section>
  );
}

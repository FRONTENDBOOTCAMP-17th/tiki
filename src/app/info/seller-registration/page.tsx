import Link from "next/link";
import { CheckCircle2, FileText, Store, UserRoundCheck } from "lucide-react";

export const metadata = { title: "판매자 등록" };

const STEPS = [
  {
    title: "회원가입에서 판매자 선택",
    desc: "가입 과정에서 판매자 유형을 선택하고 기본 정보를 입력합니다.",
  },
  {
    title: "스토어 정보 입력",
    desc: "판매자 페이지의 스토어 정보에서 주최자명, 연락처, 소개 정보를 등록합니다.",
  },
  {
    title: "정산 계좌 등록",
    desc: "판매 대금을 받을 은행명, 계좌번호, 예금주 정보를 입력합니다.",
  },
  {
    title: "이벤트 등록 시작",
    desc: "스토어 정보가 준비되면 판매자 페이지에서 이벤트를 등록할 수 있습니다.",
  },
];

const CHECKS = [
  "판매자 계정으로 로그인해야 판매자 페이지에 접근할 수 있습니다.",
  "연락 가능한 이메일과 전화번호를 정확히 입력해 주세요.",
  "정산 계좌 정보가 없으면 정산 진행이 어려울 수 있습니다.",
];

// 판매자 등록 안내 페이지(가입·스토어·정산 계좌 준비 절차 추가)
export default function SellerRegistrationInfoPage() {
  return (
    <section>
      <p className="text-sm font-semibold text-primary-700 dark:text-gray-300">
        판매자 안내
      </p>
      <h2 className="mt-2 text-2xl font-bold text-gray-950 dark:text-gray-50">
        판매자 등록
      </h2>
      <p className="mt-3 max-w-2xl text-sm leading-7 text-gray-600 dark:text-gray-300">
        TiKi에서는 소규모 공연 기획자, 프리랜서 강사, 로컬 이벤트 주최자도
        직접 이벤트를 등록하고 티켓을 판매할 수 있습니다. 판매를 시작하기 전에
        계정과 스토어 정보를 먼저 준비해 주세요.
      </p>

      <div className="mt-8 grid gap-3 sm:grid-cols-2">
        {STEPS.map((step, index) => (
          <div
            key={step.title}
            className="rounded-xl border border-gray-200 bg-white p-5 dark:border-[#3c4043] dark:bg-[#2a2b2f]"
          >
            <span className="flex size-8 items-center justify-center rounded-full bg-gray-900 text-sm font-semibold text-white dark:bg-gray-100 dark:text-gray-950">
              {index + 1}
            </span>
            <h3 className="mt-4 font-bold text-gray-950 dark:text-gray-50">
              {step.title}
            </h3>
            <p className="mt-2 text-sm leading-6 text-gray-600 dark:text-gray-300">
              {step.desc}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-8 rounded-xl border border-gray-200 bg-gray-50 p-5 dark:border-[#3c4043] dark:bg-[#303134]">
        <div className="flex gap-3">
          <UserRoundCheck
            className="mt-0.5 size-5 shrink-0 text-primary-700 dark:text-gray-100"
            aria-hidden="true"
          />
          <div>
            <h3 className="font-bold text-gray-950 dark:text-gray-50">
              등록 전 확인해 주세요
            </h3>
            <ul className="mt-3 space-y-2 text-sm text-gray-600 dark:text-gray-300">
              {CHECKS.map((item) => (
                <li key={item} className="flex gap-2">
                  <CheckCircle2
                    className="mt-0.5 size-4 shrink-0"
                    aria-hidden="true"
                  />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="mt-8 flex flex-wrap gap-2">
        <Link
          href="/join"
          className="inline-flex items-center gap-2 rounded-lg bg-gray-950 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-gray-800 dark:bg-gray-100 dark:text-gray-950 dark:hover:bg-gray-200"
        >
          <Store className="size-4" aria-hidden="true" />
          판매자 가입하기
        </Link>
        <Link
          href="/info/seller-guide"
          className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50 dark:border-[#3c4043] dark:text-gray-200 dark:hover:bg-[#303134]"
        >
          <FileText className="size-4" aria-hidden="true" />
          판매자 가이드 보기
        </Link>
      </div>
    </section>
  );
}

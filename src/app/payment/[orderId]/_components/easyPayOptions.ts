// 결제 수단으로 노출할 간편결제 목록. provider 값은 포트원 SDK의 EasyPayProvider 코드와 일치해야 한다.
export const EASY_PAY_OPTIONS = [
  { provider: "KAKAOPAY", label: "카카오페이", className: "border-yellow-400 bg-yellow-50 text-yellow-700" },
  { provider: "TOSSPAY", label: "토스페이", className: "border-blue-400 bg-blue-50 text-blue-700" },
  { provider: "NAVERPAY", label: "네이버페이", className: "border-green-500 bg-green-50 text-green-700" },
] as const;

export type EasyPayProviderOption = (typeof EASY_PAY_OPTIONS)[number]["provider"];

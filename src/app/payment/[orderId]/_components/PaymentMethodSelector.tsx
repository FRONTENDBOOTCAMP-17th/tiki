import { cn } from "@/lib/cn";
import { EASY_PAY_OPTIONS, type EasyPayProviderOption } from "./easyPayOptions";

interface PaymentMethodSelectorProps {
  value: EasyPayProviderOption;
  onChange: (provider: EasyPayProviderOption) => void;
}

// 카카오페이/토스페이/네이버페이 중 결제에 사용할 간편결제 수단을 고르는 버튼 그룹.
export default function PaymentMethodSelector({
  value,
  onChange,
}: PaymentMethodSelectorProps) {
  return (
    <div className="grid grid-cols-3 gap-2">
      {EASY_PAY_OPTIONS.map((option) => {
        const active = value === option.provider;
        return (
          <button
            key={option.provider}
            type="button"
            onClick={() => onChange(option.provider)}
            className={cn(
              "rounded-xl border-2 px-3 py-2.5 text-sm font-semibold transition",
              active ? option.className : "border-gray-200 text-gray-500",
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

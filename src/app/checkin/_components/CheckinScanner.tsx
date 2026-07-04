// 스캔 + 검증 결과 UI
"use client";
import { useCallback, useState } from "react";
import { Scanner, type IDetectedBarcode } from "@yudiel/react-qr-scanner";
import {
  AlertTriangle,
  CheckCircle2,
  Keyboard,
  RotateCcw,
  XCircle,
} from "lucide-react";
import Button from "@/components/Button";

interface VerifyResponse {
  code: string;
  event_title?: string;
  slot_date?: string | null;
  slot_time?: string | null;
  grade_name?: string | null;
  holder_name?: string | null;
  quantity?: number;
  subject_type?: "order" | "share";
  checked_in_at?: string;
  order_status?: string;
  share_status?: string;
}

type Tone = "success" | "warn" | "error";

const RESULT_META: Record<string, { label: string; desc: string; tone: Tone }> =
  {
    ok: {
      label: "입장 가능",
      desc: "입장 처리가 완료되었습니다",
      tone: "success",
    },
    already_used: {
      label: "이미 사용된 티켓",
      desc: "이미 입장 처리된 티켓입니다",
      tone: "warn",
    },
    expired: {
      label: "만료된 QR",
      desc: "관람객에게 앱에서 QR 화면을 다시 열어달라고 요청하세요",
      tone: "warn",
    },
    invalid: {
      label: "유효하지 않은 QR",
      desc: "위조되었거나 TiKi 티켓이 아닌 QR입니다",
      tone: "error",
    },
    not_paid: {
      label: "입장 불가",
      desc: "결제 완료 상태의 주문이 아닙니다",
      tone: "error",
    },
    share_invalid: {
      label: "무효화된 공유 티켓",
      desc: "취소되었거나 회수된 공유 티켓입니다",
      tone: "error",
    },
    fully_shared: {
      label: "본인 보유분 없음",
      desc: "전량 공유된 주문입니다. 공유받은 관람객의 QR로 입장해야 합니다",
      tone: "error",
    },
    forbidden: {
      label: "검증 권한 없음",
      desc: "내가 등록한 이벤트의 티켓만 검증할 수 있습니다",
      tone: "error",
    },
    not_found: {
      label: "티켓 없음",
      desc: "존재하지 않는 티켓입니다",
      tone: "error",
    },
    unauthorized: {
      label: "로그인 필요",
      desc: "세션이 만료되었습니다. 다시 로그인해 주세요",
      tone: "error",
    },
    error: {
      label: "서버 오류",
      desc: "잠시 후 다시 시도해 주세요",
      tone: "error",
    },
  };

const TONE_STYLES: Record<
  Tone,
  { box: string; icon: typeof CheckCircle2; iconColor: string }
> = {
  success: {
    box: "border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950/40",
    icon: CheckCircle2,
    iconColor: "text-green-600",
  },
  warn: {
    box: "border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/40",
    icon: AlertTriangle,
    iconColor: "text-amber-600",
  },
  error: {
    box: "border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950/40",
    icon: XCircle,
    iconColor: "text-red-600",
  },
};

function formatCheckedInAt(iso?: string) {
  if (!iso) return "";
  return new Date(iso).toLocaleString("ko-KR", {
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function CheckinScanner() {
  const [result, setResult] = useState<VerifyResponse | null>(null);
  const [verifying, setVerifying] = useState(false);
  const [cameraError, setCameraError] = useState(false);
  const [manualOpen, setManualOpen] = useState(false);
  const [manualValue, setManualValue] = useState("");

  const verify = useCallback(
    async (token: string) => {
      if (verifying) return;
      setVerifying(true);
      try {
        const res = await fetch("/api/tickets/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        });
        const data: VerifyResponse = await res.json();
        setResult(data);
      } catch {
        setResult({ code: "error" });
      } finally {
        setVerifying(false);
      }
    },
    [verifying],
  );

  const handleScan = useCallback(
    (codes: IDetectedBarcode[]) => {
      const raw = codes[0]?.rawValue;
      if (!raw || verifying || result) return;
      verify(raw);
    },
    [verify, verifying, result],
  );

  const handleManualSubmit = () => {
    const value = manualValue.trim();
    if (!value) return;
    verify(value);
    setManualValue("");
  };

  const reset = () => setResult(null);

  const meta = result ? (RESULT_META[result.code] ?? RESULT_META.error) : null;
  const tone = meta ? TONE_STYLES[meta.tone] : null;
  const ToneIcon = tone?.icon ?? CheckCircle2;

  return (
    <div className="flex flex-col gap-4">
      {/* 스캐너 */}
      <div className="relative aspect-square w-full overflow-hidden rounded-2xl border border-gray-200 bg-black dark:border-surface-3">
        {cameraError ? (
          <div className="flex h-full flex-col items-center justify-center gap-2 bg-gray-50 px-6 text-center dark:bg-surface-header">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
              카메라를 사용할 수 없습니다
            </p>
            <p className="text-xs text-gray-500">
              카메라 권한을 확인하거나 아래 직접 입력을 이용하세요
            </p>
          </div>
        ) : (
          <Scanner
            onScan={handleScan}
            onError={() => setCameraError(true)}
            formats={["qr_code"]}
            paused={verifying || !!result}
            sound={false}
            constraints={{ facingMode: "environment" }}
          />
        )}
        {verifying && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <p className="text-sm font-medium text-white">검증 중...</p>
          </div>
        )}
      </div>

      {/* 검증 결과 */}
      {result && meta && tone && (
        <div className={`rounded-2xl border p-5 ${tone.box}`}>
          <div className="flex items-center gap-2.5">
            <ToneIcon size={24} className={`shrink-0 ${tone.iconColor}`} />
            <div>
              <p className="font-bold text-gray-900 dark:text-gray-50">
                {meta.label}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {result.code === "already_used" && result.checked_in_at
                  ? `${formatCheckedInAt(result.checked_in_at)}에 입장 처리되었습니다`
                  : meta.desc}
              </p>
            </div>
          </div>

          {result.code === "ok" && (
            <div className="mt-4 flex flex-col gap-1.5 border-t border-green-200 pt-3 text-sm dark:border-green-900">
              <div className="flex items-center justify-between gap-2">
                <span className="font-semibold text-gray-900 dark:text-gray-50">
                  {result.event_title}
                </span>
                <span className="shrink-0 rounded-full bg-white px-2.5 py-0.5 text-xs font-medium text-gray-600 dark:bg-surface-header dark:text-gray-300">
                  {result.subject_type === "share" ? "공유 티켓" : "본인 예매"}
                </span>
              </div>
              {result.slot_date && (
                <p className="text-gray-600 dark:text-gray-400">
                  {result.slot_date} {result.slot_time?.slice(0, 5)}
                </p>
              )}
              <p className="text-gray-600 dark:text-gray-400">
                {[result.grade_name, `${result.quantity}매`, result.holder_name]
                  .filter(Boolean)
                  .join(" · ")}
              </p>
            </div>
          )}

          <button
            type="button"
            onClick={reset}
            className="mt-4 flex w-full items-center justify-center gap-1.5 rounded-lg bg-white py-2.5 text-sm font-semibold text-gray-900 shadow-sm transition hover:bg-gray-50 dark:bg-surface-header dark:text-gray-50 dark:hover:bg-surface-elevated"
          >
            <RotateCcw size={15} />
            다음 스캔
          </button>
        </div>
      )}

      {/* 직접 입력 (테스트/카메라 불가 시 폴백) */}
      <div className="rounded-2xl border border-gray-200 p-4 dark:border-surface-3">
        <button
          type="button"
          onClick={() => setManualOpen((v) => !v)}
          className="flex w-full items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-400"
        >
          <Keyboard size={16} />
          코드 직접 입력
        </button>
        {manualOpen && (
          <div className="mt-3 flex gap-2">
            <input
              type="text"
              value={manualValue}
              onChange={(e) => setManualValue(e.target.value)}
              placeholder="QR 토큰 값을 붙여넣으세요"
              className="min-w-0 flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-primary-400 focus:outline-none dark:border-surface-3 dark:bg-surface-header dark:text-gray-50"
            />
            <Button
              onClick={handleManualSubmit}
              disabled={verifying || !manualValue.trim()}
            >
              검증
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

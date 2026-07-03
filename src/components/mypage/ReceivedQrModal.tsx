"use client";
import { useCallback, useEffect, useState } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { Calendar, MapPin, RefreshCw, Ticket } from "lucide-react";
import Modal from "@/components/modal/Modal";
import Button from "@/components/Button";
import { issueShareQrToken } from "@/lib/tickets/actions";
import type { ReceivedTicket } from "./ReceivedTicketCard";

// TTL 5분 — 만료 1분 전에 자동 갱신
const REFRESH_INTERVAL_MS = 4 * 60 * 1000;

export default function ReceivedQrModal({
  open,
  onClose,
  ticket: t,
}: {
  open: boolean;
  onClose: () => void;
  ticket: ReceivedTicket;
}) {
  const place = [t.venue_address, t.venue_name].filter(Boolean).join(" ");

  const [token, setToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  // 수동 "다시 시도" 트리거 — 값이 바뀌면 effect가 재실행됨
  const [retryKey, setRetryKey] = useState(0);

  const retry = useCallback(() => setRetryKey((k) => k + 1), []);

  useEffect(() => {
    if (!open) return;

    let active = true;

    const fetchToken = async () => {
      setError(null);
      try {
        const res = await issueShareQrToken(t.share_id);
        if (!active) return;
        if ("error" in res) {
          setError(res.error);
          setToken(null);
        } else {
          setToken(res.token);
        }
      } catch {
        if (!active) return;
        setError("QR 발급 중 오류가 발생했습니다.");
        setToken(null);
      }
    };

    fetchToken();
    const timer = setInterval(fetchToken, REFRESH_INTERVAL_MS);

    return () => {
      active = false;
      clearInterval(timer);
    };
  }, [open, t.share_id, retryKey]);

  return (
    <Modal open={open} onClose={onClose}>
      <Modal.Header>QR 티켓 (받은 티켓)</Modal.Header>
      <Modal.Body>
        <div className="flex flex-col gap-1.5 rounded-xl bg-primary-100 p-4">
          <p className="font-bold text-gray-900">{t.event_title}</p>
          <span className="flex items-center gap-1.5 text-sm text-gray-600">
            <Calendar size={14} className="shrink-0 text-gray-400" />
            {t.slot_date} {t.slot_time?.slice(0, 5)}
          </span>
          <span className="flex items-center gap-1.5 text-sm text-gray-600">
            <MapPin size={14} className="shrink-0 text-gray-400" />
            {place}
          </span>
          <span className="flex items-center gap-1.5 text-sm text-gray-600">
            <Ticket size={14} className="shrink-0 text-gray-400" />
            {t.grade_name} · {t.quantity}매
          </span>
        </div>

        {/* 서명 토큰 QR */}
        <div className="flex flex-col items-center gap-3 rounded-xl border border-gray-200 p-6">
          {token ? (
            <div className="rounded-lg bg-white p-3">
              <QRCodeCanvas value={token} size={160} level="M" />
            </div>
          ) : (
            <div className="flex h-[184px] w-[184px] flex-col items-center justify-center gap-3 rounded-lg bg-gray-50">
              {error ? (
                <>
                  <p className="px-4 text-center text-sm text-gray-500">
                    {error}
                  </p>
                  <button
                    type="button"
                    onClick={retry}
                    className="flex items-center gap-1 text-sm font-medium text-primary-600 hover:underline"
                  >
                    <RefreshCw size={14} />
                    다시 시도
                  </button>
                </>
              ) : (
                <p className="text-sm text-gray-400">QR 생성 중...</p>
              )}
            </div>
          )}
        </div>

        <div className="rounded-lg bg-secondary-100 px-4 py-3 text-center text-sm text-secondary-700">
          {t.sharer_name}님이 공유한 티켓입니다. 현장에서 스캔하여 입장하세요.
          <br />
          보안을 위해 QR은 주기적으로 자동 갱신됩니다
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="outline" className="flex-1" onClick={onClose}>
          닫기
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

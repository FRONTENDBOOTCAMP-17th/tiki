"use client";

import { useState, useEffect } from "react";
import { Minus, Plus } from "lucide-react";
import { toast } from "sonner";
import Modal from "@/components/modal/Modal";
import Button from "@/components/Button";
import { createClient } from "@/lib/supabase/client";
import { shareTicket } from "@/app/action";
import type { Reservation } from "./ReservationCard";

interface Friend {
  user_id: string;
  name: string | null;
  email: string | null;
}

export default function ShareTicketModal({
  open,
  onClose,
  reservation: r,
}: {
  open: boolean;
  onClose: () => void;
  reservation: Reservation;
}) {
  const [qty, setQty] = useState(1);
  const [selected, setSelected] = useState<string | null>(null);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [alreadyShared, setAlreadyShared] = useState(0);
  const [loading, setLoading] = useState(true);
  const [sharing, setSharing] = useState(false);

  // 본인 1매는 남김 → 공유 가능 총량 = count - 1
  // 남은 = 총량 - 이미 공유한 양(rejected 제외, RPC가 처리)
  const shareableTotal = Math.max(0, r.count - 1);
  const remaining = Math.max(0, shareableTotal - alreadyShared);
  const soldOut = remaining === 0;
  // remaining이 나중에 로드되어 줄어들 수 있으므로 렌더 중 clamp (별도 effect 불필요)
  const safeQty = Math.min(qty, Math.max(1, remaining));

  // 모달 열릴 때 친구 목록 + 이미 공유한 수량 로드
  useEffect(() => {
    if (!open) return;

    let ignore = false;
    const load = async () => {
      setLoading(true);
      setSelected(null);
      setQty(1);
      try {
        const supabase = createClient();
        const [friendRes, sharedRes] = await Promise.all([
          supabase.rpc("get_my_friends"),
          supabase.rpc("get_shared_quantity", { p_order_id: r.id }),
        ]);
        if (ignore) return;
        setFriends((friendRes.data as Friend[] | null) ?? []);
        setAlreadyShared((sharedRes.data as number | null) ?? 0);
      } catch {
        if (!ignore) toast.error("정보를 불러오지 못했습니다");
      } finally {
        if (!ignore) setLoading(false);
      }
    };
    load();

    return () => {
      ignore = true;
    };
  }, [open, r.id]);

  const handleShare = async () => {
    if (!selected) return;
    setSharing(true);
    try {
      const result = await shareTicket(r.id, selected, safeQty);
      if (result?.error) {
        toast.error(result.error);
        return;
      }
      toast.success("티켓을 공유했습니다");
      onClose();
    } catch {
      toast.error("공유에 실패했습니다");
    } finally {
      setSharing(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Modal.Header>티켓 공유하기</Modal.Header>
      <Modal.Body>
        {loading ? (
          <p className="py-8 text-center text-sm text-gray-400">
            불러오는 중...
          </p>
        ) : soldOut ? (
          // 남은 수량 0 → 공유 불가
          <div className="rounded-xl border border-gray-100 bg-gray-50 p-6 text-center">
            <p className="font-semibold text-gray-700">
              이미 모두 공유했습니다
            </p>
            <p className="mt-1 text-sm text-gray-400">
              공유 가능한 {shareableTotal}매를 모두 공유했어요. (본인 1매 보유)
            </p>
          </div>
        ) : (
          <>
            {/* 남은 수량 안내 */}
            <div className="mb-4 rounded-xl bg-primary-100 p-3 text-sm text-primary-700">
              공유 가능 <b>{remaining}</b>매
              {alreadyShared > 0 && (
                <span className="text-primary-500">
                  {" "}
                  ({alreadyShared}매 공유됨)
                </span>
              )}
            </div>

            {/* 수량 조절 */}
            <div className="mb-4 flex items-center justify-between rounded-xl border border-gray-100 p-3">
              <span className="text-sm font-medium text-gray-700">
                공유 수량
              </span>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setQty(Math.max(1, safeQty - 1))}
                  disabled={safeQty <= 1}
                  className="flex size-8 items-center justify-center rounded-lg border border-gray-200 disabled:opacity-40"
                >
                  <Minus size={16} />
                </button>
                <span className="w-6 text-center font-semibold">{safeQty}</span>
                <button
                  type="button"
                  onClick={() => setQty(Math.min(remaining, safeQty + 1))}
                  disabled={safeQty >= remaining}
                  className="flex size-8 items-center justify-center rounded-lg border border-gray-200 disabled:opacity-40"
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>

            {/* 친구 선택 */}
            <div className="mb-4">
              <p className="mb-2 text-sm font-medium text-gray-700">
                공유할 친구
              </p>
              {friends.length === 0 ? (
                <p className="rounded-xl border border-gray-100 p-4 text-center text-sm text-gray-400">
                  공유할 친구가 없습니다
                </p>
              ) : (
                <div className="flex flex-col gap-2">
                  {friends.map((f) => (
                    <button
                      key={f.user_id}
                      type="button"
                      onClick={() => setSelected(f.user_id)}
                      className={`flex items-center gap-3 rounded-xl border p-3 text-left transition-colors ${
                        selected === f.user_id
                          ? "border-primary-400 bg-primary-100"
                          : "border-gray-100 hover:bg-gray-50"
                      }`}
                    >
                      <div
                        className={`flex size-9 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-primary-400 via-accent-400 to-secondary-400 text-sm font-semibold text-primary-900`}
                      >
                        {f.name?.charAt(0) ?? "?"}
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-gray-900">{f.name}</p>
                        <p className="truncate text-xs text-gray-400">
                          {f.email}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        <div className="rounded-xl bg-secondary-100 p-4 text-sm text-secondary-700">
          <p className="font-semibold">티켓 공유란?</p>
          <p className="mt-1">
            친구에게 티켓 정보를 공유하여 함께 입장할 수 있습니다. 티켓 소유권은
            유지되며, 친구도 QR 코드로 입장 가능합니다.
          </p>
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="outline" className="flex-1" onClick={onClose}>
          {soldOut ? "닫기" : "취소"}
        </Button>
        {!soldOut && (
          <button
            type="button"
            disabled={!selected || sharing || loading}
            onClick={handleShare}
            className="flex-1 rounded-lg bg-gradient-to-r from-primary-400 to-secondary-400 px-4 py-2.5 text-sm font-semibold text-primary-900 transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {sharing ? "공유 중..." : "공유하기"}
          </button>
        )}
      </Modal.Footer>
    </Modal>
  );
}

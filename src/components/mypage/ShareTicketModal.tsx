"use client";
import { useState } from "react";
import { Minus, Plus } from "lucide-react";
import Modal from "@/components/modal/Modal";
import Button from "@/components/Button";
import type { Reservation } from "./ReservationCard";

const friends = [
  { id: "1", name: "강재훈", email: "ex1@gmail.com" },
  { id: "2", name: "이선우", email: "ex2@gmail.com" },
  { id: "3", name: "방효진", email: "ex3@gmail.com" },
];
const AVATAR_COLORS = ["bg-primary-400", "bg-secondary-400", "bg-accent-400"];

export default function ShareTicketModal({
  open,
  onClose,
  reservation: r,
}: {
  open: boolean;
  onClose: () => void;
  reservation: Reservation;
}) {
  const max = Math.max(1, r.count - 1);
  const [qty, setQty] = useState(1);
  const [selected, setSelected] = useState<string | null>(null);

  const handleShare = () => {
    // TODO: 티켓 공유 server action (selected, qty)
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Modal.Header>티켓 공유하기</Modal.Header>
      <Modal.Body>
        <div className="rounded-xl bg-gray-50 p-4">
          <p className="text-xs text-gray-400">예매 이벤트</p>
          <p className="font-semibold text-gray-900">{r.title}</p>
          <div className="mt-2 flex justify-between text-sm">
            <span className="text-gray-500">총 티켓 수</span>
            <span className="font-medium text-gray-900">{r.count}매</span>
          </div>
        </div>

        <div>
          <p className="mb-2 text-sm font-medium text-gray-700">
            공유할 티켓 수
          </p>
          <div className="flex items-center justify-center gap-6">
            <button
              type="button"
              onClick={() => setQty((q) => Math.max(1, q - 1))}
              className="flex size-8 items-center justify-center rounded-full border border-gray-300 text-gray-600"
            >
              <Minus size={16} />
            </button>
            <span className="text-2xl font-bold text-primary-600">
              {qty}
              <span className="ml-0.5 text-sm font-normal text-gray-400">
                매
              </span>
            </span>
            <button
              type="button"
              onClick={() => setQty((q) => Math.min(max, q + 1))}
              className="flex size-8 items-center justify-center rounded-full border border-gray-300 text-gray-600"
            >
              <Plus size={16} />
            </button>
          </div>
          <p className="mt-2 text-center text-xs text-gray-400">
            최소 1장은 본인이 보유해야 합니다
          </p>
        </div>

        <div>
          <p className="mb-2 text-sm font-medium text-gray-700">
            티켓을 공유할 친구 선택
          </p>
          <div className="flex flex-col gap-2">
            {friends.map((f, i) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setSelected(f.id)}
                className={`flex items-center gap-3 rounded-xl border p-3 text-left transition-colors ${
                  selected === f.id
                    ? "border-primary-400 bg-primary-100"
                    : "border-gray-100 hover:bg-gray-50"
                }`}
              >
                <div
                  className={`flex size-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold text-white ${AVATAR_COLORS[i % AVATAR_COLORS.length]}`}
                >
                  {f.name.charAt(0)}
                </div>
                <div className="min-w-0">
                  <p className="font-medium text-gray-900">{f.name}</p>
                  <p className="truncate text-xs text-gray-400">{f.email}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

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
          취소
        </Button>
        <button
          type="button"
          disabled={!selected}
          onClick={handleShare}
          className="flex-1 rounded-lg bg-gradient-to-r from-primary-400 to-secondary-400 px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          공유하기
        </button>
      </Modal.Footer>
    </Modal>
  );
}

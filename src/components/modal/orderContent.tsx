"use client";

import { useState } from "react";
import Modal from "@/components/modal/modal";
import Button from "@/components/Button";
import { cn } from "@/lib/cn";

interface BookingDate {
  id: number;
  day: string;
  date: string;
  time: string;
}

interface BookingSeat {
  id: number;
  name: string;
  price: number;
  info?: string;
}

interface OrderContentProps {
  open: boolean;
  onClose: () => void;
  dates: BookingDate[];
  seats: BookingSeat[];
  onSubmit: (selection: {
    dateId: number | null;
    seatId: number | null;
    quantity: number;
  }) => void;
}

export default function OrderContent({
  open,
  onClose,
  dates,
  seats,
  onSubmit,
}: OrderContentProps) {
  const [dateId, setDateId] = useState<number | null>(null);
  const [seatId, setSeatId] = useState<number | null>(null);
  const [quantity, setQuantity] = useState(1);

  const seat = seats.find((s) => s.id === seatId);
  const amount = seat ? seat.price * quantity : 0;
  const price = Math.round(amount * 0.05);
  const totalPrice = amount + price;
  const ready = dateId !== null && seatId !== null;

  return (
    <Modal open={open} onClose={onClose} position="sheet">
      <div className="flex max-h-[80vh] flex-col gap-6 overflow-y-auto p-6">
        <h2 className="text-lg font-bold text-gray-900">예매하기</h2>

        <div className="flex flex-col gap-3">
          <p className="text-sm font-semibold text-gray-700">
            1. 날짜 및 회차 선택
          </p>
          <div className="flex gap-2">
            {dates.map((d) => (
              <button
                key={d.id}
                type="button"
                onClick={() => setDateId(d.id)}
                className={cn(
                  "flex flex-1 flex-col items-center gap-0.5 rounded-xl border py-2 text-sm",
                  dateId === d.id
                    ? "border-primary-500 bg-primary-100 text-primary-800"
                    : "border-gray-200 text-gray-600",
                )}
              >
                <span className="text-xs">{d.day}</span>
                <span className="font-semibold">{d.date}</span>
                <span className="text-xs">{d.time}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <p className="text-sm font-semibold text-gray-700">2. 좌석 등급</p>
          <div className="flex flex-col gap-2">
            {seats.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setSeatId(s.id)}
                className={cn(
                  "flex items-center justify-between rounded-xl border px-4 py-3 text-left",
                  seatId === s.id
                    ? "border-primary-500 bg-primary-100"
                    : "border-gray-200",
                )}
              >
                <span className="flex flex-col">
                  <span className="text-sm font-semibold text-gray-900">
                    {s.name}
                  </span>
                  {s.info && (
                    <span className="text-xs text-gray-400">{s.info}</span>
                  )}
                </span>
                <span className="text-sm font-semibold text-gray-900">
                  {s.price.toLocaleString()}원
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <p className="text-sm font-semibold text-gray-700">3. 수량</p>
          <div className="flex items-center justify-between rounded-xl border border-gray-200 px-4 py-3">
            <span className="text-sm text-gray-600">매수</span>
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="flex size-7 items-center justify-center rounded-full border border-gray-300 text-gray-600"
              >
                −
              </button>
              <span className="w-6 text-center font-semibold">{quantity}</span>
              <button
                type="button"
                onClick={() => setQuantity((q) => q + 1)}
                className="flex size-7 items-center justify-center rounded-full border border-gray-300 text-gray-600"
              >
                +
              </button>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2 border-t border-gray-100 pt-4 text-sm">
          <div className="flex justify-between text-gray-600">
            <span>티켓 금액 ({quantity}매)</span>
            <span>{amount.toLocaleString()}원</span>
          </div>
          <div className="flex justify-between text-gray-600">
            <span>수수료 (5%)</span>
            <span>{price.toLocaleString()}원</span>
          </div>
          <div className="flex justify-between text-base font-bold">
            <span>합계</span>
            <span className="text-primary-700">
              {totalPrice.toLocaleString()}원
            </span>
          </div>
        </div>

        <Button
          fullWidth
          disabled={!ready}
          onClick={() => onSubmit({ dateId, seatId, quantity })}
        >
          바로 예매
        </Button>
      </div>
    </Modal>
  );
}

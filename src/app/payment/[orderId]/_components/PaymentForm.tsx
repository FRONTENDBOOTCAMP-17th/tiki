"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import * as PortOne from "@portone/browser-sdk/v2";
import { cancelReservation } from "@/app/action";
import Header from "@/components/Header";
import Button from "@/components/Button";
import { Input } from "@/components/Input";
import useToast from "@/hooks/useToast";
import PaymentMethodSelector from "./PaymentMethodSelector";
import type { EasyPayProviderOption } from "./easyPayOptions";

export interface BookingSummary {
  eventTitle: string;
  thumbnail: string;
  venueName: string;
  date: string; // "2026-06-14"
  startTime: string; // "19:00"
  gradeName: string;
  quantity: number;
  subtotal: number;
  fee: number;
  seatLabels?: string[]; // 좌석 배치도가 있는 이벤트만 채워짐 (예: ["A1", "A2"])
}

export interface BuyerDefaults {
  name: string;
  phone: string;
  email: string;
}

interface PaymentFormProps {
  orderId: string;
  totalAmount: number;
  booking: BookingSummary;
  buyerDefaults: BuyerDefaults;
}

// "2026-06-14" + "19:00" -> "2026.06.14(일) 19:00"
function formatBookingDateTime(date: string, startTime: string) {
  const weekday = new Intl.DateTimeFormat("ko-KR", { weekday: "short" }).format(
    new Date(`${date}T00:00:00`),
  );
  return `${date.replaceAll("-", ".")}(${weekday}) ${startTime}`;
}

const ERROR_MESSAGES: Record<string, string> = {
  unauthorized: "로그인이 필요합니다.",
  "event not found": "공연 정보를 찾을 수 없습니다.",
  "event not available": "현재 예매가 불가한 공연입니다.",
  "not enough tickets": "잔여 좌석이 부족합니다.",
  "slot is closed": "마감된 회차입니다.",
};

function toKoreanError(error: unknown): string {
  const msg = error instanceof Error ? error.message : "";
  return ERROR_MESSAGES[msg] ?? msg ?? "결제 처리에 실패했습니다.";
}

// 결제 승인 결과를 서버에 검증 요청하고, 성공 시 예매내역으로 이동한다.
async function confirmPayment(orderId: string) {
  const res = await fetch("/api/payments/confirm", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ orderId }),
  });
  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.message || "결제 확인에 실패했습니다.");
  }
}

export default function PaymentForm({
  orderId,
  totalAmount,
  booking,
  buyerDefaults,
}: PaymentFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const toast = useToast();

  const [name, setName] = useState(buyerDefaults.name);
  const [phone, setPhone] = useState(buyerDefaults.phone);
  const [email, setEmail] = useState(buyerDefaults.email);
  const [easyPayProvider, setEasyPayProvider] =
    useState<EasyPayProviderOption>("KAKAOPAY");
  // 모바일 등 리디렉션 결제 흐름: PG사 결제 완료 후 같은 페이지로 돌아왔을 때
  // 쿼리스트링에 paymentId가 붙어 있으면, 버튼을 누르지 않아도 승인 확인을 이어서 처리해야 한다.
  const redirectedPaymentId = searchParams.get("paymentId");
  const redirectErrorCode = searchParams.get("code");
  const isAutoConfirming = !!redirectedPaymentId && !redirectErrorCode;

  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!redirectedPaymentId) return;

    if (redirectErrorCode) {
      // 결제창에서 취소/실패하고 돌아온 경우, 주문을 ordered 상태로 방치하지 않고
      // 즉시 취소 처리해 예매목록/재고에 남지 않게 한다.
      cancelReservation(orderId);
      toast.error(searchParams.get("message") || "결제가 취소되었습니다.");
      return;
    }

    confirmPayment(orderId)
      .then(() => {
        toast.success("결제가 완료되었습니다.");
        router.replace("/mypage/reservations");
      })
      .catch((error: Error) => {
        toast.error(toKoreanError(error));
        setSubmitting(false);
      });
    // 최초 진입 시 한 번만 확인하면 되므로 searchParams 변화는 의도적으로 무시한다.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handlePay() {
    if (!name.trim()) {
      toast.error("이름을 입력해주세요.");
      return;
    }
    if (!phone.trim()) {
      toast.error("연락처를 입력해주세요.");
      return;
    }
    if (!email.trim()) {
      toast.error("이메일을 입력해주세요.");
      return;
    }

    setSubmitting(true);

    try {
      const response = await PortOne.requestPayment({
        storeId: process.env.NEXT_PUBLIC_PORTONE_STORE_ID!,
        channelKey: process.env.NEXT_PUBLIC_PORTONE_CHANNEL_KEY!,
        paymentId: orderId,
        orderName: booking.eventTitle,
        totalAmount,
        currency: "KRW",
        payMethod: "EASY_PAY",
        easyPay: { easyPayProvider },
        customer: { fullName: name, phoneNumber: phone, email },
        redirectUrl: `${window.location.origin}/payment/${orderId}`,
      });

      // 데스크탑 팝업처럼 리디렉션 없이 끝나는 경우, 여기서 바로 결과를 받는다.
      if (response?.code) {
        // 결제 취소/실패 시 ordered 상태로 방치하지 않고 즉시 취소 처리한다.
        await cancelReservation(orderId);
        toast.error(response.message || "결제에 실패했습니다.");
        setSubmitting(false);
        return;
      }

      await confirmPayment(orderId);
      toast.success("결제가 완료되었습니다.");
      router.replace("/mypage/reservations");
    } catch (error) {
      toast.error(toKoreanError(error));
      setSubmitting(false);
    }
  }

  return (
    <>
      {/* 모바일/태블릿: 간단한 타이틀 바 */}
      <header className="flex w-full items-center justify-center border-b-2 border-primary-100 p-4 md:hidden">
        <h1 className="text-lg font-semibold text-primary-900">결제하기</h1>
      </header>

      {/* 웹: 사이트 공통 헤더 + 타이틀 */}
      <div className="hidden md:block">
        <Header loggedIn showCategory={false} />
        <h1 className="mx-auto w-full max-w-5xl px-4 pt-8 text-2xl font-bold text-gray-900">
          결제하기
        </h1>
      </div>

      <main className="mx-auto w-full max-w-5xl px-4 py-6 md:grid md:grid-cols-[minmax(0,1fr)_320px] md:items-start md:gap-6">
        {/* 좌측: 예매 정보 + 예매자 정보 + 결제 수단 */}
        <div className="flex flex-col gap-6">
          <section className="flex flex-col gap-3">
            <h2 className="text-base font-bold text-gray-900">예매 정보</h2>
            <div className="flex gap-3 rounded-2xl bg-search-background-pink p-4">
              <div className="relative h-20 w-14 shrink-0 overflow-hidden rounded-lg bg-white">
                {booking.thumbnail && (
                  <Image
                    src={booking.thumbnail}
                    alt={booking.eventTitle}
                    fill
                    sizes="56px"
                    className="object-cover"
                  />
                )}
              </div>
              <div className="flex flex-col gap-1">
                <p className="font-semibold text-gray-900">
                  {booking.eventTitle}
                </p>
                <p className="text-sm text-gray-600">
                  {formatBookingDateTime(booking.date, booking.startTime)} ·{" "}
                  {booking.venueName}
                </p>
                <p className="text-sm text-gray-600">
                  {booking.gradeName} · {booking.quantity}매
                </p>
                {booking.seatLabels && (
                  <p className="text-sm text-gray-600">
                    좌석 {booking.seatLabels.join(", ")}
                  </p>
                )}
              </div>
            </div>
          </section>

          <section className="flex flex-col gap-3">
            <h2 className="text-base font-bold text-gray-900">예매자 정보</h2>
            <div className="flex flex-col gap-3 md:flex-row">
              <Input
                label="이름"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <Input
                label="연락처"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
            <Input
              label="이메일"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </section>

          <section className="flex flex-col gap-3">
            <h2 className="text-base font-bold text-gray-900">결제 수단</h2>
            <PaymentMethodSelector
              value={easyPayProvider}
              onChange={setEasyPayProvider}
            />
          </section>
        </div>

        {/* 우측(웹: sticky 카드) / 모바일·태블릿: 본문 하단 */}
        <section className="mt-6 flex flex-col gap-3 rounded-2xl border border-gray-100 p-4 shadow-sm md:sticky md:top-6 md:mt-0">
          <h2 className="text-base font-bold text-gray-900">결제 금액</h2>
          <div className="flex flex-col gap-2 text-sm">
            <div className="flex justify-between text-gray-600">
              <span>티켓 금액 ({booking.quantity}매)</span>
              <span>{booking.subtotal.toLocaleString()}원</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>수수료 (5%)</span>
              <span>{booking.fee.toLocaleString()}원</span>
            </div>
            <div className="flex justify-between border-t border-gray-100 pt-2 text-base font-bold">
              <span>최종 결제</span>
              <span className="text-primary-700">
                {totalAmount.toLocaleString()}원
              </span>
            </div>
          </div>
          <Button
            variant="primary"
            fullWidth
            loading={submitting || isAutoConfirming}
            disabled={submitting || isAutoConfirming}
            onClick={handlePay}
          >
            {totalAmount.toLocaleString()}원 결제하기
          </Button>
          <p className="text-center text-xs text-gray-400">
            이용약관 및 환불 정책에 동의합니다.
          </p>
        </section>
      </main>
    </>
  );
}

"use client";

import { useState } from "react";
import ConfirmModal from "@/components/modal/confirmModal";
import AlertModal from "@/components/modal/alertModal";
import Button from "@/components/Button";
import FriendAddModal from "@/components/modal/friendAddModal";
import NotifModal from "@/components/modal/notifModal";
import OrderContent from "@/components/modal/orderContent";
import NotifSend from "@/components/modal/notifSend";

export default function ModalExamplePage() {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [alertOpen, setAlertOpen] = useState(false);
  const [friendOpen, setFriendOpen] = useState(false);
  const [friendEmail, setFriendEmail] = useState("");
  const [notiOpen, setNotiOpen] = useState(false);
  const [bookingOpen, setBookingOpen] = useState(false);
  const [sendOpen, setSendOpen] = useState(false);

  // 프로필 컴포넌트 적용 예정입니다
  const friendPreview = friendEmail.includes("@") ? (
    <div className="flex items-center gap-3 rounded-lg bg-gray-50 p-3">
      <div className="size-9 rounded-full bg-gray-200" />
      <div className="flex flex-col">
        <span className="text-sm font-medium text-gray-800">{friendEmail}</span>
        <span className="text-xs text-gray-400">TiKi 사용자</span>
      </div>
    </div>
  ) : null;

  // GET /api/notifications 넣고 삭제
  const notifications = [
    {
      id: "notif_01HXYZ",
      type: "friend_request",
      message: "'멋사'님이 친구 요청을 보냈습니다",
      linkUrl: "/mypage/friend",
      createdAt: "2026-06-09T09:41:00Z",
      isRead: false,
    },
    {
      id: "notif_01HXYW",
      type: "order",
      message: "'레베카' 예매가 완료되었습니다",
      linkUrl: "/mypage/orders",
      createdAt: "2026-06-09T09:30:00Z",
      isRead: true,
    },
    {
      id: "notif_01HXYV",
      type: "ad",
      message: "(광고) '멋진 사자의 모험'을 만나보세요!",
      linkUrl: "/category",
      createdAt: "2026-06-09T08:00:00Z",
      isRead: false,
    },
    {
      id: "notif_01HXYU",
      type: "ad",
      message: "(광고) 라이브러리를 둘러보세요!",
      linkUrl: "/mypage/library",
      createdAt: "2026-06-08T20:00:00Z",
      isRead: true,
    },
  ];

  // GET /api/slots 추가 후 삭제
  const bookingDates = [
    { id: 1, day: "토", date: "6/14", time: "19:00" },
    { id: 2, day: "일", date: "6/15", time: "19:00" },
    { id: 3, day: "토", date: "6/21", time: "19:00" },
  ];
  const bookingSeats = [
    { id: 1, name: "일반석", price: 44000, info: "잔여 8석 · 매진 임박" },
    { id: 2, name: "VIP석", price: 68000, info: "잔여 22석" },
  ];

  return (
    <main className="flex flex-col gap-8 p-10">
      <section className="flex flex-col items-start gap-2">
        <h2 className="text-lg font-semibold">확인 모달</h2>
        <Button onClick={() => setConfirmOpen(true)}>확인 모달 열기</Button>
        <ConfirmModal
          open={confirmOpen}
          onClose={() => setConfirmOpen(false)}
          onConfirm={() => setConfirmOpen(false)}
          title="모달 제목"
          description="모달 내용"
          confirmText="확인"
        />
      </section>

      <section className="flex flex-col items-start gap-2">
        <h2 className="text-lg font-semibold">안내 모달</h2>
        <Button onClick={() => setAlertOpen(true)}>안내 모달 열기</Button>
        <AlertModal
          open={alertOpen}
          onClose={() => setAlertOpen(false)}
          title="안내"
        >
          안내사항 내용 안내사항 내용
        </AlertModal>
      </section>

      <section className="flex flex-col items-start gap-2">
        <h2 className="text-lg font-semibold">친구 추가 모달</h2>
        <Button onClick={() => setFriendOpen(true)}>친구 추가 열기</Button>
        <FriendAddModal
          open={friendOpen}
          onClose={() => setFriendOpen(false)}
          onEmailChange={setFriendEmail}
          preview={friendPreview}
          onSubmit={(email) => {
            // POST /api/friends/requests 연결 예정
            console.log("POST /api/friends/requests", { email });
            setFriendOpen(false);
          }}
        />
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="text-lg font-semibold">알림 모달</h2>
        <div className="flex justify-end">
          <div className="relative">
            <button
              type="button"
              aria-label="알림"
              onClick={() => setNotiOpen((v) => !v)}
              className="text-gray-600"
            >
              <svg
                width="24"
                height="24"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0"
                />
              </svg>
            </button>
            <NotifModal
              open={notiOpen}
              onClose={() => setNotiOpen(false)}
              notifications={notifications}
            />
          </div>
        </div>
      </section>

      <section className="flex flex-col items-start gap-2">
        <h2 className="text-lg font-semibold">예매하기 (바텀시트)</h2>
        <Button onClick={() => setBookingOpen(true)}>예매하기 열기</Button>
        <OrderContent
          open={bookingOpen}
          onClose={() => setBookingOpen(false)}
          dates={bookingDates}
          seats={bookingSeats}
          onSubmit={(selection) => {
            // POST /api/orders 연결 예정
            console.log("POST /api/orders", selection);
            setBookingOpen(false);
          }}
        />
      </section>

      <section className="flex flex-col items-start gap-2">
        <h2 className="text-lg font-semibold">알림 보내기 (관리자)</h2>
        <Button onClick={() => setSendOpen(true)}>알림 보내기 열기</Button>
        <NotifSend
          open={sendOpen}
          onClose={() => setSendOpen(false)}
          onSubmit={(payload) => {
            // POST /api/admin/notifications 연결
            console.log("POST /api/admin/notifications", payload);
            setSendOpen(false);
          }}
        />
      </section>
    </main>
  );
}

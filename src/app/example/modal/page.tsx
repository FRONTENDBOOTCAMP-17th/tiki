"use client";

import { useState } from "react";
import Dialog from "@/components/modal/Dialog";
import Button from "@/components/Button";
import Profile from "@/components/Profile";
import { Input } from "@/components/Input";
import OrderContent from "@/components/modal/OrderContent";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// 알림 보내기 부분 페이지 선택
const pages = [
  { label: "홈 화면", path: "/" },
  { label: "카테고리 화면", path: "/category" },
  { label: "검색 화면", path: "/search" },
  { label: "예매내역 화면", path: "/mypage/history" },
  { label: "라이브러리 화면", path: "/mypage/library" },
  { label: "친구 화면", path: "/mypage/friend" },
  { label: "마이페이지 화면", path: "/mypage" },
];

const field =
  "h-11 rounded-lg border border-gray-300 px-3 text-sm outline-none";
const labelText = "text-sm font-medium text-gray-700";

export default function ModalExamplePage() {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [alertOpen, setAlertOpen] = useState(false);
  const [bookingOpen, setBookingOpen] = useState(false);

  // 친구 추가
  const [friendOpen, setFriendOpen] = useState(false);
  const [friendEmail, setFriendEmail] = useState("");
  const friendValid = emailPattern.test(friendEmail);
  const closeFriend = () => {
    setFriendEmail("");
    setFriendOpen(false);
  };

  // 알림 보내기
  const [sendOpen, setSendOpen] = useState(false);
  const [type, setType] = useState<"ad" | "system">("ad");
  const [message, setMessage] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [scheduledAt, setScheduledAt] = useState("");
  const [target, setTarget] = useState<"all" | "buyers">("all");
  const sendValid = Boolean(message.trim() && linkUrl);

  // GET /api/slots 연결 예정
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
        <Dialog
          open={confirmOpen}
          onClose={() => setConfirmOpen(false)}
          onConfirm={() => setConfirmOpen(false)}
          title="모달 제목"
          description="모달 내용"
        />
      </section>

      <section className="flex flex-col items-start gap-2">
        <h2 className="text-lg font-semibold">안내 모달</h2>
        <Button onClick={() => setAlertOpen(true)}>안내 모달 열기</Button>
        <Dialog
          open={alertOpen}
          onClose={() => setAlertOpen(false)}
          title="안내"
          description="안내사항 내용 안내사항 내용"
          showCancel={false}
          confirmText="닫기"
        />
      </section>

      <section className="flex flex-col items-start gap-2">
        <h2 className="text-lg font-semibold">친구 추가 모달</h2>
        <Button onClick={() => setFriendOpen(true)}>친구 추가 열기</Button>
        <Dialog
          open={friendOpen}
          onClose={closeFriend}
          title="친구 추가"
          confirmText="친구 요청"
          confirmDisabled={!friendValid}
          onConfirm={() => {
            // POST /api/friends/requests 연결 예정
            console.log("POST /api/friends/requests", { email: friendEmail });
            closeFriend();
          }}
        >
          <Input
            label="친구 이메일"
            type="email"
            value={friendEmail}
            onChange={(e) => setFriendEmail(e.target.value)}
            placeholder="friend@example.com"
            helperText="친구의 TiKi 계정 이메일을 입력하세요"
          />
          {friendEmail.includes("@") && (
            <Profile direction="row" name={friendEmail} />
          )}
        </Dialog>
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
        <Dialog
          open={sendOpen}
          onClose={() => setSendOpen(false)}
          title="알림 보내기"
          confirmText="보내기"
          confirmDisabled={!sendValid}
          onConfirm={() => {
            // POST /api/admin/notifications 연결 예정
            console.log("POST /api/admin/notifications", {
              type,
              message,
              linkUrl,
              scheduledAt: scheduledAt || null,
              target,
            });
            setSendOpen(false);
          }}
        >
          <label className="flex flex-col gap-2">
            <span className={labelText}>종류</span>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as "ad" | "system")}
              className={field}
            >
              <option value="ad">광고</option>
              <option value="system">공지</option>
            </select>
          </label>

          <label className="flex flex-col gap-2">
            <span className={labelText}>메시지</span>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="보낼 알림 내용을 입력하세요"
              rows={3}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none placeholder:text-gray-400"
            />
          </label>

          <label className="flex flex-col gap-2">
            <span className={labelText}>클릭 시 연결될 페이지</span>
            <select
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              className={field}
            >
              <option value="" disabled>
                페이지 선택
              </option>
              {pages.map((page) => (
                <option key={page.path} value={page.path}>
                  {page.label}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-2">
            <span className={labelText}>예약 시간</span>
            <input
              type="datetime-local"
              value={scheduledAt}
              onChange={(e) => setScheduledAt(e.target.value)}
              className={field}
            />
            <span className="text-xs text-gray-400">비우면 즉시 발송</span>
          </label>

          <label className="flex flex-col gap-2">
            <span className={labelText}>받는 대상</span>
            <select
              value={target}
              onChange={(e) => setTarget(e.target.value as "all" | "buyers")}
              className={field}
            >
              <option value="all">전체 회원</option>
              <option value="buyers">구매자 전체</option>
            </select>
          </label>
        </Dialog>
      </section>
    </main>
  );
}

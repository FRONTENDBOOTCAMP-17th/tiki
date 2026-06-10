"use client";

import { useState } from "react";
import Modal from "@/components/modal/Modal";
import Button from "@/components/Button";

interface NotifSendProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (payload: {
    type: "ad" | "system";
    message: string;
    linkUrl: string;
    scheduledAt: string | null;
    target: "all" | "buyers";
  }) => void;
}

const pages = [
  { label: "홈 화면", path: "/" },
  { label: "카테고리 화면", path: "/category" },
  { label: "검색 화면", path: "/search" },
  { label: "예매내역 화면", path: "/mypage/history" },
  { label: "라이브러리 화면", path: "/mypage/library" },
  { label: "친구 화면", path: "/mypage/friend" },
  { label: "마이페이지 화면", path: "/mypage" },
];

const field = "h-11 rounded-lg border border-gray-300 px-3 text-sm outline-none";
const labelText = "text-sm font-medium text-gray-700";

export default function NotifSend({ open, onClose, onSubmit }: NotifSendProps) {
  const [type, setType] = useState<"ad" | "system">("ad");
  const [message, setMessage] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [scheduledAt, setScheduledAt] = useState("");
  const [target, setTarget] = useState<"all" | "buyers">("all");

  const valid = message.trim() && linkUrl;

  const send = () => {
    onSubmit({ type, message, linkUrl, scheduledAt: scheduledAt || null, target });
  };

  return (
    <Modal open={open} onClose={onClose}>
      <div className="flex max-h-[85vh] flex-col gap-5 overflow-y-auto p-6">
        <h2 className="text-lg font-bold text-gray-900">알림 보내기</h2>

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

        <div className="flex gap-2">
          <Button
            variant="outline"
            fullWidth
            className="border-gray-300 text-gray-700"
            onClick={onClose}
          >
            취소
          </Button>
          <Button fullWidth disabled={!valid} onClick={send}>
            보내기
          </Button>
        </div>
      </div>
    </Modal>
  );
}

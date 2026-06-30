"use client";

import { useRef, useState, useTransition } from "react";
import { Search, Send, Clock, Megaphone, Ticket } from "lucide-react";
import type { NotificationHistory } from "../page";
import { sendNotification } from "../actions";
import type { NotificationType } from "../actions";
import Dialog from "@/components/modal/Dialog";

interface Member {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
}

const TARGET_OPTIONS = [
  { value: "all", label: "전체 회원" },
  { value: "buyer", label: "구매자" },
  { value: "seller", label: "판매자" },
  { value: "specific", label: "직접 선택" },
] as const;

const NOTIFICATION_TYPE_OPTIONS: { value: NotificationType; label: string; icon: React.ElementType; description: string }[] = [
  { value: "ad", label: "공지/이벤트", icon: Megaphone, description: "공지사항, 프로모션, 이벤트 안내" },
  { value: "order", label: "주문/티켓", icon: Ticket, description: "예매 안내, 티켓 관련 공지" },
];

const TARGET_LABEL: Record<string, string> = {
  admin_all: "전체",
  admin_buyer: "구매자",
  admin_seller: "판매자",
  admin_specific: "직접 선택",
};

const NOTIFICATION_TYPE_LABEL: Record<NotificationType, string> = {
  ad: "공지/이벤트",
  order: "주문/티켓",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("ko-KR", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function NotificationManager({
  members,
  history,
}: {
  members: Member[];
  history: NotificationHistory[];
}) {
  const [tab, setTab] = useState<"send" | "history">("send");
  const [target, setTarget] = useState<"all" | "buyer" | "seller" | "specific">("all");
  const [notificationType, setNotificationType] = useState<NotificationType>("ad");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [title, setTitle] = useState("");
  const [link, setLink] = useState("");
  const [memberSearch, setMemberSearch] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<{ success?: boolean; count?: number; error?: string } | null>(null);
  const isSendingRef = useRef(false);

  const filteredMembers = members.filter(
    (m) =>
      m.name.toLowerCase().includes(memberSearch.toLowerCase()) ||
      m.email.toLowerCase().includes(memberSearch.toLowerCase()),
  );

  const recipientCount =
    target === "specific"
      ? selectedIds.size
      : target === "all"
        ? members.length
        : members.filter((m) => m.role === target).length;

  function toggleMember(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  const canSend =
    !!title.trim() && (target !== "specific" || selectedIds.size > 0);

  function handleSend() {
    if (!canSend || isPending || isSendingRef.current) return;
    setConfirmOpen(true);
  }

  function handleConfirm() {
    if (isSendingRef.current) return;
    isSendingRef.current = true;
    setConfirmOpen(false);
    setResult(null);
    startTransition(async () => {
      try {
        const res = await sendNotification({
          target,
          userIds: target === "specific" ? [...selectedIds] : undefined,
          title,
          notificationType,
          link: link || undefined,
        });
        setResult(res);
        if (res.success) {
          setTitle("");
          setLink("");
          setTarget("all");
          setNotificationType("ad");
          setSelectedIds(new Set());
          setMemberSearch("");
        }
      } finally {
        isSendingRef.current = false;
      }
    });
  }

  const targetLabel = TARGET_OPTIONS.find((o) => o.value === target)?.label ?? "";
  const recipientLabel = target === "specific" ? `${selectedIds.size}명` : `약 ${recipientCount}명`;

  return (
    <div className="space-y-4">
      {/* 탭 */}
      <div className="flex gap-1 rounded-xl bg-gray-100 p-1 w-fit">
        <button
          onClick={() => setTab("send")}
          className={`rounded-lg px-4 py-1.5 text-sm font-medium transition-colors ${
            tab === "send" ? "bg-white shadow-sm text-gray-900" : "text-gray-500 hover:text-gray-700"
          }`}
        >
          발송하기
        </button>
        <button
          onClick={() => setTab("history")}
          className={`rounded-lg px-4 py-1.5 text-sm font-medium transition-colors ${
            tab === "history" ? "bg-white shadow-sm text-gray-900" : "text-gray-500 hover:text-gray-700"
          }`}
        >
          발송 내역
          {history.length > 0 && (
            <span className="ml-1.5 rounded-full bg-primary-100 px-1.5 py-0.5 text-xs text-primary-700">
              {history.length}
            </span>
          )}
        </button>
      </div>

      {/* ── 발송하기 탭 ── */}
      {tab === "send" && (
        <div className="space-y-4">
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="space-y-5">
              {/* 알림 유형 */}
              <div>
                <p className="mb-2 text-sm font-medium text-gray-700">알림 유형</p>
                <div className="flex gap-3">
                  {NOTIFICATION_TYPE_OPTIONS.map((opt) => {
                    const Icon = opt.icon;
                    const selected = notificationType === opt.value;
                    return (
                      <button
                        key={opt.value}
                        onClick={() => setNotificationType(opt.value)}
                        className={`flex flex-1 items-center gap-3 rounded-xl border p-3.5 text-left transition-colors ${
                          selected
                            ? "border-primary-400 bg-primary-50"
                            : "border-gray-200 bg-white hover:bg-gray-50"
                        }`}
                      >
                        <span className={`flex size-8 shrink-0 items-center justify-center rounded-full ${
                          selected ? "bg-primary-100 text-primary-600" : "bg-gray-100 text-gray-500"
                        }`}>
                          <Icon size={16} />
                        </span>
                        <div>
                          <p className={`text-sm font-semibold ${selected ? "text-primary-700" : "text-gray-800"}`}>
                            {opt.label}
                          </p>
                          <p className="text-xs text-gray-400">{opt.description}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 발송 대상 */}
              <div>
                <p className="mb-2 text-sm font-medium text-gray-700">발송 대상</p>
                <div className="flex flex-wrap gap-2">
                  {TARGET_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => { setTarget(opt.value); setSelectedIds(new Set()); }}
                      className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                        target === opt.value
                          ? "bg-primary-500 text-white"
                          : "border border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 직접 선택 — 회원 테이블 */}
              {target === "specific" && (
                <div className="rounded-xl border border-gray-200 bg-gray-50 p-3">
                  <div className="relative mb-3">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="이름 또는 이메일 검색..."
                      value={memberSearch}
                      onChange={(e) => setMemberSearch(e.target.value)}
                      className="w-full rounded-lg border border-gray-200 bg-white py-2 pl-8 pr-3 text-sm outline-none focus:border-primary-400"
                    />
                  </div>
                  <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
                    <div className="max-h-64 overflow-y-auto">
                      <table className="w-full text-sm">
                        <thead className="sticky top-0 bg-gray-50">
                          <tr className="border-b border-gray-100 text-left text-gray-500">
                            <th className="w-10 px-3 py-2.5" />
                            <th className="px-3 py-2.5 font-medium">이름</th>
                            <th className="px-3 py-2.5 font-medium">이메일</th>
                            <th className="px-3 py-2.5 font-medium">역할</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                          {filteredMembers.length === 0 ? (
                            <tr>
                              <td colSpan={4} className="py-8 text-center text-xs text-gray-400">
                                검색 결과가 없습니다
                              </td>
                            </tr>
                          ) : (
                            filteredMembers.map((m) => (
                              <tr
                                key={m.id}
                                onClick={() => toggleMember(m.id)}
                                className="cursor-pointer hover:bg-primary-50/40"
                              >
                                <td className="px-3 py-2.5">
                                  <input
                                    type="checkbox"
                                    checked={selectedIds.has(m.id)}
                                    onChange={() => toggleMember(m.id)}
                                    onClick={(e) => e.stopPropagation()}
                                    className="accent-primary-500"
                                  />
                                </td>
                                <td className="px-3 py-2.5 font-medium text-gray-900">{m.name}</td>
                                <td className="px-3 py-2.5 text-gray-500">{m.email}</td>
                                <td className="px-3 py-2.5">
                                  <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
                                    {m.role === "buyer" ? "구매자" : m.role === "seller" ? "판매자" : m.role}
                                  </span>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                  {selectedIds.size > 0 && (
                    <p className="mt-2 text-xs font-medium text-primary-600">{selectedIds.size}명 선택됨</p>
                  )}
                </div>
              )}

              {/* 알림 내용 */}
              <div>
                <p className="mb-2 text-sm font-medium text-gray-700">알림 내용</p>
                <textarea
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="발송할 알림 메시지를 입력하세요"
                  rows={3}
                  className="w-full resize-none rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-primary-400 focus:ring-1 focus:ring-primary-400"
                />
              </div>

              {/* 링크 (선택) */}
              <div>
                <p className="mb-1 text-sm font-medium text-gray-700">
                  링크 <span className="font-normal text-gray-400">(선택)</span>
                </p>
                <input
                  type="url"
                  value={link}
                  onChange={(e) => setLink(e.target.value)}
                  placeholder="예: /category/concert"
                  className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-primary-400 focus:ring-1 focus:ring-primary-400"
                />
                <p className="mt-1 text-xs text-gray-400">
                  입력 시 알림 클릭하면 해당 페이지로 이동합니다
                </p>
              </div>

              {/* 결과 메시지 */}
              {result && (
                <div className={`rounded-xl px-4 py-3 text-sm font-medium ${
                  result.success ? "bg-green-50 text-green-700" : "bg-red-50 text-red-600"
                }`}>
                  {result.success ? `✓ ${result.count}명에게 알림을 발송했습니다` : `오류: ${result.error}`}
                </div>
              )}

              {/* 발송 버튼 */}
              <div className="flex items-center justify-between pt-1">
                <p className="text-xs text-gray-400">
                  {targetLabel} · {recipientLabel}에게 발송됩니다
                </p>
                <button
                  onClick={handleSend}
                  disabled={isPending || !canSend}
                  className="flex items-center gap-1.5 rounded-xl bg-linear-to-r from-primary-500 to-secondary-500 px-5 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-40"
                >
                  <Send size={14} />
                  {isPending ? "발송 중..." : "발송하기"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── 발송 내역 탭 ── */}
      {tab === "history" && (
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-left text-gray-500">
                  <th className="px-5 py-3.5 font-medium">발송 시각</th>
                  <th className="px-5 py-3.5 font-medium">내용</th>
                  <th className="px-5 py-3.5 font-medium">수신자</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {history.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="py-16 text-center text-gray-400">
                      <Clock size={24} className="mx-auto mb-2 text-gray-300" />
                      발송 내역이 없습니다
                    </td>
                  </tr>
                ) : (
                  history.map((item, i) => (
                    <tr key={i} className="hover:bg-gray-50/60">
                      <td className="px-5 py-4 text-gray-500 whitespace-nowrap">
                        {formatDate(item.sentAt)}
                      </td>
                      <td className="max-w-xs px-5 py-4">
                        <p className="truncate text-gray-900">{item.title}</p>
                      </td>
                      <td className="px-5 py-4 text-gray-600">
                        {TARGET_LABEL[item.type] === "직접 선택"
                          ? `${item.recipientCount}명`
                          : TARGET_LABEL[item.type] ?? `${item.recipientCount}명`}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          {history.length > 0 && (
            <div className="border-t border-gray-100 px-5 py-3 text-xs text-gray-400">
              총 {history.length}건
            </div>
          )}
        </div>
      )}

      {/* 전송 전 확인 다이얼로그 */}
      <Dialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title="알림 발송 확인"
        confirmText={isPending ? "발송 중..." : "발송하기"}
        confirmVariant="primary"
        cancelText="취소"
        onConfirm={handleConfirm}
        confirmDisabled={isPending}
      >
        <div className="space-y-3 text-sm">
          <div className="rounded-xl bg-gray-50 p-4 space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-500">알림 유형</span>
              <span className="font-medium text-gray-900">{NOTIFICATION_TYPE_LABEL[notificationType]}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">발송 대상</span>
              <span className="font-medium text-gray-900">{targetLabel} ({recipientLabel})</span>
            </div>
            {link && (
              <div className="flex justify-between gap-4">
                <span className="shrink-0 text-gray-500">링크</span>
                <span className="truncate font-medium text-gray-900 text-right">{link}</span>
              </div>
            )}
          </div>
          <div className="rounded-xl border border-gray-200 px-4 py-3">
            <p className="text-gray-800">{title}</p>
          </div>
          <p className="text-xs text-gray-400">발송 후에는 되돌릴 수 없습니다.</p>
        </div>
      </Dialog>
    </div>
  );
}

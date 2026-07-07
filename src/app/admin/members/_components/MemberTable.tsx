"use client";

import { useRouter, usePathname } from "next/navigation";
import { useState, useTransition } from "react";
import { Search, UserX, UserCheck } from "lucide-react";
import { banUser, unbanUser } from "../actions";

interface Member {
  id: string;
  index: number;
  email: string;
  name: string;
  phone: string | null;
  role: string;
  created_at: string;
  banned: boolean;
  partyCount: number;
}

const ROLE_FILTERS = [
  { label: "전체", value: "all" },
  { label: "구매자", value: "buyer" },
  { label: "판매자", value: "seller" },
  { label: "스태프", value: "staff" },
  { label: "관리자", value: "admin" },
];

const STATUS_FILTERS = [
  { label: "전체", value: "all" },
  { label: "활성", value: "active" },
  { label: "정지", value: "banned" },
];

const ROLE_LABELS: Record<string, string> = {
  buyer: "구매자",
  seller: "판매자",
  staff: "스태프",
  admin: "관리자",
};

export default function MemberTable({
  members,
  currentSearch,
  currentRole,
  currentStatus,
}: {
  members: Member[];
  currentSearch: string;
  currentRole: string;
  currentStatus: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [search, setSearch] = useState(currentSearch);
  const [isPending, startTransition] = useTransition();
  const [actionTarget, setActionTarget] = useState<string | null>(null);

  function buildUrl(overrides: Record<string, string>) {
    const params = new URLSearchParams();
    const merged = {
      search: currentSearch,
      role: currentRole,
      status: currentStatus,
      ...overrides,
    };
    if (merged.search) params.set("search", merged.search);
    if (merged.role && merged.role !== "all") params.set("role", merged.role);
    if (merged.status && merged.status !== "all") params.set("status", merged.status);
    return `${pathname}?${params.toString()}`;
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    router.push(buildUrl({ search }));
  }

  async function handleBanToggle(userId: string, isBanned: boolean) {
    setActionTarget(userId);
    startTransition(async () => {
      const result = isBanned ? await unbanUser(userId) : await banUser(userId);
      if (result.error) alert(result.error);
      else router.refresh();
      setActionTarget(null);
    });
  }

  return (
    <div className="space-y-4">
      <form onSubmit={handleSearch} className="relative w-full max-w-sm">
        <Search
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
        />
        <input
          type="text"
          placeholder="회원 이름 또는 이메일 검색..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-9 pr-4 text-sm text-gray-900 outline-none focus:border-primary-400 focus:ring-1 focus:ring-primary-400 dark:border-surface-3 dark:bg-surface-1 dark:text-gray-100 dark:placeholder:text-gray-500"
        />
      </form>

      {/* 역할별 필터 */}
      <div>
        <p className="mb-2 text-xs font-semibold text-gray-500">역할별 필터</p>
        <div className="flex flex-wrap gap-2">
          {ROLE_FILTERS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => router.push(buildUrl({ role: opt.value }))}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                currentRole === opt.value
                  ? "bg-primary-500 text-white"
                  : "border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 dark:border-surface-3 dark:bg-surface-1 dark:text-gray-300 dark:hover:bg-surface-2"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* 상태별 필터 */}
      <div>
        <p className="mb-2 text-xs font-semibold text-gray-500">상태별 필터</p>
        <div className="flex flex-wrap gap-2">
          {STATUS_FILTERS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => router.push(buildUrl({ status: opt.value }))}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                currentStatus === opt.value
                  ? "bg-primary-500 text-white"
                  : "border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 dark:border-surface-3 dark:bg-surface-1 dark:text-gray-300 dark:hover:bg-surface-2"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-surface-3 dark:bg-surface-1">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-left text-gray-500 dark:border-surface-3 dark:text-gray-400">
                <th className="px-5 py-3.5 font-medium">ID</th>
                <th className="px-5 py-3.5 font-medium">이름</th>
                <th className="px-5 py-3.5 font-medium">이메일</th>
                <th className="px-5 py-3.5 font-medium">전화번호</th>
                <th className="px-5 py-3.5 font-medium">역할</th>
                <th className="px-5 py-3.5 font-medium">가입일</th>
                <th className="px-5 py-3.5 font-medium">참여 파티</th>
                <th className="px-5 py-3.5 font-medium">상태</th>
                <th className="px-5 py-3.5 font-medium">관리</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-surface-3">
              {members.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-16 text-center text-gray-400">
                    회원이 없습니다
                  </td>
                </tr>
              ) : (
                members.map((member) => (
                  <tr
                    key={member.id}
                    className="hover:bg-gray-50/60 dark:hover:bg-surface-2"
                  >
                    <td className="px-5 py-4 text-gray-400">{member.index}</td>
                    <td className="px-5 py-4 font-medium text-gray-900 dark:text-gray-50">
                      {member.name}
                    </td>
                    <td className="px-5 py-4 text-gray-600 dark:text-gray-300">
                      {member.email}
                    </td>
                    <td className="px-5 py-4 text-gray-600 dark:text-gray-300">
                      {member.phone || (
                        <span className="text-gray-400 dark:text-gray-500">비어있음</span>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <span className="rounded-full bg-primary-100 px-2.5 py-1 text-xs font-medium text-primary-700">
                        {ROLE_LABELS[member.role] ?? member.role}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-gray-500 dark:text-gray-400">
                      {new Date(member.created_at).toLocaleDateString("ko-KR", {
                        year: "numeric",
                        month: "2-digit",
                        day: "2-digit",
                      })}
                    </td>
                    <td className="px-5 py-4 text-gray-600 dark:text-gray-300">
                      {member.partyCount}개
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                          member.banned
                            ? "bg-danger-100 text-danger-700"
                            : "bg-emerald-100 text-emerald-700"
                        }`}
                      >
                        {member.banned ? "정지" : "활성"}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      {member.role !== "admin" && (
                        <button
                          onClick={() => handleBanToggle(member.id, member.banned)}
                          disabled={isPending && actionTarget === member.id}
                          className={`flex items-center gap-1 text-sm font-medium disabled:opacity-40 ${
                            member.banned
                              ? "text-emerald-600 hover:text-emerald-700"
                              : "text-danger-500 hover:text-danger-600"
                          }`}
                        >
                          {isPending && actionTarget === member.id ? (
                            "처리 중..."
                          ) : member.banned ? (
                            <>
                              <UserCheck size={14} />
                              해제하기
                            </>
                          ) : (
                            <>
                              <UserX size={14} />
                              정지하기
                            </>
                          )}
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="border-t border-gray-100 px-5 py-3 text-xs text-gray-400 dark:border-surface-3">
          총 {members.length}명
        </div>
      </div>
    </div>
  );
}

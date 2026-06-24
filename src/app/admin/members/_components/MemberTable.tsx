"use client";

import { useRouter, usePathname } from "next/navigation";
import { useState, useTransition } from "react";
import { banUser, unbanUser } from "../actions";

interface Member {
  id: string;
  email: string;
  name: string;
  role: string;
  created_at: string;
  banned: boolean;
}

interface MemberTableProps {
  members: Member[];
  currentRole: string;
  currentSearch: string;
}

const ROLE_LABELS: Record<string, string> = {
  buyer: "구매자",
  seller: "판매자",
  admin: "관리자",
};

export default function MemberTable({
  members,
  currentRole,
  currentSearch,
}: MemberTableProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [search, setSearch] = useState(currentSearch);
  const [isPending, startTransition] = useTransition();
  const [actionTarget, setActionTarget] = useState<string | null>(null);

  function applyFilter(role: string, q: string) {
    const params = new URLSearchParams();
    if (role !== "all") params.set("role", role);
    if (q) params.set("search", q);
    router.push(`${pathname}?${params.toString()}`);
  }

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    applyFilter(currentRole, search);
  }

  async function handleBan(userId: string, isBanned: boolean) {
    setActionTarget(userId);
    startTransition(async () => {
      const result = isBanned ? await unbanUser(userId) : await banUser(userId);
      if (result.error) alert(result.error);
      setActionTarget(null);
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <input
            type="text"
            placeholder="이름 또는 이메일 검색"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-primary-400 focus:ring-1 focus:ring-primary-400"
          />
          <button
            type="submit"
            className="rounded-lg bg-primary-500 px-4 py-2 text-sm font-medium text-white hover:bg-primary-600"
          >
            검색
          </button>
        </form>

        <div className="flex gap-2">
          {["all", "buyer", "seller", "admin"].map((r) => (
            <button
              key={r}
              onClick={() => applyFilter(r, search)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                currentRole === r
                  ? "bg-primary-500 text-white"
                  : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-200"
              }`}
            >
              {r === "all" ? "전체" : (ROLE_LABELS[r] ?? r)}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-gray-100 bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">이름</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">이메일</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">역할</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">상태</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">가입일</th>
                <th className="px-4 py-3 text-right font-semibold text-gray-700">액션</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {members.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-gray-400">
                    회원이 없습니다
                  </td>
                </tr>
              ) : (
                members.map((member) => (
                  <tr key={member.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">{member.name}</td>
                    <td className="px-4 py-3 text-gray-600">{member.email}</td>
                    <td className="px-4 py-3">
                      <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
                        {ROLE_LABELS[member.role] ?? member.role}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                          member.banned
                            ? "bg-red-100 text-red-700"
                            : "bg-green-100 text-green-700"
                        }`}
                      >
                        {member.banned ? "정지" : "정상"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500">
                      {new Date(member.created_at).toLocaleDateString("ko-KR")}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {member.role !== "admin" && (
                        <button
                          onClick={() => handleBan(member.id, member.banned)}
                          disabled={isPending && actionTarget === member.id}
                          className={`rounded-lg px-3 py-1 text-xs font-medium transition-colors disabled:opacity-50 ${
                            member.banned
                              ? "bg-green-100 text-green-700 hover:bg-green-200"
                              : "bg-red-100 text-red-700 hover:bg-red-200"
                          }`}
                        >
                          {isPending && actionTarget === member.id
                            ? "처리 중..."
                            : member.banned
                              ? "밴 해제"
                              : "밴"}
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="border-t border-gray-100 px-4 py-3 text-xs text-gray-500">
          총 {members.length}명
        </div>
      </div>
    </div>
  );
}

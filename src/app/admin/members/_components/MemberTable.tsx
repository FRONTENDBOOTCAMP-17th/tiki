"use client";

import { useRouter, usePathname } from "next/navigation";
import { useState, useTransition } from "react";
import { Search } from "lucide-react";
import { banUser, unbanUser } from "../actions";

interface Member {
  id: string;
  index: number;
  email: string;
  name: string;
  role: string;
  created_at: string;
  banned: boolean;
  provider: string;
  partyCount: number;
}

const PROVIDER_LABELS: Record<string, string> = {
  google: "구글",
  kakao: "카카오",
  github: "깃허브",
  email: "이메일",
};

export default function MemberTable({
  members,
  currentSearch,
}: {
  members: Member[];
  currentSearch: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [search, setSearch] = useState(currentSearch);
  const [isPending, startTransition] = useTransition();
  const [actionTarget, setActionTarget] = useState<string | null>(null);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    router.push(`${pathname}?${params.toString()}`);
  }

  async function handleBanToggle(userId: string, isBanned: boolean) {
    setActionTarget(userId);
    startTransition(async () => {
      const result = isBanned ? await unbanUser(userId) : await banUser(userId);
      if (result.error) alert(result.error);
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
          className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-9 pr-4 text-sm outline-none focus:border-primary-400 focus:ring-1 focus:ring-primary-400"
        />
      </form>

      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-left text-gray-500">
                <th className="px-5 py-3.5 font-medium">ID</th>
                <th className="px-5 py-3.5 font-medium">이름</th>
                <th className="px-5 py-3.5 font-medium">이메일</th>
                <th className="px-5 py-3.5 font-medium">소셜 로그인</th>
                <th className="px-5 py-3.5 font-medium">가입일</th>
                <th className="px-5 py-3.5 font-medium">참여 파티</th>
                <th className="px-5 py-3.5 font-medium">상태</th>
                <th className="px-5 py-3.5 font-medium">관리</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {members.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-16 text-center text-gray-400">
                    회원이 없습니다
                  </td>
                </tr>
              ) : (
                members.map((member) => (
                  <tr key={member.id} className="hover:bg-gray-50/60">
                    <td className="px-5 py-4 text-gray-400">{member.index}</td>
                    <td className="px-5 py-4 font-medium text-gray-900">{member.name}</td>
                    <td className="px-5 py-4 text-gray-600">{member.email}</td>
                    <td className="px-5 py-4">
                      <span className="rounded-full bg-gray-900 px-2.5 py-1 text-xs font-medium text-white">
                        {PROVIDER_LABELS[member.provider] ?? member.provider}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-gray-500">
                      {new Date(member.created_at).toLocaleDateString("ko-KR", {
                        year: "numeric",
                        month: "2-digit",
                        day: "2-digit",
                      })}
                    </td>
                    <td className="px-5 py-4 text-gray-600">{member.partyCount}개</td>
                    <td className="px-5 py-4">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                          member.banned
                            ? "bg-red-500 text-white"
                            : "bg-green-500 text-white"
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
                              ? "text-green-600 hover:text-green-700"
                              : "text-red-500 hover:text-red-600"
                          }`}
                        >
                          {isPending && actionTarget === member.id ? (
                            "처리 중..."
                          ) : member.banned ? (
                            <>✓ 해제하기</>
                          ) : (
                            <>🚫 정지하기</>
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
        <div className="border-t border-gray-100 px-5 py-3 text-xs text-gray-400">
          총 {members.length}명
        </div>
      </div>
    </div>
  );
}

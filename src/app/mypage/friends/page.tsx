import { Users, Ticket, Mail } from "lucide-react";
import AddFriendButton from "@/components/mypage/AddFriendButton";
import DeleteFriendButton from "@/components/mypage/DeleteFriendButton";

// 더미 (나중에 Supabase 조회로 교체)
const friends = [
  { id: "1", name: "강재훈", email: "ex1@gmail.com", meetCount: 5 },
  { id: "2", name: "이선우", email: "ex2@gmail.com", meetCount: 3 },
  { id: "3", name: "방효진", email: "ex3@gmail.com", meetCount: 8 },
];

const sharedTickets = [
  {
    id: "1",
    title: "재즈 피아노 콘서트",
    date: "2026.05.20 (화) 20:00",
    sharedWith: "강재훈",
    sharedAt: "2026.05.02",
  },
];

// 아바타 색 순환 (친구 수에 따라 색이 반복되도록)
const AVATAR_COLORS = ["bg-primary-400", "bg-secondary-400", "bg-accent-400"];

const GUIDE = [
  "친구를 추가하면 함께 예매한 공연 내역을 확인할 수 있습니다",
  "예매 내역에서 티켓을 친구와 공유할 수 있습니다",
  "공유된 티켓은 친구도 QR 코드로 입장 가능합니다",
  "친구와 함께 갈 수 있는 이벤트를 추천받을 수 있습니다",
];

export default function FriendsPage() {
  return (
    <div className="flex flex-col gap-6">
      {/* 헤더 */}
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">친구 관리</h1>
          <p className="mt-1 text-sm text-gray-500">
            함께 공연을 즐길 친구들을 관리하세요
          </p>
        </div>
        <AddFriendButton />
      </div>

      {/* 내 친구 */}
      <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm md:p-8">
        <h2 className="flex items-center gap-2 text-base font-bold text-gray-900">
          <Users size={18} className="text-primary-500" />내 친구 (
          {friends.length}명)
        </h2>

        <div className="mt-4 flex flex-col gap-3">
          {friends.map((friend, i) => (
            <div
              key={friend.id}
              className="flex items-center gap-3 rounded-xl border border-gray-100 p-4"
            >
              {/* 아바타 (이니셜 + 색 순환) */}
              <div
                className={`flex size-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold text-white ${AVATAR_COLORS[i % AVATAR_COLORS.length]}`}
              >
                {friend.name.charAt(0)}
              </div>

              <div className="min-w-0 flex-1">
                <p className="font-semibold text-gray-900">{friend.name}</p>
                <div className="mt-0.5 flex flex-col gap-0.5 text-sm text-gray-500 md:flex-row md:items-center md:gap-2">
                  <span className="flex items-center gap-1 truncate">
                    <Mail size={14} className="shrink-0" />
                    {friend.email}
                  </span>
                  <span className="hidden md:inline">·</span>
                  <span className="shrink-0">
                    함께 간 공연 {friend.meetCount}회
                  </span>
                </div>
              </div>

              <DeleteFriendButton name={friend.name} />
            </div>
          ))}
        </div>
      </section>

      {/* 공유한 티켓 */}
      <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm md:p-8">
        <h2 className="flex items-center gap-2 text-base font-bold text-gray-900">
          <Ticket size={18} className="text-accent-500" />
          공유한 티켓 ({sharedTickets.length}개)
        </h2>

        <div className="mt-4 flex flex-col gap-3">
          {sharedTickets.map((ticket) => (
            <div
              key={ticket.id}
              className="flex items-start gap-4 rounded-xl border border-gray-100 p-4"
            >
              {/* 포스터 placeholder (나중에 실제 이미지로) */}
              <div className="size-14 shrink-0 rounded-lg bg-gradient-to-br from-accent-200 to-primary-200" />

              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <p className="font-semibold text-gray-900">{ticket.title}</p>
                  <span className="shrink-0 rounded-full bg-accent-100 px-2.5 py-0.5 text-xs font-medium text-accent-700">
                    공유됨
                  </span>
                </div>
                <p className="mt-1 text-sm text-gray-500">{ticket.date}</p>
                <p className="mt-0.5 text-xs text-gray-400">
                  공유 대상: {ticket.sharedWith}
                </p>
                <p className="text-xs text-gray-400">
                  공유일: {ticket.sharedAt}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 안내 */}
      <section className="rounded-2xl bg-primary-100 p-6 md:p-8">
        <h2 className="mb-3 font-semibold text-gray-900">친구 관리 안내</h2>
        <ul className="flex list-disc flex-col gap-2 pl-5 text-sm text-gray-600">
          {GUIDE.map((g) => (
            <li key={g}>{g}</li>
          ))}
        </ul>
      </section>
    </div>
  );
}

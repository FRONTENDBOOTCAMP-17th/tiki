// 수락/거절 버튼
"use client";
import { useState, useTransition } from "react";
import { acceptStaffInvite, rejectStaffInvite } from "@/lib/staff/actions";

export default function InviteActions({ staffId }: { staffId: string }) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handle = (action: "accept" | "reject") => {
    startTransition(async () => {
      setError(null);
      const res =
        action === "accept"
          ? await acceptStaffInvite(staffId)
          : await rejectStaffInvite(staffId);
      if (res.code !== "ok") {
        setError("처리에 실패했습니다. 다시 시도해 주세요.");
      }
    });
  };

  return (
    <div className="mt-3">
      <div className="flex gap-2">
        <button
          type="button"
          disabled={isPending}
          onClick={() => handle("accept")}
          className="flex-1 rounded-lg bg-primary-700 py-2 text-sm font-semibold text-white transition hover:bg-primary-800 disabled:opacity-50"
        >
          수락
        </button>
        <button
          type="button"
          disabled={isPending}
          onClick={() => handle("reject")}
          className="flex-1 rounded-lg bg-white py-2 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50 disabled:opacity-50 dark:bg-[#242528] dark:text-gray-300"
        >
          거절
        </button>
      </div>
      {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
    </div>
  );
}

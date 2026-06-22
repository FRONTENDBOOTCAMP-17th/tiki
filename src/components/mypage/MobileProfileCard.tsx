"use client";
import { usePathname } from "next/navigation";

const COMPACT_ROUTES = ["/mypage/reservations", "/mypage/library"];
const HIDDEN_ROUTES = ["/mypage/settings"];
const ROLE_LABEL: Record<string, string> = {
  buyer: "구매자",
  seller: "판매자",
};

interface Props {
  name: string;
  email: string;
  role: string;
}

export default function MobileProfileCard({ name, email, role }: Props) {
  const pathname = usePathname();
  if (HIDDEN_ROUTES.some((r) => pathname.startsWith(r))) return null;

  const compact = COMPACT_ROUTES.some((r) => pathname.startsWith(r));
  const roleLabel = ROLE_LABEL[role] ?? "구매자";

  if (compact) {
    return (
      <div className="mb-6 flex items-center gap-4 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm lg:hidden">
        <div className="size-14 shrink-0 rounded-full bg-gradient-to-br from-primary-300 to-secondary-300" />
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <p className="font-bold text-gray-900">{name}님</p>
            <span className="rounded-full bg-primary-100 px-2.5 py-0.5 text-xs font-medium text-primary-700">
              {roleLabel}
            </span>
          </div>
          <p className="mt-1 truncate text-sm text-gray-400">{email}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-6 flex flex-col items-center gap-2 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm lg:hidden">
      <div className="size-16 rounded-full bg-gradient-to-br from-primary-300 to-secondary-300" />
      <p className="text-lg font-bold text-gray-900">{name}님</p>
      <p className="text-sm text-gray-400">{email}</p>
      <span className="rounded-full bg-primary-100 px-3 py-0.5 text-xs font-medium text-primary-700">
        {roleLabel}
      </span>
    </div>
  );
}

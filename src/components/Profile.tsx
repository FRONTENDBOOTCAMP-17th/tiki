import { cn } from "@/lib/cn";
import Avatar from "./Avatar";

interface ProfileProps {
  name: string;
  email?: string;
  role?: string;
  meetCount?: number;
  direction?: "column" | "row";
  avatarSrc?: string;
  className?: string;
}

export default function Profile({
  name,
  email,
  role,
  meetCount,
  direction = "column",
  avatarSrc,
  className,
}: ProfileProps) {
  const isRow = direction === "row";

  return (
    <div
      className={cn(
        "flex",
        isRow
          ? "items-center gap-3"
          : "flex-col items-center gap-2 text-center",
        className,
      )}
    >
      {avatarSrc ? (
        <img
          src={avatarSrc}
          alt={name}
          className={cn(
            "rounded-full object-cover",
            isRow ? "size-9" : "size-16",
          )}
        />
      ) : (
        <Avatar
          seed={email ?? name}
          className={isRow ? "size-9 text-sm" : "size-16 text-2xl"}
        />
      )}

      <div
        className={cn(
          "flex flex-col",
          isRow ? "min-w-0" : "items-center gap-1",
        )}
      >
        <span
          className={cn(
            "text-mirage",
            isRow ? "truncate text-sm font-semibold" : "text-lg font-bold",
          )}
        >
          {name}
        </span>

        {email && (
          <span className={cn("text-gray-600", "mt-1", "truncate", "text-sm")}>
            {email}
          </span>
        )}

        {meetCount !== undefined && (
          <span
            className={cn(
              "text-gray-500",
              isRow ? "truncate text-xs" : "text-sm",
            )}
          >
            함께 간 공연 {meetCount}회
          </span>
        )}

        {role && (
          <span className="mt-1 w-fit rounded-full bg-primary-100 px-3 py-0.5 text-xs font-medium text-primary-700">
            {role}
          </span>
        )}
      </div>
    </div>
  );
}

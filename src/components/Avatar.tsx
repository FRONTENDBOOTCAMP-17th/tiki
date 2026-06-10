import { cn } from "@/lib/cn";

interface AvatarProps {
  seed: string;
  className?: string;
}

export default function Avatar({ seed, className }: AvatarProps) {
  const letter = seed.trim().charAt(0).toUpperCase() || "?";
  // 프로필 아바타 없을 때 대체용으로 이메일 앞 글자로 아바타 대체하게 했습니다

  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full bg-linear-to-br from-primary-400 via-accent-400  font-semibold text-white",
        className,
      )}
    >
      {letter}
    </div>
  );
}

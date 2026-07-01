import Avatar from "@/components/Avatar";
import { cn } from "@/lib/cn";

interface ReviewAuthorProps {
  name: string;
  className?: string;
  avatarClassName?: string;
  nameClassName?: string;
  showAvatar?: boolean;
  showName?: boolean;
}

export default function ReviewAuthor({
  name,
  className,
  avatarClassName,
  nameClassName,
  showAvatar = true,
  showName = true,
}: ReviewAuthorProps) {
  return (
    <div className={cn("flex min-w-0 items-center gap-2", className)}>
      {showAvatar && (
        <Avatar seed={name} className={cn("size-9 text-sm", avatarClassName)} />
      )}
      {showName && (
        <span
          className={cn(
            "truncate font-semibold text-gray-900 dark:text-gray-50",
            nameClassName,
          )}
        >
          {name}
        </span>
      )}
    </div>
  );
}

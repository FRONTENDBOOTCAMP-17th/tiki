export default function AdminLoading() {
  // admin 페이지 스켈레톤 추가했습니다
  return (
    <div className="space-y-6">
      <div className="h-8 w-40 animate-pulse rounded-lg bg-gray-200 dark:bg-surface-2" />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="h-28 animate-pulse rounded-2xl border border-gray-200 bg-white dark:border-surface-3 dark:bg-surface-1"
          />
        ))}
      </div>
      <div className="h-80 animate-pulse rounded-2xl border border-gray-200 bg-white dark:border-surface-3 dark:bg-surface-1" />
    </div>
  );
}

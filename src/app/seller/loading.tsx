export default function SellerLoading() {
  // 셀러 스켈레톤 추가했습니다
  return (
    <div className="mx-auto max-w-7xl space-y-6 py-8">
      <div className="h-8 w-40 animate-pulse rounded-lg bg-gray-200 dark:bg-surface-2" />
      <div className="grid grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, index) => (
          <div
            key={index}
            className="h-28 animate-pulse rounded-2xl border border-gray-200 bg-white dark:border-surface-3 dark:bg-surface-1"
          />
        ))}
      </div>
      <div className="h-96 animate-pulse rounded-2xl border border-gray-200 bg-white dark:border-surface-3 dark:bg-surface-1" />
    </div>
  );
}

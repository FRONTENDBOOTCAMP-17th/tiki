// 베스트 리뷰 조회가 끝나기 전, 스트리밍 중 보여줄 스켈레톤.
// BestReviewSection과 동일한 그리드/카드 크기를 사용해 레이아웃 흔들림을 막는다.
export default function BestReviewSkeleton() {
  return (
    <section className="bg-gray-50 px-4 py-8 transition-colors md:px-8 lg:px-16 dark:bg-surface-0">
      <div className="mx-auto w-full max-w-7xl">
        <h2 className="mb-4 text-lg font-bold tracking-tight text-gray-950 md:text-xl dark:text-gray-50">
          베스트 리뷰
        </h2>
        <ul className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <li
              key={index}
              className="flex h-full gap-4 rounded-xl border border-gray-200 bg-white p-4 dark:border-surface-3 dark:bg-surface-1"
            >
              <div className="aspect-3/4 w-20 shrink-0 animate-pulse rounded-lg bg-gray-200 dark:bg-surface-2" />
              <div className="flex min-w-0 flex-1 flex-col gap-2 py-1">
                <div className="h-4 w-3/4 animate-pulse rounded bg-gray-200 dark:bg-surface-2" />
                <div className="h-3 w-1/3 animate-pulse rounded bg-gray-200 dark:bg-surface-2" />
                <div className="mt-2 h-3 w-full animate-pulse rounded bg-gray-200 dark:bg-surface-2" />
                <div className="h-3 w-5/6 animate-pulse rounded bg-gray-200 dark:bg-surface-2" />
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

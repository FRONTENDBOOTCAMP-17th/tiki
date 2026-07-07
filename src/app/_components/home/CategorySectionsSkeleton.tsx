// 카테고리별 이벤트 섹션 조회가 끝나기 전, 스트리밍 중 보여줄 스켈레톤.
// HorizontalCardSection과 동일한 카드 크기를 사용해 레이아웃 흔들림을 막는다.
export default function CategorySectionsSkeleton({ count }: { count: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, sectionIndex) => (
        <section key={sectionIndex} className="bg-white px-4 py-7 md:px-8 lg:px-16 dark:bg-surface-0">
          <div className="mx-auto w-full max-w-7xl">
            <div className="mb-4 h-6 w-28 animate-pulse rounded bg-gray-200 dark:bg-surface-2" />
            <div className="flex gap-3 overflow-x-hidden md:gap-4">
              {Array.from({ length: 4 }).map((_, cardIndex) => (
                <div key={cardIndex} className="flex w-36 shrink-0 flex-col gap-2 md:w-44">
                  <div className="aspect-3/4 w-full animate-pulse rounded-xl bg-gray-200 dark:bg-surface-2" />
                  <div className="h-4 w-3/4 animate-pulse rounded bg-gray-200 dark:bg-surface-2" />
                  <div className="h-3 w-1/2 animate-pulse rounded bg-gray-200 dark:bg-surface-2" />
                </div>
              ))}
            </div>
          </div>
        </section>
      ))}
    </>
  );
}

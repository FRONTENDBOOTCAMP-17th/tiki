export default function CategoryLoading() {
  // 카테고리 스켈레톤 추가했습니다
  return (
    <main className="min-h-screen bg-white pb-20 dark:bg-[#202124]">
      <div className="mx-auto w-full max-w-7xl px-4 py-6 md:px-8 lg:px-16">
        <div className="mx-auto mb-8 h-8 w-36 animate-pulse rounded-lg bg-gray-200 dark:bg-[#303134]" />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {Array.from({ length: 10 }).map((_, index) => (
            <div
              key={index}
              className="h-32 animate-pulse rounded-2xl border border-gray-200 bg-gray-100 dark:border-[#3c4043] dark:bg-[#2a2b2f]"
            />
          ))}
        </div>
        <div className="mt-10 grid gap-3 sm:grid-cols-2">
          {Array.from({ length: 2 }).map((_, index) => (
            <div
              key={index}
              className="h-24 animate-pulse rounded-2xl border border-gray-200 bg-gray-100 dark:border-[#3c4043] dark:bg-[#2a2b2f]"
            />
          ))}
        </div>
      </div>
    </main>
  );
}

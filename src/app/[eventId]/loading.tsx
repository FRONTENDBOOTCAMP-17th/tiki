export default function EventDetailLoading() {
  // 이벤트 상세 로딩될떄 스켈레톤 만들었습니다
  return (
    <main className="mx-auto min-h-screen w-full max-w-[1280px] px-4 pb-24 pt-6 sm:px-6 lg:px-8">
      <div className="mb-6 h-5 w-24 animate-pulse rounded bg-gray-200 dark:bg-[#303134]" />
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px] xl:grid-cols-[minmax(0,1fr)_380px]">
        <div className="min-w-0 space-y-6">
          <div className="aspect-[16/9] w-full animate-pulse rounded-2xl bg-gray-200 dark:bg-[#303134]" />
          <div className="space-y-3">
            <div className="h-7 w-2/3 animate-pulse rounded bg-gray-200 dark:bg-[#303134]" />
            <div className="h-4 w-1/2 animate-pulse rounded bg-gray-200 dark:bg-[#303134]" />
            <div className="h-4 w-3/5 animate-pulse rounded bg-gray-200 dark:bg-[#303134]" />
          </div>
          <div className="h-12 animate-pulse rounded-xl bg-gray-100 dark:bg-[#2a2b2f]" />
          <div className="h-56 animate-pulse rounded-2xl border border-gray-200 bg-gray-100 dark:border-[#3c4043] dark:bg-[#2a2b2f]" />
        </div>
        <aside className="hidden h-96 animate-pulse rounded-2xl border border-gray-200 bg-gray-100 dark:border-[#3c4043] dark:bg-[#2a2b2f] lg:block" />
      </div>
    </main>
  );
}

import Navigation from "@/components/navigation";

export default function NavigationExamplePage() {
  return (
    <main className="flex flex-col gap-8 p-10">
      <section className="flex flex-col gap-2">
        <h2 className="text-lg font-semibold">홈 navbar</h2>
        <Navigation current="/" />
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="text-lg font-semibold">카테고리 navbar</h2>
        <Navigation current="/category" />
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="text-lg font-semibold">예매내역 navbar</h2>
        <Navigation current="/mypage/orders" />
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="text-lg font-semibold">라이브러리 navbar</h2>
        <Navigation current="/mypage/library" />
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="text-lg font-semibold">마이페이지 navbar</h2>
        <Navigation current="/mypage" />
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="text-lg font-semibold">홈 navbar (비로그인)</h2>
        <Navigation loggedIn={false} current="/" />
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="text-lg font-semibold">카테고리 navbar (비로그인)</h2>
        <Navigation loggedIn={false} current="/category" />
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="text-lg font-semibold">검색 navbar (비로그인)</h2>
        <Navigation loggedIn={false} current="/search" />
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="text-lg font-semibold">로그인 navbar (비로그인)</h2>
        <Navigation loggedIn={false} current="/login" />
      </section>
    </main>
  );
}

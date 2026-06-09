import Header from "@/components/header";
import RoleHeader from "@/components/roleHeader";

export default function HeaderExamplePage() {
  return (
    <main className="flex flex-col gap-8 py-10">
      <section className="flex flex-col gap-2">
        <h2 className="px-10 text-lg font-semibold">판매자 헤더</h2>
        <RoleHeader role="seller" />
      </section>
      <section className="flex flex-col gap-2">
        <h2 className="px-10 text-lg font-semibold">관리자 헤더</h2>
        <RoleHeader role="admin" />
      </section>
      <section className="flex flex-col gap-2">
        <h2 className="px-10 text-lg font-semibold">헤더</h2>
        <Header />
      </section>
      <section className="flex flex-col gap-2">
        <h2 className="text-lg font-semibold">로그인 navbar (비로그인)</h2>
        <Header loggedIn={true} showCategory={false} />
      </section>
    </main>
  );
}

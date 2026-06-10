import Profile from "@/components/Profile";

export default function ProfileExamplePage() {
  return (
    <main className="flex flex-col gap-10 p-6 md:p-10">
      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold">프로필</h2>

        <div className="w-64 rounded-2xl border border-primary-200 bg-white p-4">
          <Profile name="멋사님" email="moetsa@gmail.com" role="구매자" />
        </div>
        <div className="w-64 rounded-2xl border border-primary-200 bg-white p-4">
          <Profile name="멋사님" email="moetsa@gmail.com" role="판매자" />
        </div>
        <div className="w-64 rounded-2xl border border-primary-200 bg-white p-4">
          <Profile name="멋사님" email="moetsa@gmail.com" />
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold">햄버거 메뉴 프로필</h2>

        <div className="w-64 rounded-2xl border border-primary-200 bg-white p-4">
          <Profile direction="row" name="관리자" email="admin@tiki.com" />
        </div>

        <div className="w-64 rounded-2xl border border-primary-200 bg-white p-4">
          <Profile direction="row" name="판매자명" email="seller@tiki.com" />
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold">친구 추가 미리보기</h2>

        <div className="w-72 rounded-2xl border border-primary-200 bg-white p-4">
          <Profile direction="row" name="사자" email="lion@example.com" />
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold">친구 목록</h2>

        <div className="flex w-72 flex-col gap-3 rounded-2xl border border-primary-200 bg-white p-4">
          <Profile
            direction="row"
            name="멋사1"
            email="ms1@example.com"
            meetCount={5}
          />
          <Profile
            direction="row"
            name="멋사2"
            email="ms2@example.com"
            meetCount={3}
          />
          <Profile
            direction="row"
            name="멋사3"
            email="ms3@example.com"
            meetCount={3}
          />
        </div>
      </section>
    </main>
  );
}

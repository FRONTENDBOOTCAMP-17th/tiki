import { Input } from "@/components/Input";
import Button from "@/components/Button";

// 더미 데이터 (나중에 Supabase 현재 유저 조회로 교체)
const user = {
  name: "티키",
  email: "tiki@gmail.com",
  phone: "010-1234-5678",
  joinedAt: "2026.01.15",
};

async function updateProfile(formData: FormData) {
  "use server";
  const name = formData.get("name");
  const phone = formData.get("phone");
  // TODO: Supabase update
  console.log({ name, phone });
}

export default function ProfilePage() {
  return (
    <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm md:p-8">
      <h1 className="mb-6 text-xl font-bold text-gray-900">프로필 정보</h1>

      {/* 입력칸이 카드 폭 따라감 */}
      <form action={updateProfile} className="flex flex-col gap-5">
        <div className="flex flex-col items-center gap-2">
          <div className="size-20 rounded-full bg-gradient-to-br from-primary-300 to-secondary-300" />
          <button type="button" className="text-sm text-primary-600">사진 변경</button>
          <p className="text-xs text-gray-400">JPG, PNG 5MB 이하</p>
        </div>

        <Input label="이름" name="name" defaultValue={user.name} />
        <Input label="이메일" name="email" defaultValue={user.email} disabled />
        <Input label="연락처" name="phone" defaultValue={user.phone} />
        <Input label="가입일" name="joinedAt" defaultValue={user.joinedAt} disabled />

        <div className="flex gap-2 pt-2">
          <Button type="button" variant="outlinePrimary" fullWidth>취소</Button>
          <Button type="submit" fullWidth>저장</Button>
        </div>
      </form>
    </section>
  );
}
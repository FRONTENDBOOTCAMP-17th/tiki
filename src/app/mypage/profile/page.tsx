import { Input } from "@/components/Input";
import Button from "@/components/Button";
import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import AvatarUpload from "@/components/mypage/AvatarUpload";

async function updateProfile(formData: FormData) {
  "use server";
  const user = await requireUser();
  const supabase = await createClient();

  const name = String(formData.get("name") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();

  await supabase
    .from("users")
    .update({ name, phone: phone || null })
    .eq("id", user.id);

  revalidatePath("/mypage/profile");
}

export default async function ProfilePage() {
  const user = await requireUser();
  const supabase = await createClient();

  const { data: account } = await supabase
    .from("users")
    .select("name, email, phone, created_at, avatar_url")
    .eq("id", user.id)
    .single();

  const joinedAt = account?.created_at
    ? new Date(account.created_at).toLocaleDateString("ko-KR")
    : "-";

  return (
    <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm dark:border-surface-3 dark:bg-surface-1 md:p-8">
      <h1 className="mb-6 text-xl font-bold text-gray-900 dark:text-gray-50">
        프로필 정보
      </h1>

      <form action={updateProfile} className="flex flex-col gap-5">
        <div className="flex flex-col items-center gap-2">
          <AvatarUpload initialUrl={account?.avatar_url ?? null} />
        </div>

        <Input label="이름" name="name" defaultValue={account?.name ?? ""} />
        <Input
          label="이메일"
          name="email"
          defaultValue={account?.email ?? ""}
          disabled
        />
        <Input
          label="연락처"
          name="phone"
          defaultValue={account?.phone ?? ""}
        />
        <Input
          label="가입일"
          name="joinedAt"
          defaultValue={joinedAt}
          disabled
        />

        <div className="flex gap-2 pt-2">
          <Button type="reset" variant="outlinePrimary" fullWidth>
            취소
          </Button>
          <Button type="submit" fullWidth>
            저장
          </Button>
        </div>
      </form>
    </section>
  );
}

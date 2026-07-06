import { redirect } from "next/navigation";

export const metadata = {
  title: "개인정보 처리방침 | TiKi",
};

export default function PrivacyPage() {
  redirect("/info/privacy");
}

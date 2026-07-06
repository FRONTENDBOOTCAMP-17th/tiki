import { redirect } from "next/navigation";

export const metadata = {
  title: "서비스 이용약관 | TiKi",
};

export default function TermsPage() {
  redirect("/info/terms");
}

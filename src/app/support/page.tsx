import { redirect } from "next/navigation";

export const metadata = { title: "고객센터 | TiKi" };

export default function SupportPage() {
  redirect("/info/contact");
}

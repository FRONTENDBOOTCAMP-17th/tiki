import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import StoreInfoForm from "./_components/StoreInfoForm";

export default async function StoreInfoPage() {
  const user = await requireUser();
  const supabase = await createClient();

  const { data: store } = await supabase
    .from("seller_stores")
    .select("*")
    .eq("user_id", user.id)
    .single();

  const { data: profile } = await supabase
    .from("seller_profiles")
    .select("store_name")
    .eq("id", user.id)
    .single();

  return (
    <StoreInfoForm
      store={store}
      storeName={profile?.store_name ?? ""}
      userEmail={user.email ?? ""}
    />
  );
}

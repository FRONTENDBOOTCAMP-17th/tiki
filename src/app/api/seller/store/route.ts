import { fail, success } from "@/lib/api/api-response";
import { createClient } from "@/lib/supabase/server";
import { TablesUpdate } from "@/types/database";
import { NextRequest } from "next/server";

export async function PATCH(req: NextRequest) {
  const body = await req.json();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return fail("unauthorized", 401);
  }

  if (body.storeName !== undefined) {
    const { error } = await supabase
      .from("seller_profiles")
      .update({ store_name: body.storeName })
      .eq("id", user.id);
    if (error) {
      return fail(error.message);
    }
  }

  const fields: TablesUpdate<"seller_stores"> = {};
  if (body.businessNumber !== undefined) {
    fields.business_number = body.businessNumber;
  }
  if (body.description !== undefined) {
    fields.description = body.description;
  }
  if (body.email !== undefined) {
    fields.email = body.email;
  }
  if (body.phone !== undefined) {
    fields.phone = body.phone;
  }
  if (body.address !== undefined) {
    fields.address = body.address;
  }
  if (body.bankName !== undefined) {
    fields.bank_name = body.bankName;
  }
  if (body.bankAccountNumber !== undefined) {
    fields.bank_account_number = body.bankAccountNumber;
  }
  if (body.bankHolderName !== undefined) {
    fields.bank_holder_name = body.bankHolderName;
  }

  if (Object.keys(fields).length > 0) {
    const { error } = await supabase
      .from("seller_stores")
      .update(fields)
      .eq("user_id", user.id);
    if (error) {
      return fail(error.message);
    }
  }

  return success(null, "updated");
}

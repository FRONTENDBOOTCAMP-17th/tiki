import { fail, success } from "@/lib/api/api-response";
import { requireUserApi } from "@/lib/api/require-user";
import { TablesUpdate } from "@/types/database";
import { NextRequest } from "next/server";

interface StoreRequestBody {
  storeName?: unknown;
  businessNumber?: unknown;
  description?: unknown;
  email?: unknown;
  phone?: unknown;
  address?: unknown;
  bankName?: unknown;
  bankAccountNumber?: unknown;
  bankHolderName?: unknown;
}

function toText(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

export async function PATCH(req: NextRequest) {
  const body = (await req.json()) as StoreRequestBody;

  const ctx = await requireUserApi();
  if ("error" in ctx) return ctx.error;
  const { user, supabase } = ctx;

  if (body.storeName !== undefined) {
    const { error } = await supabase
      .from("seller_profiles")
      .update({ store_name: toText(body.storeName) })
      .eq("id", user.id);
    if (error) {
      return fail("store_profile_update_failed", 500);
    }
  }

  const fields: TablesUpdate<"seller_stores"> = {};

  if (body.businessNumber !== undefined) {
    const digits = toText(body.businessNumber).replace(/\D/g, "");
    if (digits.length !== 10) return fail("invalid_business_number");
    fields.business_number = digits;
  }
  if (body.bankAccountNumber !== undefined) {
    const digits = toText(body.bankAccountNumber).replace(/\D/g, "");
    if (!/^\d{10,16}$/.test(digits)) {
      return fail("invalid_bank_account");
    }
    fields.bank_account_number = digits;
  }

  if (body.description !== undefined) {
    fields.description = toText(body.description);
  }
  if (body.email !== undefined) {
    fields.email = toText(body.email);
  }
  if (body.phone !== undefined) {
    fields.phone = toText(body.phone);
  }
  if (body.address !== undefined) {
    fields.address = toText(body.address);
  }
  if (body.bankName !== undefined) {
    fields.bank_name = toText(body.bankName);
  }
  if (body.bankHolderName !== undefined) {
    fields.bank_holder_name = toText(body.bankHolderName);
  }

  if (Object.keys(fields).length > 0) {
    const { error } = await supabase
      .from("seller_stores")
      .update(fields)
      .eq("user_id", user.id);
    if (error) {
      return fail("store_update_failed", 500);
    }
  }

  return success(null, "updated");
}

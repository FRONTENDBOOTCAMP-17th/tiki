"use server";

import { revalidatePath } from "next/cache";

export async function revalidateOpen() {
  revalidatePath("/open");
}

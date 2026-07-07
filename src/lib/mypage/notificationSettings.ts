"use server";
import { createClient } from "@/lib/supabase/server";

export interface NotificationSettings {
  friend: boolean;
  event: boolean;
  marketing: boolean;
}

const DEFAULTS: NotificationSettings = {
  friend: true,
  event: true,
  marketing: false,
};

export async function getNotificationSettings(): Promise<NotificationSettings> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return DEFAULTS;

  const { data } = await supabase
    .from("users")
    .select("notification_settings")
    .eq("id", user.id)
    .single();

  return { ...DEFAULTS, ...(data?.notification_settings ?? {}) };
}

export async function updateNotificationSettings(
  settings: Partial<NotificationSettings>,
): Promise<{ ok: boolean; settings?: NotificationSettings }> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("update_notification_settings", {
    p_settings: settings,
  });
  if (error) {
    console.error("update_notification_settings error:", error);
    return { ok: false };
  }
  return { ok: true, settings: data as NotificationSettings };
}
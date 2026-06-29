import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export async function getCurrentUser() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return user;
}

export async function isAuthenticated() {
  const user = await getCurrentUser();

  return !!user;
}

export async function requireUser(callbackUrl?: string) {
  const user = await getCurrentUser();

  if (!user) {
    const next = callbackUrl ? `?next=${encodeURIComponent(callbackUrl)}` : '';
    redirect(`/login${next}`);
  }

  return user;
}

export async function getCurrentProfile() {
  const user = await getCurrentUser();

  if (!user) {
    return null;
  }

  const supabase = await createClient();

  const { data } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single();

  return data;
}

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export interface HeaderProfile {
  name: string;
  avatarUrl: string | null;
  role: string;
}

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

export async function getHeaderProfile(): Promise<HeaderProfile | null> {
  const user = await getCurrentUser();

  if (!user) {
    return null;
  }

  const supabase = await createClient();

  const { data } = await supabase
    .from('users')
    .select('name, avatar_url, role')
    .eq('id', user.id)
    .single();

  return {
    name: data?.name ?? '',
    avatarUrl: data?.avatar_url ?? null,
    role: data?.role ?? 'buyer',
  };
}

export async function requireAdmin() {
  const profile = await getCurrentProfile();
  if (!profile || profile.role !== 'admin') {
    throw new Error('관리자 권한이 필요합니다.');
  }
  return profile;
}

'use server';

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export const signInWithOAuth = async (provider: 'google' | 'kakao') => {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
    },
  });

  if (error) {
    throw error;
  }

  redirect(data.url);
};

export const signInWithEmail = async (formData: FormData) => {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    throw error;
  }

  redirect('/');
};

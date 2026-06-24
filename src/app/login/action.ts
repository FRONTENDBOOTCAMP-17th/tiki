'use server';

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { SignInState } from '@/types/api/auth';

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

export const signInWithEmail = async (
  prevState: SignInState,
  formData: FormData,
): Promise<SignInState> => {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  if (!email) {
    return {
      success: false,
      error: 'empty_email',
    };
  }

  if (!password) {
    return {
      success: false,
      error: 'empty_password',
    };
  }

  const supabase = await createClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  //missing email or phone
  //Invalid login credentials
  if (error) {
    return {
      success: false,
      error: 'invalid_credentials',
    };
  }

  if (user) {
    const { data } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();
    switch (data!.role) {
      case 'admin':
        redirect('/admin');
      case 'seller':
        redirect('/seller');
      default:
        redirect('/');
    }
  }

  return {
    success: false,
    error: 'unknown_error',
  };
};

'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

/**
 * 클라이언트 컴포넌트에서 로그인 여부를 확인하는 훅.
 * 최초 마운트 시 현재 세션을 조회하고, 이후 로그인/로그아웃 변화를 구독해 갱신한다.
 */
export default function useAuthStatus() {
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    let ignore = false;

    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!ignore) setLoggedIn(!!user);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!ignore) setLoggedIn(!!session?.user);
    });

    return () => {
      ignore = true;
      subscription.unsubscribe();
    };
  }, []);

  return loggedIn;
}

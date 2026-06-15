'use client';

import { createClient } from '@/lib/supabase/client';

// 지원할 소셜 로그인 목록 (버튼 추가/삭제가 쉽도록 배열로)
const providers = [
  {
    id: 'google',
    label: 'Google로 시작하기',
    color: 'bg-red-500 hover:bg-red-600 text-white',
  },
  {
    id: 'kakao',
    label: '카카오로 시작하기',
    color: 'bg-yellow-400 hover:bg-yellow-500 text-black',
  },
  {
    id: 'facebook',
    label: 'Facebook으로 시작하기',
    color: 'bg-blue-600 hover:bg-blue-700 text-white',
  },
] as const;

export default function LoginPage() {
  const supabase = createClient();

  // 소셜 로그인 버튼을 누르면 실행됩니다.
  async function signIn(provider: 'google' | 'kakao' | 'facebook') {
    await supabase.auth.signInWithOAuth({
      provider,
      options: {
        // 로그인 성공 후 소셜 제공자가 우리 사이트의 이 주소로 다시 보내줍니다.
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  }

  return (
    <main className='flex min-h-screen flex-col items-center justify-center gap-8 bg-gray-50 p-6'>
      <div className='w-full max-w-sm space-y-6 rounded-2xl bg-white p-8 shadow-lg'>
        <div className='text-center'>
          <h1 className='text-2xl font-bold text-gray-900'>소셜 로그인 예제</h1>
          <p className='mt-2 text-sm text-gray-500'>
            아래 버튼으로 간편하게 로그인하세요
          </p>
        </div>

        <div className='space-y-3'>
          {providers.map((p) => (
            <button
              key={p.id}
              onClick={() => signIn(p.id)}
              className={`w-full rounded-lg px-4 py-3 font-medium transition ${p.color}`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>
    </main>
  );
}

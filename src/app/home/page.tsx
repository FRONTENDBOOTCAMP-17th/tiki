import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase.server';
import { logout } from '../action';

export default async function Home() {
  const supabase = await createClient();

  // 현재 로그인한 사용자 정보를 가져옵니다.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 로그인하지 않았으면 로그인 페이지로 보냅니다.
  if (!user) {
    redirect('/login');
  }

  // 이번 로그인에 사용한 provider = 가장 최근에 로그인한 identity.
  // (Supabase 는 같은 이메일을 한 계정으로 합치므로, "이번에 누른 버튼"은
  //  identity 들의 last_sign_in_at 중 가장 최신 값으로 알아냅니다.)
  const identities = user.identities ?? [];
  const currentProvider =
    [...identities].sort((a, b) =>
      (b.last_sign_in_at ?? '').localeCompare(a.last_sign_in_at ?? ''),
    )[0]?.provider ?? user.app_metadata.provider;

  return (
    <main className='flex min-h-screen flex-col items-center justify-center gap-6 bg-gray-50 p-6'>
      <div className='w-full max-w-md space-y-6 rounded-2xl bg-white p-8 shadow-lg'>
        <h1 className='text-2xl font-bold text-gray-900'>로그인 성공! 🎉</h1>

        <dl className='space-y-2 text-sm'>
          <div className='flex justify-between border-b pb-2'>
            <dt className='text-gray-500'>이메일</dt>
            <dd className='font-medium text-gray-900'>
              {user.email ?? '(없음)'}
            </dd>
          </div>
          <div className='flex justify-between border-b pb-2'>
            <dt className='text-gray-500'>로그인 방법</dt>
            <dd className='font-medium text-gray-900'>{currentProvider}</dd>
          </div>
          <div className='flex justify-between'>
            <dt className='text-gray-500'>사용자 ID</dt>
            <dd className='font-mono text-xs text-gray-700'>{user.id}</dd>
          </div>
        </dl>

        {/* form 의 action 으로 서버 함수(logout)를 직접 연결할 수 있습니다 */}
        <form action={logout}>
          <button
            type='submit'
            className='w-full rounded-lg bg-gray-900 px-4 py-3 font-medium text-white transition hover:bg-gray-700'
          >
            로그아웃
          </button>
        </form>
      </div>
    </main>
  );
}

import Link from 'next/link';
import OAuthContainer from '@/components/OAuthContainer';
import EmailAuthContainer from '@/components/EmailAuthContainer';
import Logo from '@/components/Logo';
import { signInWithEmail, signInWithOAuth } from './action';
import { ChevronLeft } from 'lucide-react';

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;
  const safeNext =
    next && next.startsWith('/') && !next.startsWith('//') ? next : undefined;

  const googleAction = signInWithOAuth.bind(null, 'google', safeNext);
  const kakaoAction = signInWithOAuth.bind(null, 'kakao', safeNext);
  return (
    <main className='flex min-h-screen flex-col items-center justify-center bg-linear-to-br from-primary-100 to-secondary-100 px-4 py-12 dark:bg-none dark:bg-[#202124]'>
      <div className='w-full max-w-md md:max-w-lg'>
        <Link
          href='/'
          className='mb-4 inline-flex items-center gap-1 text-sm font-medium text-primary-800/80 transition-colors hover:text-primary-900 dark:text-gray-400 dark:hover:text-gray-200'
        >
          <ChevronLeft className='h-4 w-4' />
          홈으로
        </Link>

        <div className='w-full space-y-7 rounded-3xl bg-white px-8 py-8 shadow-xl shadow-primary-900/5 ring-1 ring-black/5 sm:px-12 sm:py-10 dark:bg-[#2a2b2f] dark:shadow-none dark:ring-white/10'>
          <div className='space-y-2 text-center'>
            <div className='text-primary-700 dark:text-gray-100'>
              <Logo color='currentColor' className='mx-auto h-9 w-auto' />
            </div>
            <p className='text-sm text-gray-500 dark:text-gray-400'>
              로그인하고 티켓의 설렘을 이어가세요
            </p>
          </div>

          <OAuthContainer googleSignin={googleAction} kakaoSignin={kakaoAction} />

          <div className='flex items-center gap-3 text-sm text-gray-400 dark:text-gray-500'>
            <span className='h-px flex-1 bg-gray-200 dark:bg-[#3c4043]' />
            또는
            <span className='h-px flex-1 bg-gray-200 dark:bg-[#3c4043]' />
          </div>

          <EmailAuthContainer emailSignin={signInWithEmail} next={safeNext} />

          <p className='text-center text-sm text-gray-500 dark:text-gray-400'>
            계정이 없으신가요?{' '}
            <Link
              href='/join'
              className='font-medium text-primary-700 underline underline-offset-2 transition-colors hover:text-primary-800 dark:text-gray-100 dark:hover:text-white'
            >
              회원가입
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}

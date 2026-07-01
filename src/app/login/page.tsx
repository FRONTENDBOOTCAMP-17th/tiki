import Link from 'next/link';
import OAuthContainer from '@/components/OAuthContainer';
import EmailAuthContainer from '@/components/EmailAuthContainer';
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
    <main className='flex min-h-screen flex-col items-center bg-gradient-to-br from-primary-100 to-secondary-100 dark:bg-none dark:bg-[#202124]'>
      <header className='flex w-full border-b-2 border-primary-300 p-4 dark:border-[#3c4043] md:border-0'>
        <div className='mx-auto justify-self-center text-lg font-semibold text-primary-900 dark:text-gray-100 md:pt-16 md:text-3xl lg:pt-24 lg:text-5xl'>
          로그인
        </div>
      </header>
      <div className='flex w-full flex-1 items-center justify-center px-4 py-10'>
        <div className='reative w-full max-w-sm space-y-6 rounded-2xl bg-white p-8 shadow-lg dark:border dark:border-[#3c4043] dark:bg-[#2a2b2f] dark:shadow-none md:max-w-md'>
          <Link
            href='/'
            className='absolute flex translate-y-2 gap-1 font-semibold text-primary-900 hover:text-primary-700 dark:text-gray-200 dark:hover:text-white'
          >
            <ChevronLeft />홈
          </Link>
          <h1 className='text-center text-3xl font-extrabold text-primary-700 dark:text-gray-100'>
            tiki
          </h1>
          <OAuthContainer
            googleSignin={googleAction}
            kakaoSignin={kakaoAction}
          />
          <div className='flex items-center gap-3 text-sm text-gray-400 dark:text-gray-500'>
            <span className='h-px flex-1 bg-gray-200 dark:bg-[#3c4043]' />
            또는
            <span className='h-px flex-1 bg-gray-200 dark:bg-[#3c4043]' />
          </div>
          <EmailAuthContainer emailSignin={signInWithEmail} next={safeNext} />
          <div className='text-center text-sm text-gray-500 dark:text-gray-400 md:hidden'>
            <span
              className='cursor-not-allowed text-gray-300 dark:text-gray-600'
              title='준비 중입니다'
            >
              아이디 찾기
            </span>
            <span className='mx-2 text-gray-300 dark:text-gray-600'>|</span>
            <span
              className='cursor-not-allowed text-gray-300 dark:text-gray-600'
              title='준비 중입니다'
            >
              비밀번호 찾기
            </span>
            <span className='mx-2 text-gray-300 dark:text-gray-600'>|</span>
            <Link href='/join' className='hover:text-primary-700 dark:hover:text-white'>
              회원가입
            </Link>
          </div>
          <p className='hidden text-center text-sm text-gray-500 dark:text-gray-400 md:block'>
            계정이 없으신가요?{' '}
            <Link
              href='/join'
              className='font-medium text-primary-700 underline dark:text-gray-100'
            >
              회원가입
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}

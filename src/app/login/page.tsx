import Link from 'next/link';
import OAuthContainer from '@/components/OAuthContainer';
import EmailAuthContainer from '@/components/EmailAuthContainer';
import { signInWithEmail, signInWithOAuth } from './action';
import { ChevronLeft } from 'lucide-react';

export default function LoginPage() {
  const googleAction = signInWithOAuth.bind(null, 'google');
  const kakaoAction = signInWithOAuth.bind(null, 'kakao');
  return (
    <main className='flex min-h-screen flex-col items-center bg-gradient-to-br from-primary-100 to-secondary-100'>
      <header className='flex w-full p-4 border-b-2 border-primary-300 md:border-0'>
        <div className='mx-auto justify-self-center font-semibold text-lg text-primary-900 md:pt-16 md:text-3xl lg:text-5xl lg:pt-24'>
          로그인
        </div>
      </header>
      <div className='flex w-full flex-1 items-center justify-center px-4 py-10'>
        <div className='reative w-full max-w-sm space-y-6 rounded-2xl bg-white p-8 shadow-lg md:max-w-md'>
          <Link
            href='/'
            className='flex gap-1 font-semibold absolute text-primary-900 hover:text-primary-700 translate-y-2'
          >
            <ChevronLeft />홈
          </Link>
          <h1 className='text-center text-3xl font-extrabold text-primary-700'>
            tiki
          </h1>
          <OAuthContainer
            googleSignin={googleAction}
            kakaoSignin={kakaoAction}
          />
          <div className='flex items-center gap-3 text-sm text-gray-400'>
            <span className='h-px flex-1 bg-gray-200' />
            또는
            <span className='h-px flex-1 bg-gray-200' />
          </div>
          <EmailAuthContainer emailSignin={signInWithEmail} />
          <div className='text-center text-sm text-gray-500 md:hidden'>
            <Link href='/find-id' className='hover:text-primary-700'>
              아이디 찾기
            </Link>
            <span className='mx-2 text-gray-300'>|</span>
            <Link href='/find-password' className='hover:text-primary-700'>
              비밀번호 찾기
            </Link>
            <span className='mx-2 text-gray-300'>|</span>
            <Link href='/join' className='hover:text-primary-700'>
              회원가입
            </Link>
          </div>
          <p className='hidden text-center text-sm text-gray-500 md:block'>
            계정이 없으신가요?{' '}
            <Link
              href='/join'
              className='font-medium text-primary-700 underline'
            >
              회원가입
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}

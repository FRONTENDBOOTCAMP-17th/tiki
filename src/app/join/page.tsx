import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import SignupFormDesktopRenderer from '@/components/SignupFormDesktopRenderer';
import SignupFormMobileRenderer from '@/components/SignupFormMobileRenderer';
import SignupProvider from '@/components/SignupProvider';
import TitleStepHeader from '@/components/TitleStepHeader';

export default function JoinPage() {
  return (
    <main className='flex min-h-screen flex-col items-center bg-gradient-to-br from-primary-100 to-secondary-100'>
      <SignupProvider>
        <TitleStepHeader title='회원가입' maxStep={4} />
        <div className='flex w-full flex-1 items-center justify-center px-4 py-10'>
          <div className='relative w-full max-w-sm space-y-6 rounded-2xl bg-white p-6 shadow-lg md:max-w-2xl md:p-8'>
            <Link
              href='/'
              className='flex items-center gap-1 font-semibold text-primary-900 hover:text-primary-700'
            >
              <ChevronLeft />홈
            </Link>
            <h1 className='hidden text-center text-3xl font-extrabold text-primary-700 md:block'>
              tiki
            </h1>
            <div className='md:hidden'>
              <SignupFormMobileRenderer />
            </div>
            <div className='hidden md:block'>
              <SignupFormDesktopRenderer />
            </div>
          </div>
        </div>
      </SignupProvider>
    </main>
  );
}

import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import SignupFormDesktopRenderer from '@/components/SignupFormDesktopRenderer';
import SignupFormMobileRenderer from '@/components/SignupFormMobileRenderer';
import SignupProvider from '@/components/SignupProvider';
import TitleStepHeader from '@/components/TitleStepHeader';

export default function JoinPage() {
  return (
    <main className='flex min-h-screen flex-col items-center bg-linear-to-br from-primary-100 to-secondary-100 px-4 py-12 dark:bg-none dark:bg-[#202124]'>
      <SignupProvider>
        <div className='w-full max-w-md md:max-w-2xl'>
          <Link
            href='/'
            className='mb-4 inline-flex items-center gap-1 text-sm font-medium text-primary-800/80 transition-colors hover:text-primary-900 dark:text-gray-400 dark:hover:text-gray-200'
          >
            <ChevronLeft className='h-4 w-4' />
            홈으로
          </Link>

          <div className='w-full space-y-6 rounded-3xl bg-white px-8 py-10 shadow-xl shadow-primary-900/5 ring-1 ring-black/5 md:px-12 md:py-10 dark:bg-[#2a2b2f] dark:shadow-none dark:ring-white/10'>
            <TitleStepHeader subtitle='몇 가지만 입력하면 가입이 완료돼요' maxStep={3} />

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

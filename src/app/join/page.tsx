import SignupFormDesktopRenderer from '@/components/SignupFormDesktopRenderer';
import SignupFormMobileRenderer from '@/components/SignupFormMobileRenderer';
import SignupProvider from '@/components/SignupProvider';
import TitleStepHeader from '@/components/TitleStepHeader';

export default function JoinPage() {
  return (
    <main>
      <SignupProvider>
        <TitleStepHeader title='회원가입' maxStep={4} />
        <div className='md:hidden'>
          <SignupFormMobileRenderer />
        </div>
        <div className='hidden md:block'>
          <SignupFormDesktopRenderer />
        </div>
      </SignupProvider>
    </main>
  );
}

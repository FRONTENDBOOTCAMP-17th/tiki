'use client';

import useSignup from '@/hooks/useSignup';

export default function TitleStepHeader({
  title,
  maxStep,
}: {
  title: string;
  maxStep?: number;
}) {
  const { step } = useSignup();
  return (
    <header className='flex w-full p-4 border-b-2 border-primary-100 md:border-0'>
      <div className='ml-auto justify-self-center font-semibold text-lg text-primary-900 md:mx-auto md:pt-16 md:text-3xl lg:text-5xl lg:pt-24'>
        {title}
      </div>
      {maxStep ? (
        <div className='ml-auto mr-12 text-sm text-primary-800 self-center md:hidden'>
          {step}/{maxStep}
        </div>
      ) : (
        ''
      )}
    </header>
  );
}

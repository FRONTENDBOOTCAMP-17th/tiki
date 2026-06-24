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
    <header className='grid w-full grid-cols-[1fr_auto_1fr] items-center p-4 border-b-2 border-primary-300 md:border-0'>
      <div />
      <div className='justify-self-center font-semibold text-lg text-primary-900 md:pt-16 md:text-3xl lg:text-5xl lg:pt-24'>
        {title}
      </div>
      {maxStep ? (
        <div className='justify-self-end text-sm text-primary-800 md:hidden'>
          {step}/{maxStep}
        </div>
      ) : (
        <div />
      )}
    </header>
  );
}

'use client';

import Logo from '@/components/Logo';
import useSignup from '@/hooks/useSignup';

// 회원가입 카드 상단 브랜딩(로그인 카드와 동일한 톤). 모바일에서는 현재 단계도 함께 보여준다.
export default function TitleStepHeader({
  subtitle,
  maxStep,
}: {
  subtitle?: string;
  maxStep?: number;
}) {
  const { step } = useSignup();
  return (
    <div className='space-y-2 text-center'>
      {maxStep ? (
        <p className='text-xs font-medium text-primary-700 md:hidden dark:text-primary-300'>
          {step} / {maxStep}
        </p>
      ) : null}
      <div className='text-primary-700 dark:text-gray-100'>
        <Logo color='currentColor' className='mx-auto h-9 w-auto' />
      </div>
      {subtitle ? (
        <p className='hidden text-sm text-gray-500 md:block dark:text-gray-400'>
          {subtitle}
        </p>
      ) : null}
    </div>
  );
}

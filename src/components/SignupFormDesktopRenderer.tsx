'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/cn';
import { toKoreanJoinError } from '@/lib/auth/join-errors';
import useSignup from '@/hooks/useSignup';
import useToast from '@/hooks/useToast';
import BasicInfoForm from './BasicInfoForm';
import TermsForm from './TermsForm';
import Button from './Button';

const PASSWORD_REGEX = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/;

export default function SignupFormDesktopRenderer() {
  const { signupData, setRole, passwordConfirm, terms } = useSignup();
  const toast = useToast();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const canSubmit =
    terms.use &&
    terms.privacy &&
    terms.age &&
    !!signupData.email &&
    !!signupData.password &&
    PASSWORD_REGEX.test(signupData.password) &&
    signupData.password === passwordConfirm &&
    !!signupData.name &&
    !!signupData.phone &&
    (signupData.role !== 'seller' ||
      (!!signupData.storeName && !!signupData.organizerName));

  const submitForm = async () => {
    if (signupData.password !== passwordConfirm) {
      toast.error('비밀번호가 일치하지 않습니다');
      return;
    }
    if (!PASSWORD_REGEX.test(signupData.password)) {
      toast.error('비밀번호는 영문, 숫자, 특수문자를 포함한 8자 이상이어야 합니다');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/auth/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(signupData),
      });
      const data = await res.json();
      if (data.success) {
        toast.success('가입 완료! 이메일 인증 후 로그인해주세요');
        router.push('/login');
      } else {
        toast.error(toKoreanJoinError(data.message));
      }
    } catch {
      toast.error('오류가 발생했습니다. 다시 시도해주세요');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='flex w-full flex-col items-center'>
      <form
        className='w-full max-w-xl space-y-6'
        onSubmit={(e) => { e.preventDefault(); submitForm(); }}
        noValidate
      >
        <div className='flex w-full rounded-lg overflow-hidden border border-primary-300 dark:border-surface-3'>
          <button
            type='button'
            className={cn(
              'flex-1 py-3 font-semibold text-base transition-colors',
              signupData.role === 'buyer'
                ? 'bg-primary-700 text-white'
                : 'text-primary-700 hover:bg-primary-100 dark:text-primary-300 dark:hover:bg-surface-4',
            )}
            onClick={() => setRole('buyer')}
          >
            구매자
          </button>
          <button
            type='button'
            className={cn(
              'flex-1 py-3 font-semibold text-base transition-colors',
              signupData.role === 'seller'
                ? 'bg-primary-700 text-white'
                : 'text-primary-700 hover:bg-primary-100 dark:text-primary-300 dark:hover:bg-surface-4',
            )}
            onClick={() => setRole('seller')}
          >
            판매자
          </button>
        </div>
        <BasicInfoForm />
        <TermsForm />
        <div className='space-y-4'>
          <Button
            type='submit'
            fullWidth
            loading={loading}
            disabled={!canSubmit}
          >
            {signupData.role === 'buyer' ? '구매자로 가입하기' : '판매자로 가입하기'}
          </Button>
          <p className='text-center text-sm text-gray-500 dark:text-gray-400'>
            이미 계정이 있으신가요?{' '}
            <Link
              href='/login'
              className='font-medium text-primary-700 underline underline-offset-2 transition-colors hover:text-primary-800 dark:text-gray-100 dark:hover:text-white'
            >
              로그인
            </Link>
          </p>
        </div>
      </form>
    </div>
  );
}

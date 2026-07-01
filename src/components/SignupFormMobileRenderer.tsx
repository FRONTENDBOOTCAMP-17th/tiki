'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toKoreanJoinError } from '@/lib/auth/join-errors';
import useSignup from '@/hooks/useSignup';
import useToast from '@/hooks/useToast';
import TermsForm from './TermsForm';
import RoleForm from './RoleForm';
import BasicInfoForm from './BasicInfoForm';
import Button from './Button';
import { UserRole } from '@/types/domain/user-role';

const PASSWORD_REGEX = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/;

export default function SignupFormMobileRenderer() {
  const { step, setStep, signupData, passwordConfirm, terms } = useSignup();
  const toast = useToast();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);

  const canProceedFromTerms = terms.use && terms.privacy && terms.age;

  const canProceedFromBasicInfo =
    !!signupData.email &&
    !!signupData.password &&
    !!signupData.name &&
    !!signupData.phone &&
    signupData.password === passwordConfirm &&
    PASSWORD_REGEX.test(signupData.password);

  const proceedToStep3 = () => {
    if (signupData.password !== passwordConfirm) {
      toast.error('비밀번호가 일치하지 않습니다');
      return;
    }
    if (!PASSWORD_REGEX.test(signupData.password)) {
      toast.error(
        '비밀번호는 영문, 숫자, 특수문자를 포함한 8자 이상이어야 합니다',
      );
      return;
    }
    setStep(3);
  };

  const submitForm = async () => {
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
    <div className='flex flex-col items-center py-8 gap-6'>
      {step === 1 && (
        <form
          className='w-full flex flex-col gap-6'
          onSubmit={(e) => {
            e.preventDefault();
            setStep(2);
          }}
          noValidate
        >
          <TermsForm />
          <Button type='submit' fullWidth disabled={!canProceedFromTerms}>
            다음
          </Button>
        </form>
      )}
      {step === 2 && (
        <form
          className='w-full flex flex-col gap-6'
          onSubmit={(e) => {
            e.preventDefault();
            proceedToStep3();
          }}
          noValidate
        >
          <BasicInfoForm />
          <div className='flex gap-2'>
            <Button
              type='button'
              variant='outlinePrimary'
              className='w-20 shrink-0'
              onClick={() => setStep(1)}
            >
              이전
            </Button>
            <Button type='submit' fullWidth disabled={!canProceedFromBasicInfo}>
              다음
            </Button>
          </div>
        </form>
      )}
      {step === 3 && (
        <form
          className='w-full flex flex-col gap-6'
          onSubmit={(e) => {
            e.preventDefault();
            submitForm();
          }}
          noValidate
        >
          <RoleForm selectedRole={selectedRole} onSelectRole={setSelectedRole} />
          <div className='flex gap-2'>
            <Button
              type='button'
              variant='outlinePrimary'
              className='w-20 shrink-0'
              onClick={() => setStep(2)}
            >
              이전
            </Button>
            <Button
              type='submit'
              fullWidth
              loading={loading}
              disabled={!selectedRole}
            >
              가입 완료
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}

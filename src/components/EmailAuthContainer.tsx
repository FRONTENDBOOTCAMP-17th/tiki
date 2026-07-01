'use client';

import Button from '@/components/Button';
import { Input } from '@/components/Input';
import useToast from '@/hooks/useToast';
import { SignInState } from '@/types/api/auth';
import { useActionState, useEffect } from 'react';

export default function EmailAuthContainer({
  emailSignin,
  next,
}: {
  emailSignin: (
    prevState: SignInState,
    formData: FormData,
  ) => Promise<SignInState>;
  next?: string;
}) {
  const toast = useToast();
  const [state, formAction] = useActionState(emailSignin, null);

  useEffect(() => {
    if (!state?.success) {
      switch (state?.error) {
        case 'empty_email':
          toast.error('이메일을 입력해주세요.');
          break;
        case 'empty_password':
          toast.error('비밀번호를 입력해주세요.');
          break;
        case 'invalid_credentials':
          toast.error(
            '존재하지 않는 계정 또는 이메일이나 비밀번호가 틀렸습니다.',
          );
          break;
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  return (
    <>
      <form id='email-auth' className='space-y-3' action={formAction}>
        {next && <input type='hidden' name='next' value={next} />}
        <Input
          label='이메일'
          type='email'
          name='email'
          placeholder='example@email.com'
        />
        <Input
          label='비밀번호'
          type='password'
          name='password'
          placeholder='비밀번호를 입력해주세요'
        />
      </form>

      <Button type='submit' form='email-auth' fullWidth>
        <span className='md:hidden'>로그인</span>
        <span className='hidden md:inline'>이메일로 로그인</span>
      </Button>
    </>
  );
}

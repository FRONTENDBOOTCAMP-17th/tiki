import Button from '@/components/Button';
import { Input } from '@/components/Input';

export default function EmailAuthContainer({
  emailSignin,
}: {
  emailSignin: (formData: FormData) => Promise<void>;
}) {
  return (
    <>
      <form id='email-auth' className='space-y-3' action={emailSignin}>
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

'use client';

import { Input } from './Input';
import useSignup from '@/hooks/useSignup';

const PASSWORD_REGEX = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/;

export default function BasicInfoForm() {
  const {
    signupData,
    setEmail,
    setPassword,
    setPasswordConfirm,
    setName,
    setPhone,
    setStoreName,
    setOrganizerName,
    passwordConfirm,
  } = useSignup();

  const passwordMismatch =
    passwordConfirm !== '' && signupData.password !== passwordConfirm;

  const passwordFormatError =
    signupData.password !== '' && !PASSWORD_REGEX.test(signupData.password)
      ? '영문, 숫자, 특수문자를 포함한 8자 이상이어야 합니다'
      : undefined;

  return (
    <div className='w-full max-w-190 space-y-4 md:min-w-90 md:px-0'>
      <h2 className='flex flex-col text-4xl text-[#0f0f0f] font-bold leading-12 md:hidden'>
        <span>기본 정보를</span>
        <span>입력해주세요</span>
      </h2>
      <div className='space-y-3'>
        <Input
          label='이메일'
          type='email'
          placeholder='example@email.com'
          value={signupData.email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <Input
          label='비밀번호'
          type='password'
          placeholder='영문, 숫자, 특수문자 포함 8자 이상'
          value={signupData.password}
          onChange={(e) => setPassword(e.target.value)}
          error={passwordFormatError}
          helperText={
            !passwordFormatError
              ? '영문, 숫자, 특수문자를 포함한 8자 이상'
              : undefined
          }
          required
        />
        <Input
          label='비밀번호 확인'
          type='password'
          placeholder='비밀번호를 다시 입력해주세요'
          value={passwordConfirm}
          onChange={(e) => setPasswordConfirm(e.target.value)}
          error={passwordMismatch ? '비밀번호가 일치하지 않습니다' : undefined}
          required
        />
        <Input
          label='이름'
          placeholder='이름을 입력해주세요'
          value={signupData.name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <Input
          label='전화번호'
          type='tel'
          placeholder='010-1234-5678'
          value={signupData.phone}
          onChange={(e) => setPhone(e.target.value)}
          required
        />
        {signupData.role === 'seller' && (
          <>
            <Input
              label='스토어명'
              placeholder='스토어명을 입력해주세요'
              value={signupData.storeName ?? ''}
              onChange={(e) => setStoreName(e.target.value)}
              required
            />
            <Input
              label='단체명'
              placeholder='단체명 또는 기획사명을 입력해주세요'
              value={signupData.organizerName ?? ''}
              onChange={(e) => setOrganizerName(e.target.value)}
              required
            />
          </>
        )}
      </div>
    </div>
  );
}

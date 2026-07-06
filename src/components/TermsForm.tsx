'use client';

import useSignup from '@/hooks/useSignup';
import Checkbox from './Checkbox';

export default function TermsForm() {
  const {
    terms,
    checkAll,
    toggleUse,
    togglePrivacy,
    toggleAge,
    toggleMarketing,
  } = useSignup();

  const allChecked = !Object.values(terms).includes(false);

  return (
    <div className='w-full space-y-4'>
      <div className='mb-6 space-y-1 md:hidden'>
        <h2 className='text-2xl font-bold leading-snug text-gray-900 dark:text-gray-100'>
          티키 이용약관에
          <br />
          동의해주세요
        </h2>
        <p className='text-sm text-gray-500 dark:text-gray-400'>
          서비스 이용을 위해 약관 동의가 필요해요
        </p>
      </div>

      <div className='overflow-hidden rounded-2xl border border-gray-200 dark:border-surface-3'>
        <Checkbox
          checked={allChecked}
          id='check-all'
          className='px-4 py-3.5 text-[15px] font-semibold text-gray-900 dark:text-gray-100'
          text='전체 동의'
          onChange={checkAll}
        />
        <div className='border-t border-gray-100 dark:border-surface-3' />
        <div className='flex flex-col gap-3 px-4 py-3.5'>
          <Checkbox
            checked={terms.use}
            id='check-use'
            required
            text='티키 이용약관 동의'
            onChange={toggleUse}
          />
          <Checkbox
            checked={terms.privacy}
            id='check-privacy'
            required
            text='개인정보 처리방침 동의'
            onChange={togglePrivacy}
          />
          <Checkbox
            checked={terms.age}
            id='check-age'
            required
            text='만 14세 이상 확인'
            onChange={toggleAge}
          />
          <Checkbox
            checked={terms.marketing}
            id='check-marketing'
            required={false}
            text='마케팅 정보 수신 동의'
            onChange={toggleMarketing}
          />
        </div>
      </div>
    </div>
  );
}

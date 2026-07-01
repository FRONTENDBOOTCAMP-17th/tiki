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
  return (
    <div className='w-full max-w-190 space-y-4 md:min-w-90 md:px-0'>
      <h2 className='flex flex-col text-4xl text-[#0f0f0f] font-bold leading-12 md:hidden dark:text-gray-100'>
        <span>티키 이용약관에</span>
        <span>동의해주세요</span>
      </h2>
      <p className='text-gray-500 text-md md:hidden dark:text-gray-400'>
        서비스 이용을 위해 약관 동의가 필요해요
      </p>
      <div className='flex flex-col gap-2'>
        <Checkbox
          checked={Object.values(terms).includes(false) ? false : true}
          id={'check-all'}
          className='py-4 bg-primary-200 rounded-lg dark:bg-[#34363a]'
          text={'전체 동의'}
          onChange={checkAll}
        />
        <Checkbox
          checked={terms.use}
          id={'check-use'}
          required={true}
          text={'티키 이용약관 동의'}
          onChange={toggleUse}
        />
        <Checkbox
          checked={terms.privacy}
          id={'check-privacy'}
          required={true}
          text={'개인정보 처리방침 동의'}
          onChange={togglePrivacy}
        />
        <Checkbox
          checked={terms.age}
          id={'check-age'}
          required={true}
          text={'만 14세 이상 확인'}
          onChange={toggleAge}
        />
        <Checkbox
          checked={terms.marketing}
          id={'check-marketing'}
          required={false}
          text={'마케팅 정보 수신 동의'}
          onChange={toggleMarketing}
        />
      </div>
    </div>
  );
}

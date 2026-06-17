'use client';

import Image from 'next/image';
import tiki_character from '../tiki_character.png';
import Button from './Button';
import useSignup from '@/hooks/useSignup';

export default function RoleForm() {
  const { signupData, setRole } = useSignup();

  return (
    <div className='min-w-90 w-full max-w-190 px-10 space-y-4'>
      <h2 className='flex flex-col text-4xl text-[#0f0f0f] font-bold leading-12 md:hidden'>
        <span>어떻게 티키를</span>
        <span>이용하실 건가요?</span>
      </h2>
      <p className='text-gray-500 text-md md:hidden'>
        모바일에서는 구매자 회원가입만 가능해요
      </p>
      <div className='flex gap-4 items-center justify-center my-20 md:my-0'>
        <Button
          className='h-fit border-2 flex-col md:py-2 md:w-full'
          variant={signupData.role === 'buyer' ? 'primary' : 'outlinePrimary'}
          onClick={() => setRole('buyer')}
        >
          <Image
            src={tiki_character}
            alt={'티키 캐릭터 이미지'}
            width={100}
            height={100}
            className='md:hidden'
          />
          <h3 className='font-bold'>구매자</h3>
          <div className='text-sm md:hidden'>
            <p>티켓을 사고</p>
            <p>공연을 즐기고 싶어요</p>
          </div>
        </Button>
        <Button
          className='hidden h-fit border-2 flex-col md:py-2 md:w-full md:inline-flex'
          variant={signupData.role === 'seller' ? 'primary' : 'outlinePrimary'}
          onClick={() => setRole('seller')}
        >
          <h3 className='font-bold'>판매자</h3>
        </Button>
      </div>
    </div>
  );
}

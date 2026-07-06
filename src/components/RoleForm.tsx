'use client';

import { useEffect, useRef } from 'react';
import Button from './Button';
import useSignup from '@/hooks/useSignup';
import TikiCharacterIcon from './icons/TikiCharacterIcon';
import { UserRole } from '@/types/domain/user-role';

const BASE_ROLE_BUTTON_CLASS = 'h-fit border-2 flex-col gap-2 md:py-2 md:w-full';
const UNSELECTED_ROLE_BUTTON_CLASS =
  'border-primary-300 text-primary-700 hover:bg-primary-100 dark:border-surface-3 dark:text-primary-300 dark:hover:bg-surface-4';
const SELECTED_ROLE_BUTTON_CLASS =
  'border-primary-700 bg-primary-700 text-white hover:bg-primary-700 hover:text-white';

export default function RoleForm({
  selectedRole,
  onSelectRole,
}: {
  selectedRole: UserRole | null;
  onSelectRole: (role: UserRole | null) => void;
}) {
  const { setRole } = useSignup();
  const buyerRef = useRef<HTMLButtonElement>(null);
  const sellerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      const target = event.target as Node;
      if (selectedRole === 'buyer' && !buyerRef.current?.contains(target)) {
        onSelectRole(null);
      }
      if (selectedRole === 'seller' && !sellerRef.current?.contains(target)) {
        onSelectRole(null);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [selectedRole, onSelectRole]);

  const selectRole = (role: UserRole) => {
    if (selectedRole === role) {
      onSelectRole(null);
      return;
    }
    setRole(role);
    onSelectRole(role);
  };

  return (
    <div className='w-full max-w-190 space-y-4 md:min-w-90'>
      <h2 className='text-2xl font-bold leading-snug text-gray-900 md:hidden dark:text-gray-100'>
        어떻게 티키를
        <br />
        이용하실 건가요?
      </h2>
      <p className='text-sm text-gray-500 md:hidden dark:text-gray-400'>
        모바일에서는 구매자 회원가입만 가능해요
      </p>
      <div className='flex gap-4 items-center justify-center my-20 md:my-0'>
        <Button
          ref={buyerRef}
          className={`${BASE_ROLE_BUTTON_CLASS} ${
            selectedRole === 'buyer'
              ? SELECTED_ROLE_BUTTON_CLASS
              : UNSELECTED_ROLE_BUTTON_CLASS
          }`}
          variant='outlinePrimary'
          onClick={() => selectRole('buyer')}
        >
          <TikiCharacterIcon className='size-24 md:hidden' />
          <h3 className='font-bold'>구매자</h3>
          <div className='text-sm md:hidden'>
            <p>티켓을 사고</p>
            <p>공연을 즐기고 싶어요</p>
          </div>
        </Button>
        <Button
          ref={sellerRef}
          className={`hidden md:inline-flex ${BASE_ROLE_BUTTON_CLASS} ${
            selectedRole === 'seller'
              ? SELECTED_ROLE_BUTTON_CLASS
              : UNSELECTED_ROLE_BUTTON_CLASS
          }`}
          variant='outlinePrimary'
          onClick={() => selectRole('seller')}
        >
          <h3 className='font-bold'>판매자</h3>
        </Button>
      </div>
    </div>
  );
}

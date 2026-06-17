'use client';

import { useContext } from 'react';
import { SignupContext } from '@/components/SignupProvider';

export default function useSignup() {
  const context = useContext(SignupContext);

  if (!context) {
    throw new Error(
      'useSignup 훅은 ToastProvider 내부에서만 사용할 수 있습니다.',
    );
  }

  return context;
}

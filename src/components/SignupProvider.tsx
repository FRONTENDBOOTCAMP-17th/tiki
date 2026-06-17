'use client';

import { JoinRequest, SignupContextValue } from '@/types/api/auth';
import { UserRole } from '@/types/domain/user-role';
import { createContext, useState } from 'react';

const SignupContext = createContext<SignupContextValue | null>(null);

export default function SignupProvider({
  children,
}: {
  children?: React.ReactNode;
}) {
  const [step, setStep] = useState(1);
  const [signupData, setSignupData] = useState<JoinRequest>({
    email: '',
    password: '',
    name: '',
    phone: '',
    role: 'buyer',
    organizerName: '',
    storeName: '',
  });

  const setEmail = (email: string) => {
    setSignupData((prev) => {
      return { ...prev, email };
    });
  };

  const setPassword = (password: string) => {
    setSignupData((prev) => {
      return { ...prev, password };
    });
  };

  const setName = (name: string) => {
    setSignupData((prev) => {
      return { ...prev, name };
    });
  };

  const setPhone = (phone: string) => {
    setSignupData((prev) => {
      return { ...prev, phone };
    });
  };

  const setRole = (role: UserRole) => {
    setSignupData((prev) => {
      return { ...prev, role };
    });
  };

  const setOrganizerName = (organizerName: string) => {
    setSignupData((prev) => {
      return { ...prev, organizerName };
    });
  };

  const setStoreName = (storeName: string) => {
    setSignupData((prev) => {
      return { ...prev, storeName };
    });
  };

  return (
    <SignupContext.Provider
      value={{
        setEmail,
        setPassword,
        setName,
        setPhone,
        setRole,
        setOrganizerName,
        setStoreName,
        setStep,
        step,
        signupData,
      }}
    >
      {children}
    </SignupContext.Provider>
  );
}

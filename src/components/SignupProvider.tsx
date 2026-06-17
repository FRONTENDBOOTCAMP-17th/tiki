'use client';

import { JoinRequest, SignupContextValue } from '@/types/api/auth';
import { UserRole } from '@/types/domain/user-role';
import { createContext, useState } from 'react';

export const SignupContext = createContext<SignupContextValue | null>(null);

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
  const [passwordConfirm, setPasswordConfirmState] = useState('');
  const [terms, setTerms] = useState({
    use: false,
    privacy: false,
    age: false,
    marketing: false,
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

  const setPasswordConfirm = (value: string) => {
    setPasswordConfirmState(value);
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

  const checkAll = () => {
    if (Object.values(terms).includes(false)) {
      setTerms({ use: true, privacy: true, age: true, marketing: true });
    } else {
      setTerms((prev) => {
        return {
          use: !prev.use,
          privacy: !prev.privacy,
          age: !prev.age,
          marketing: !prev.marketing,
        };
      });
    }
  };
  const toggleUse = () => {
    setTerms((prev) => {
      return { ...prev, use: !prev.use };
    });
  };
  const togglePrivacy = () => {
    setTerms((prev) => {
      return { ...prev, privacy: !prev.privacy };
    });
  };
  const toggleAge = () => {
    setTerms((prev) => {
      return { ...prev, age: !prev.age };
    });
  };
  const toggleMarketing = () => {
    setTerms((prev) => {
      return { ...prev, marketing: !prev.marketing };
    });
  };

  return (
    <SignupContext.Provider
      value={{
        setEmail,
        setPassword,
        setPasswordConfirm,
        setName,
        setPhone,
        setRole,
        setOrganizerName,
        setStoreName,
        setStep,
        step,
        signupData,
        passwordConfirm,
        terms,
        checkAll,
        toggleUse,
        togglePrivacy,
        toggleAge,
        toggleMarketing,
      }}
    >
      {children}
    </SignupContext.Provider>
  );
}

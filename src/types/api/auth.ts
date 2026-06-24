import { UserRole } from '@/types/domain/user-role';
import { User } from '../domain/user';
import { ApiResponse } from './common';
import { Dispatch, SetStateAction } from 'react';

export interface JoinRequest {
  email: string;
  password: string;
  name: string;
  phone: string;
  role: UserRole;
  organizerName?: string;
  storeName?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export type JoinResponse = ApiResponse<null>;
export type UserInfoResponse = ApiResponse<User>;

export interface SignupContextValue {
  setEmail: (email: string) => void;
  setPassword: (password: string) => void;
  setPasswordConfirm: (value: string) => void;
  setName: (name: string) => void;
  setPhone: (phone: string) => void;
  setRole: (role: UserRole) => void;
  setOrganizerName: (organizerName: string) => void;
  setStoreName: (storeName: string) => void;
  setStep: Dispatch<SetStateAction<number>>;
  step: number;
  signupData: JoinRequest;
  passwordConfirm: string;
  terms: { use: boolean; privacy: boolean; age: boolean; marketing: boolean };
  checkAll: () => void;
  toggleUse: () => void;
  togglePrivacy: () => void;
  toggleAge: () => void;
  toggleMarketing: () => void;
}

export type SignInState = {
  success: boolean;
  error: string | null;
} | null;

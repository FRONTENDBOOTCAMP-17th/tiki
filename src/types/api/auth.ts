import { UserRole } from '@/types/domain/user-role';
import { ApiResponse } from './common';
import { User } from '@supabase/supabase-js';

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

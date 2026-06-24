import { UserRole } from './user-role';

export interface User {
  id: string;
  email: string;
  name: string;
  phone: string;
  role: UserRole;
}

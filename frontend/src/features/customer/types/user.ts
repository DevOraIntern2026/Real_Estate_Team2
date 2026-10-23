export type UserRole = 'customer' | 'owner' | 'agent' | 'admin';
export type Gender = 'male' | 'female';

export interface User {
  _id: string;
  name: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  phoneCode?: string;
  gender?: Gender;
  location: string;
  bio: string;
  licenseNumber?: string;
  agencyName?: string;
  role: UserRole;
  avatar?: string;
}

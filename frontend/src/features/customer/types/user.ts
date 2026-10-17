export type UserRole = 'customer' | 'owner' | 'agent' | 'admin';
export type Gender = 'male' | 'female';

export interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  phoneCode: string;
  gender?: Gender;
  country?: string;
  address: string;
  zipCode: string;
  role: UserRole;
  avatar?: string;
}

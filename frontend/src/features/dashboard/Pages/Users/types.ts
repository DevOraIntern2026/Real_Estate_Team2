export type UserRole = "Admin" | "Customer" | "Owner" | "Agent";
export type UserStatus = "Active" | "Suspended";

export type RoleFilter = "all" | UserRole;
export type StatusFilter = "all" | UserStatus;

export interface User {
  id: string;
  name: string;
  role: UserRole;
  email: string;
  listings: number;
  phone: string;
  location: string;
  status: UserStatus;
  joined: string; // ISO date, e.g. "2026-09-24"
  avatar?: string;
}

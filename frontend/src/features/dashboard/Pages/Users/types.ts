// ---- what the UI uses ----
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
  joined: string; // ISO date
  avatar?: string;
}

// ---- what the SERVER sends ----
// Confirmed by the Swagger text: role, status, listingsCount.
// ASSUMED (not shown there): name, email, phone, location, avatar, joinedAt/createdAt.
export interface UserDto {
  id: string;
  name?: string;
  fullName?: string;
  email: string;
  phone?: string | null;
  location?: string | null;
  avatar?: string | null;
  role: string; // "owner"
  status: string; // "active"
  listingsCount?: number;
  joinedAt?: string;
  createdAt?: string;
}

// Confirmed by the Swagger text: total, published, pending, rejected, rent, sale
export interface UserListingsSummaryDto {
  total: number;
  published: number;
  pending: number;
  rejected: number;
  rent: number;
  sale: number;
}

export interface UsersParams {
  role?: string; // lowercase: admin | customer | owner | agent
  status?: string; // lowercase: active | suspended
  q?: string;
  page: number;
  limit: number;
}

export type SessionRole = "Admin" | "Owner";

/** The logged-in person (admin OR owner). */
export interface AdminProfile {
  id: string;
  role: SessionRole;
  name: string;
  email: string;
  phone: string;
  avatar?: string; // image URL
}

export type EditableAdminFields = Pick<AdminProfile, "name" | "email" | "phone">;

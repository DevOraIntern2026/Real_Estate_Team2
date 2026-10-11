export interface AdminProfile {
  name: string;
  email: string;
  phone: string;
  avatar?: string; // image URL
}

export type EditableAdminFields = Pick<AdminProfile, "name" | "email" | "phone">;

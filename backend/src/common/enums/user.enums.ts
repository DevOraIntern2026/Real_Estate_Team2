export enum GenderEnum {
  MALE,
  FEMALE,
}
export enum RoleEnum {
  ADMIN,
  OWNER,
  CUSTOMER,
  AGENT,
}

// Owner and Agent share identical listing-management permissions throughout
// the platform (business rule: "Owners/Agents may manage only their own
// listings"), so this group is the one authorization checks should use.
export const OWNER_OR_AGENT = [RoleEnum.OWNER, RoleEnum.AGENT];

export const RoleMap = {
  admin: RoleEnum.ADMIN,
  owner: RoleEnum.OWNER,
  customer: RoleEnum.CUSTOMER,
  agent: RoleEnum.AGENT,
} as const;

export const RoleLabel: Record<number, string> = {
  [RoleEnum.ADMIN]: "admin",
  [RoleEnum.OWNER]: "owner",
  [RoleEnum.CUSTOMER]: "customer",
  [RoleEnum.AGENT]: "agent",
};

export enum UserStatusEnum {
  ACTIVE = "active",
  SUSPENDED = "suspended",
}

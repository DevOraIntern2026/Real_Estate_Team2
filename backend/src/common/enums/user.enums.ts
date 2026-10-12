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

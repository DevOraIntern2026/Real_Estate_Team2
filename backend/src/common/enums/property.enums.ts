// Property type: what kind of unit the listing is
export enum PropertyTypeEnum {
  APARTMENT,
  VILLA,
  STUDIO,
  DUPLEX,
  PENTHOUSE,
  TOWNHOUSE,
  OFFICE,
  SHOP,
  WAREHOUSE,
  LAND,
  BUILDING,
}

// Sale vs Rent — business rule: every property must specify this
export enum TransactionTypeEnum {
  SALE,
  RENT,
}

// Optional furnishing state, useful for rentals
export enum FurnishingEnum {
  UNFURNISHED,
  SEMI_FURNISHED,
  FURNISHED,
}

// Mirrors the "Property Listing Lifecycle" in the project brief:
// Draft -> Submitted -> Under Review -> Approved -> Published -> Inactive/Sold/Rented
// REJECTED is added so an admin can send a listing back to the owner with a reason.
export enum PropertyStatusEnum {
  DRAFT,
  SUBMITTED,
  UNDER_REVIEW,
  APPROVED,
  PUBLISHED,
  REJECTED,
  INACTIVE,
  SOLD,
  RENTED,
  CHANGE_REQUIRED,
}

// Statuses that are safe to show to the general public (property seekers)
export const PUBLIC_PROPERTY_STATUSES = [PropertyStatusEnum.PUBLISHED];

//////////////////////// String <-> enum maps, so the API accepts/returns
//////////////////////// readable strings (e.g. "apartment") instead of raw numbers.
export const PropertyTypeMap = {
  apartment: PropertyTypeEnum.APARTMENT,
  villa: PropertyTypeEnum.VILLA,
  studio: PropertyTypeEnum.STUDIO,
  duplex: PropertyTypeEnum.DUPLEX,
  penthouse: PropertyTypeEnum.PENTHOUSE,
  townhouse: PropertyTypeEnum.TOWNHOUSE,
  office: PropertyTypeEnum.OFFICE,
  shop: PropertyTypeEnum.SHOP,
  warehouse: PropertyTypeEnum.WAREHOUSE,
  land: PropertyTypeEnum.LAND,
  building: PropertyTypeEnum.BUILDING,
} as const;

export const TransactionTypeMap = {
  sale: TransactionTypeEnum.SALE,
  rent: TransactionTypeEnum.RENT,
} as const;

export const FurnishingMap = {
  unfurnished: FurnishingEnum.UNFURNISHED,
  semi_furnished: FurnishingEnum.SEMI_FURNISHED,
  furnished: FurnishingEnum.FURNISHED,
} as const;

export const PropertyStatusMap = {
  draft: PropertyStatusEnum.DRAFT,
  submitted: PropertyStatusEnum.SUBMITTED,
  under_review: PropertyStatusEnum.UNDER_REVIEW,
  approved: PropertyStatusEnum.APPROVED,
  published: PropertyStatusEnum.PUBLISHED,
  rejected: PropertyStatusEnum.REJECTED,
  inactive: PropertyStatusEnum.INACTIVE,
  sold: PropertyStatusEnum.SOLD,
  rented: PropertyStatusEnum.RENTED,
  change_required: PropertyStatusEnum.CHANGE_REQUIRED,
} as const;

// Reverse lookups (enum number -> label string) used when serializing responses
const reverse = <T extends Record<string, number>>(map: T) =>
  Object.fromEntries(Object.entries(map).map(([k, v]) => [v, k])) as Record<
    number,
    keyof T
  >;

export const PropertyTypeLabel = reverse(PropertyTypeMap);
export const TransactionTypeLabel = reverse(TransactionTypeMap);
export const FurnishingLabel = reverse(FurnishingMap);
export const PropertyStatusLabel = reverse(PropertyStatusMap);

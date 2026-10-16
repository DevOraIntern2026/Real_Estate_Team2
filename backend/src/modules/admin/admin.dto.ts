export interface ListingsQueryDto {
  status?: string;
  transaction?: "sale" | "rent";
  type?: string;
  location?: string;
  q?: string;
  sort?: string;
  page?: string;
  limit?: string;
}

export interface ApproveListingDto {
  propertyType: string;
  category: string;
}

export interface RejectListingDto {
  reason: string;
  feedback?: string;
}

export interface RequestChangesDto {
  feedback: string;
}

export interface UsersQueryDto {
  role?: string;
  status?: string;
  q?: string;
  sort?: string;
  page?: string;
  limit?: string;
}

export interface SuspendUserDto {
  reason?: string;
}

export interface NotificationsQueryDto {
  page?: string;
  limit?: string;
  unreadOnly?: string;
}

export interface ReportsQueryDto {
  from?: string;
  to?: string;
}

export interface OverviewQueryDto {
  pendingLimit?: string;
  notificationsLimit?: string;
}

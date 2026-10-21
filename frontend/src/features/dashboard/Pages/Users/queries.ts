import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
  type QueryClient,
} from "@tanstack/react-query";
import { normalizePaginated } from "../../api";
import { toListingRowVm } from "../Listing/mappers";
import type { ListingSummaryDto } from "../Listing/types";
import { activateUser, fetchAdminUser, fetchAdminUsers, fetchUserListings, suspendUser } from "./api";
import { normalizeUserProfile, toUser } from "./mappers";
import type { UserDto, UsersParams, UserStatus } from "./types";

// every key starts with ["admin","users"]: one invalidate refreshes list + profile + listings
export const adminUsersRoot = ["admin", "users"] as const;
export const usersKey = (params: UsersParams) => [...adminUsersRoot, "list", params] as const;
export const userKey = (id: string) => [...adminUsersRoot, "detail", id] as const;
export const userListingsKey = (id: string, page: number, limit: number) =>
  [...userKey(id), "listings", { page, limit }] as const;

export const USER_LISTINGS_LIMIT = 10;

export function useAdminUsers(params: UsersParams) {
  return useQuery({
    queryKey: usersKey(params),
    queryFn: async ({ signal }) =>
      normalizePaginated<UserDto>(await fetchAdminUsers(params, signal), {
        page: params.page,
        limit: params.limit,
      }),
    select: (page) => ({ ...page, items: page.items.map(toUser) }),
    placeholderData: keepPreviousData,
  });
}

export function useAdminUser(id: string) {
  return useQuery({
    queryKey: userKey(id),
    queryFn: async ({ signal }) => normalizeUserProfile(await fetchAdminUser(id, signal)),
    enabled: Boolean(id),
  });
}

/** The user's listings; `ownerName` fills the Owner column if the API doesn't send it. */
export function useUserListings(id: string, page: number, ownerName = "") {
  return useQuery({
    queryKey: userListingsKey(id, page, USER_LISTINGS_LIMIT),
    queryFn: async ({ signal }) =>
      normalizePaginated<ListingSummaryDto>(
        await fetchUserListings(id, { page, limit: USER_LISTINGS_LIMIT }, signal),
        { page, limit: USER_LISTINGS_LIMIT }
      ),
    select: (p) => ({ ...p, items: p.items.map((i) => toListingRowVm(i, ownerName)) }),
    placeholderData: keepPreviousData,
    enabled: Boolean(id),
  });
}

/** After a status change the users + the Overview totals are stale. */
export function invalidateAdminUsers(qc: QueryClient) {
  return Promise.all([
    qc.invalidateQueries({ queryKey: adminUsersRoot }),
    qc.invalidateQueries({ queryKey: ["admin", "overview"] }),
  ]);
}

export function useChangeUserStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, to }: { id: string; to: UserStatus }) =>
      to === "Suspended" ? suspendUser(id) : activateUser(id),
    onSuccess: () => invalidateAdminUsers(qc),
  });
}

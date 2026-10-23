import { useMemo, useState } from "react";
import { useDebouncedValue } from "../../../../hooks/useDebouncedValue";
import { USERS_PAGE_SIZE } from "./constants";
import { useAdminUsers } from "./queries";
import type { RoleFilter, StatusFilter, UsersParams } from "./types";

/** UI state (search, role, status, page) -> query params -> server data. */
export function useUsersTable() {
  const [search, setSearch] = useState("");
  const [role, setRole] = useState<RoleFilter>("all");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [page, setPage] = useState(1);

  const debouncedSearch = useDebouncedValue(search.trim(), 400);

  const params: UsersParams = useMemo(
    () => ({
      role: role === "all" ? undefined : role.toLowerCase(), // the API wants "owner", not "Owner"
      status: status === "all" ? undefined : status.toLowerCase(),
      q: debouncedSearch || undefined,
      page,
      limit: USERS_PAGE_SIZE,
    }),
    [role, status, debouncedSearch, page]
  );

  const query = useAdminUsers(params);

  // any filter change sends the user back to page 1
  const changeSearch = (v: string) => { setSearch(v); setPage(1); };
  const changeRole = (v: RoleFilter) => { setRole(v); setPage(1); };
  const changeStatus = (v: StatusFilter) => { setStatus(v); setPage(1); };

  return {
    search, role, status,
    changeSearch, changeRole, changeStatus,
    rows: query.data?.items ?? [],
    total: query.data?.total ?? 0,
    isFiltering: search.trim() !== "" || role !== "all" || status !== "all",
    page,
    totalPages: query.data?.totalPages ?? 1,
    setPage,
    isLoading: query.isPending,
    isRefreshing: query.isPlaceholderData,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    isRetrying: query.isRefetching,
  };
}

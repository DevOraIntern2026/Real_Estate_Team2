import { useMemo, useState } from "react";
import { usePagination } from "../../../../hooks/usePagination";
import { PAGE_SIZE } from "./constants";
import type { RoleFilter, StatusFilter, User } from "./types";

/** All the filtering + pagination logic for the users table. */
export function useUsersTable(users: User[]) {
  const [search, setSearch] = useState("");
  const [role, setRole] = useState<RoleFilter>("all");
  const [status, setStatus] = useState<StatusFilter>("all");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return users.filter((u) => {
      if (role !== "all" && u.role !== role) return false;
      if (status !== "all" && u.status !== status) return false;
      if (!q) return true;
      return [u.name, u.email, u.phone].some((f) => f.toLowerCase().includes(q));
    });
  }, [users, search, role, status]);

  const { page, totalPages, pageItems, setPage, reset } = usePagination(
    filtered,
    PAGE_SIZE
  );

  // any filter change sends the user back to page 1
  const changeSearch = (v: string) => {
    setSearch(v);
    reset();
  };
  const changeRole = (v: RoleFilter) => {
    setRole(v);
    reset();
  };
  const changeStatus = (v: StatusFilter) => {
    setStatus(v);
    reset();
  };

  const isFiltering = search.trim() !== "" || role !== "all" || status !== "all";

  return {
    search,
    role,
    status,
    changeSearch,
    changeRole,
    changeStatus,
    rows: pageItems,
    total: filtered.length,
    isFiltering,
    page,
    totalPages,
    setPage,
  };
}

import { useCallback, useMemo, useState } from "react";

/** Generic client-side pagination for any array. */
export function usePagination<T>(items: T[], pageSize: number) {
  const [page, setPage] = useState(1);

  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
  // clamp so we never sit on a page that no longer exists
  const currentPage = Math.min(page, totalPages);

  const pageItems = useMemo(
    () => items.slice((currentPage - 1) * pageSize, currentPage * pageSize),
    [items, currentPage, pageSize]
  );

  const reset = useCallback(() => setPage(1), []);

  return { page: currentPage, totalPages, pageItems, setPage, reset };
}

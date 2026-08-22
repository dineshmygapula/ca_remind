import { useState, useMemo, useEffect } from "react";

interface UsePaginationProps<T> {
  data: T[];
  defaultRowsPerPage?: number;
  resetDeps?: unknown[];  // dependencies that reset page to 0
}

interface UsePaginationReturn<T> {
  page: number;
  rowsPerPage: number;
  paginatedData: T[];
  totalCount: number;
  setPage: (page: number) => void;
  setRowsPerPage: (rows: number) => void;
  handlePageChange: (event: unknown, newPage: number) => void;
  handleRowsPerPageChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export function usePagination<T>({
  data,
  defaultRowsPerPage = 10,
  resetDeps = [],
}: UsePaginationProps<T>): UsePaginationReturn<T> {

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(defaultRowsPerPage);

  // ── Reset to page 0 when deps change ─────────────
  useEffect(() => {
    setPage(0);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, resetDeps);

  // ── Paginated slice ───────────────────────────────
  const paginatedData = useMemo(() => {
    const start = page * rowsPerPage;
    return data.slice(start, start + rowsPerPage);
  }, [data, page, rowsPerPage]);

  const handlePageChange = (_: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleRowsPerPageChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return {
    page,
    rowsPerPage,
    paginatedData,
    totalCount: data.length,
    setPage,
    setRowsPerPage,
    handlePageChange,
    handleRowsPerPageChange,
  };
}
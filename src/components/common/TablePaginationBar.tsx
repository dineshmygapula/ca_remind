"use client";

import { TablePagination } from "@mui/material";

interface TablePaginationBarProps {
  // ── Required ──────────────────────────────────────
  totalCount: number;
  page: number;
  rowsPerPage: number;
  onPageChange: (event: unknown, newPage: number) => void;
  onRowsPerPageChange: (event: React.ChangeEvent<HTMLInputElement>) => void;

  // ── Optional ──────────────────────────────────────
  rowsPerPageOptions?: number[];
  labelRowsPerPage?: string;
}

export default function TablePaginationBar({
  totalCount,
  page,
  rowsPerPage,
  onPageChange,
  onRowsPerPageChange,
  rowsPerPageOptions = [5, 10, 25, 50],
  labelRowsPerPage = "Rows per page:",
}: TablePaginationBarProps) {
  return (
    <TablePagination
      component="div"
      count={totalCount}
      page={page}
      rowsPerPage={rowsPerPage}
      onPageChange={onPageChange}
      onRowsPerPageChange={onRowsPerPageChange}
      rowsPerPageOptions={rowsPerPageOptions}
      labelRowsPerPage={labelRowsPerPage}
      sx={{
        borderTop: "1px solid",
        borderColor: "divider",
        bgcolor: "background.paper",
        ".MuiTablePagination-toolbar": { px: 2 },
        ".MuiTablePagination-selectLabel": {
          color: "text.secondary",
          fontSize: "0.875rem",
        },
        ".MuiTablePagination-displayedRows": {
          color: "text.secondary",
          fontSize: "0.875rem",
        },
      }}
    />
  );
}
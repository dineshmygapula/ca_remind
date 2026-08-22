"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Chip,
  Skeleton,
  Tooltip,
  Typography,
  Box,
} from "@mui/material";
import {
  Visibility as ViewIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material";
import { ReminderDetail } from "../../types/reminders.types";
import TablePaginationBar from "@/components/common/TablePaginationBar";
import {
  REMINDER_STATUS_LABELS,
  REMINDER_CHANNEL_LABELS,
} from "../../constants/reminderConstants";

interface RemindersTableProps {
  reminders: ReminderDetail[];
  loading: boolean;
  onView: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string, taskTitle: string) => void;
  totalCount: number;
  page: number;
  rowsPerPage: number;
  onPageChange: (event: unknown, newPage: number) => void;
  onRowsPerPageChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

/* const statusColorMap: Record<string, "warning" | "success" | "error" | "default"> = {
  SCHEDULED: "warning",
  SENT: "success",
  FAILED: "error",
  CANCELLED: "default",
}; */

export default function RemindersTable({
  reminders,
  loading,
  onView,
  onEdit,
  onDelete,
  totalCount,
  page,
  rowsPerPage,
  onPageChange,
  onRowsPerPageChange,
}: RemindersTableProps) {
  // ─── Loading Skeleton ───────────────────────────────────────────────────
  if (loading) {
    return (
      <TableContainer component={Paper} variant="outlined">
        <Table>
          <TableHead>
            <TableRow>
              {[
                "Task",
                "Subject",
                "Task Type",
                "Channel",
                "Status",
                "Scheduled At",
                "Actions",
              ].map((h) => (
                <TableCell key={h}>
                  <strong>{h}</strong>
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {Array.from({ length: 5 }).map((_, i) => (
              <TableRow key={i}>
                {Array.from({ length: 7 }).map((_, j) => (
                  <TableCell key={j}>
                    <Skeleton variant="text" />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  }

  // ─── Empty State ────────────────────────────────────────────────────────
  if (reminders.length === 0) {
    return (
      <Box sx={{ textAlign: "center", py: 8 }}>
        <Typography variant="body1" color="text.secondary">
          No reminders found. Create one to get started.
        </Typography>
      </Box>
    );
  }

  const getTimeAgo = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "1 day ago";
    if (diffDays > 1) return `${diffDays} days ago`;
    if (diffDays === -1) return "Tomorrow";
    return `in ${Math.abs(diffDays)} days`;
  };

  // ─── Table ──────────────────────────────────────────────────────────────
  return (
    <TableContainer component={Paper} variant="outlined">
      <Table>
        <TableHead>
          <TableRow
            sx={{
              backgroundColor: "#F8FAFC",
            }}
          >
            {[
              "Task",
              "Subject",
              "Task Type",
              "Channel",
              "Status",
              "Scheduled At",
              "Actions",
            ].map((h) => (
              <TableCell key={h}>
                <Typography
                  variant="caption"
                  sx={{
                    fontWeight: 700,
                    color: "#475569",
                    textTransform: "uppercase",
                    letterSpacing: "0.04em",
                  }}
                >
                  {h}
                </Typography>
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {reminders.map((reminder) => (
            <TableRow key={reminder.id} hover sx={{ cursor: "pointer" }}>
              <TableCell>
                <Typography variant="body2" fontWeight={500}>
                  {reminder.task?.title ?? "—"}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Due:{" "}
                  {reminder.task?.dueDate
                    ? new Date(reminder.task.dueDate).toLocaleDateString()
                    : "—"}
                </Typography>
              </TableCell>

              <TableCell>
                <Typography variant="body2">
                  {reminder.subject?.name ?? "—"}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {reminder.subject?.type ?? ""}
                </Typography>
              </TableCell>

              <TableCell>
                {reminder.taskType ? (
                  <Chip
                    label={reminder.taskType}
                    size="small"
                    sx={{
                      bgcolor: "#EFF6FF",
                      color: "#2563EB",
                      border: "1px solid #DBEAFE",
                      fontWeight: 600,
                      fontSize: "0.72rem",
                    }}
                  />
                ) : (
                  <Typography variant="body2" color="text.disabled">
                    —
                  </Typography>
                )}
              </TableCell>

              <TableCell>
                <Chip
                  label={
                    REMINDER_CHANNEL_LABELS[
                      reminder.channel as keyof typeof REMINDER_CHANNEL_LABELS
                    ] ?? reminder.channel
                  }
                  size="small"
                  sx={{
                    bgcolor: "#F8FAFC",
                    color: "#475569",

                    border: "1px solid",
                    borderColor: "divider",

                    fontWeight: 600,
                    fontSize: "0.72rem",
                  }}
                />
              </TableCell>

              <TableCell>
                <Chip
                  label={
                    REMINDER_STATUS_LABELS[
                      reminder.status as keyof typeof REMINDER_STATUS_LABELS
                    ] ?? reminder.status
                  }
                  size="small"
                  sx={{
                    bgcolor:
                      reminder.status === "SENT"
                        ? "#E8F5E9"
                        : reminder.status === "SCHEDULED"
                          ? "#FFF7ED"
                          : reminder.status === "FAILED"
                            ? "#FEF2F2"
                            : "#F1F5F9",

                    color:
                      reminder.status === "SENT"
                        ? "#2E7D32"
                        : reminder.status === "SCHEDULED"
                          ? "#EA580C"
                          : reminder.status === "FAILED"
                            ? "#DC2626"
                            : "#64748B",

                    border: "1px solid",
                    borderColor: "divider",

                    fontWeight: 600,
                    fontSize: "0.72rem",
                  }}
                />
              </TableCell>

              <TableCell>
                {reminder.scheduledAt ? (
                  <Box>
                    <Typography variant="body2" fontWeight={500}>
                      {new Date(reminder.scheduledAt).toLocaleDateString(
                        "en-IN",
                        {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        },
                      )}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {getTimeAgo(reminder.scheduledAt)}
                    </Typography>
                  </Box>
                ) : (
                  "—"
                )}
              </TableCell>

              <TableCell>
                <Tooltip title="View Details">
                  <IconButton
                    size="small"
                    onClick={() => onView(reminder.id)}
                    sx={{
                      color: "text.secondary",

                      "&:hover": {
                        color: "primary.main",
                        backgroundColor: "#F1F5F9",
                      },
                    }}
                  >
                    <ViewIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Edit">
                  <IconButton
                    size="small"
                    onClick={() => onEdit(reminder.id)}
                    sx={{
                      color: "text.secondary",

                      "&:hover": {
                        color: "primary.main",
                        backgroundColor: "#F1F5F9",
                      },
                    }}
                  >
                    {" "}
                    <EditIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Delete">
                  <IconButton
                    size="small"
                    onClick={() =>
                      onDelete(
                        reminder.id,
                        reminder.task?.title ?? "this reminder",
                      )
                    }
                    sx={{
                      color: "#94A3B8",
                      "&:hover": {
                        color: "#DC2626",
                        backgroundColor: "#FEF2F2",
                      },
                    }}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <TablePaginationBar
        totalCount={totalCount}
        page={page}
        rowsPerPage={rowsPerPage}
        onPageChange={onPageChange}
        onRowsPerPageChange={onRowsPerPageChange}
      />
    </TableContainer>
  );
}
   

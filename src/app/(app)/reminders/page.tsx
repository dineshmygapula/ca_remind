"use client";

import { useState, useEffect, useMemo,useCallback } from "react";
import {
  Box,
  Container,
  Typography,
  Button,
  Stack,
  Alert,
  CircularProgress,
} from "@mui/material";
import { Add as AddIcon } from "@mui/icons-material";
import { usePagination } from "@/hooks/usePagination";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from "@mui/material";
import { useAuth } from "@/context/AuthContext";
import { Reminder } from "../../../types/reminders.types";
import { getReminders, deleteReminder } from "../../../services/reminderService";
import CreateReminderDialog from "@/components/reminders/CreateReminderDialog";
import RemindersTable from "@/components/reminders/RemindersTable";
import RemindersFilter from "@/components/reminders/RemindersFilter";
import EditReminderDialog from "@/components/reminders/EditReminderDialog";
import ReminderDetailsDrawer from "@/components/reminders/ReminderDetailsDrawer";
import {
  ReminderStatusFilter,
  ReminderChannelFilter,
  ReminderTimeFilter,
} from "@/constants/reminderConstants";



export default function RemindersPage() {
  const { businessId, orgId } = useAuth();

  // ─── Data State ──────────────────────────────────────────────────────────
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
 // const [nextCursor, setNextCursor] = useState<string | null>(null);

  // ─── Dialog / Drawer State ───────────────────────────────────────────────
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [editingReminderId, setEditingReminderId] = useState<string | null>(null);
  const [selectedReminderId, setSelectedReminderId] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<{ id: string; title: string } | null>(null);
const [deleteLoading, setDeleteLoading] = useState(false);

  // ─── Filter State ────────────────────────────────────────────────────────
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<ReminderStatusFilter>("ALL");
const [channelFilter, setChannelFilter] = useState<ReminderChannelFilter>("ALL");
const [timeFilter, setTimeFilter] = useState<ReminderTimeFilter>("ALL");
const [dateFrom, setDateFrom] = useState("");
const [dateTo, setDateTo] = useState("");

  // ─── Fetch Reminders ─────────────────────────────────────────────────────
  /* useEffect(() => {
    if (businessId) fetchReminders();
  }, [businessId]); */

  // ✅ fixed
const fetchReminders = useCallback(async () => {
  if (!businessId) return;
  try {
    setLoading(true);
    setError("");

    // ⚠️ TEMPORARY — loads all pages upfront for client-side pagination.
    // TODO: replace with true server-side cursor pagination later.
    let allItems: Reminder[] = [];
    let cursor: string | null = null;

    do {
      const data = await getReminders(businessId, cursor ?? undefined);
      allItems = [...allItems, ...(data.items || [])];
      cursor = data.next_cursor;
    } while (cursor);

    setReminders(allItems);
  } catch (err: unknown) {
    setError(err instanceof Error ? err.message : "Failed to fetch reminders");
  } finally {
    setLoading(false);
  }
}, [businessId]);

useEffect(() => {
  if (businessId) fetchReminders();
}, [businessId, fetchReminders]);

  // ─── Load More (Cursor Pagination) ───────────────────────────────────────
/*  const loadMore = async () => {
  if (!businessId || !nextCursor) return;
  try {
    setLoading(true);
    const data = await getReminders(businessId, nextCursor); // ✅ pass cursor
    setReminders((prev) => [...prev, ...(data.items || [])]);
    setNextCursor(data.next_cursor);
  } catch (err: unknown) {
    setError(err instanceof Error ? err.message : "Failed to load more reminders");
  } finally {
    setLoading(false);
  }
}; */

  // ─── Filtered Reminders (client-side) ────────────────────────────────────
  const filteredReminders = useMemo(() => {
    let result = [...reminders];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (r) =>
          r.task?.title?.toLowerCase().includes(q) ||
          r.subject?.name?.toLowerCase().includes(q)
      );
    }

    if (statusFilter !== "ALL") {
      result = result.filter((r) => r.status === statusFilter);
    }

    if (channelFilter !== "ALL") {
      result = result.filter((r) => r.channel === channelFilter);
    }

    // ─── Time Filter — Overdue / Today / Upcoming ──────────────────────────
    if (timeFilter !== "ALL") {
      const now = new Date();
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const todayEnd = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000);

      result = result.filter((r) => {
        if (!r.scheduledAt) return false;
        const scheduled = new Date(r.scheduledAt);

        if (timeFilter === "OVERDUE") {
          return scheduled < todayStart && r.status === "SCHEDULED";
        }
        if (timeFilter === "TODAY") {
          return scheduled >= todayStart && scheduled < todayEnd;
        }
        if (timeFilter === "UPCOMING") {
          return scheduled >= todayEnd;
        }
        return true;
      });
    }

    // ─── Date Range Filter — UTC-safe boundaries ───────────────────────────
    if (dateFrom) {
      const fromBoundary = new Date(`${dateFrom}T00:00:00.000Z`);
      result = result.filter(
        (r) => r.scheduledAt && new Date(r.scheduledAt).getTime() >= fromBoundary.getTime(),
      );
    }
    if (dateTo) {
      const toBoundary = new Date(`${dateTo}T23:59:59.999Z`);
      result = result.filter(
        (r) => r.scheduledAt && new Date(r.scheduledAt).getTime() <= toBoundary.getTime(),
      );
    }

    return result;
  }, [reminders, searchQuery, statusFilter, channelFilter, timeFilter, dateFrom, dateTo]);


  //pagination

  // ⚠️ TEMPORARY — client-side pagination, matches Tasks module pattern.
  // TODO: replace with server-side cursor pagination later.
  const {
    page,
    rowsPerPage,
    paginatedData: paginatedReminders,
    totalCount,
    handlePageChange,
    handleRowsPerPageChange,
  } = usePagination({
    data: filteredReminders,
    defaultRowsPerPage: 10,
    resetDeps: [searchQuery, statusFilter, channelFilter, timeFilter, dateFrom, dateTo],
  });



    
  // ─── Handlers ────────────────────────────────────────────────────────────
  const handleView = (reminderId: string) => {
    setSelectedReminderId(reminderId);
    setDrawerOpen(true);
  };

  const handleEdit = (reminderId: string) => {
    setEditingReminderId(reminderId);
    setOpenEditDialog(true);
    setDrawerOpen(false);
  };
  const handleDeleteRequest = (reminderId: string, taskTitle: string) => {
  setDeleteTarget({ id: reminderId, title: taskTitle });
};

 const handleDeleteConfirm = async () => {
  if (!businessId || !deleteTarget) return;
  try {
    setDeleteLoading(true);
    setError("");
    await deleteReminder(businessId, deleteTarget.id);
    setDeleteTarget(null);
    await fetchReminders();
  } catch (err: unknown) {
    setError(err instanceof Error ? err.message : "Failed to delete reminder");
  } finally {
    setDeleteLoading(false);
  }
};

  const handleDrawerClose = () => {
    setDrawerOpen(false);
    setSelectedReminderId(null);
  };

  

  const handleResetFilters = () => {
  setSearchQuery("");
  setStatusFilter("ALL");
  setChannelFilter("ALL");
  setTimeFilter("ALL");
  setDateFrom("");
  setDateTo("");
};

  // ─── Loading Guard (no businessId yet) ───────────────────────────────────
  if (!businessId) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "60vh",
          bgcolor: "background.default",
        }}
      >
        <CircularProgress color="primary" />
      </Box>
    );
  }

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <Box sx={{ bgcolor: "background.default", minHeight: "100vh", py: 4 }}>
      <Container maxWidth="xl">
        <Stack spacing={3}>

          {/* Header */}
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Box>
              <Typography variant="h5" fontWeight={600}>
                Reminders
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                Manage and monitor all reminder notifications
              </Typography>
            </Box>
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={() => setOpenCreateDialog(true)}
              sx={{ textTransform: "none", fontWeight: 600 }}
            >
              Create Reminder
            </Button>
          </Stack>

          {/* Error Banner */}
          {error && (
            <Alert severity="error" onClose={() => setError("")}>
              {error}
            </Alert>
          )}

          {/* Filters */}
          <RemindersFilter
  searchQuery={searchQuery}
  onSearchChange={setSearchQuery}
  statusFilter={statusFilter}
  onStatusChange={setStatusFilter}
  channelFilter={channelFilter}
  onChannelChange={setChannelFilter}
  timeFilter={timeFilter}
  onTimeChange={setTimeFilter}
  dateFrom={dateFrom}
  onDateFromChange={(value) => {
    setDateFrom(value);
    // auto-clear "To Date" if it's now before the new "From Date"
    if (dateTo && value && new Date(value) > new Date(dateTo)) {
      setDateTo("");
    }
  }}
  dateTo={dateTo}
  onDateToChange={setDateTo}
  onReset={handleResetFilters}
/>

          {/* Results Count */}
          {!loading && (
            <Typography variant="body2" color="text.secondary">
              Showing {filteredReminders.length} of {reminders.length} reminders
            </Typography>
          )}

          {/* Table */}
         <RemindersTable
  reminders={paginatedReminders}
  loading={loading}
  onView={handleView}
  onEdit={handleEdit}
  onDelete={handleDeleteRequest}
  totalCount={totalCount}
  page={page}
  rowsPerPage={rowsPerPage}
  onPageChange={handlePageChange}
  onRowsPerPageChange={handleRowsPerPageChange}
/>

          {/* Load More */}
         {/*  {nextCursor && !loading && (
            <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
              <Button
                variant="outlined"
                onClick={loadMore}
                sx={{ textTransform: "none", fontWeight: 600 }}
              >
                Load More
              </Button>
            </Box>
          )} */}

        </Stack>
      </Container>

      {/* ── Dialogs & Drawer (outside Container to avoid layout interference) ── */}

      <CreateReminderDialog
        open={openCreateDialog}
  onClose={() => setOpenCreateDialog(false)}
  businessId={businessId}
  organizationId={orgId ?? ""}              // ← ADD THIS
  onSuccess={() => {
    fetchReminders();
    setOpenCreateDialog(false);
  }}
      />

      <EditReminderDialog
        open={openEditDialog}
        onClose={() => {
          setOpenEditDialog(false);
          setEditingReminderId(null);
        }}
        reminderId={editingReminderId}
        businessId={businessId}
        onSuccess={() => {
          fetchReminders();
          setOpenEditDialog(false);
        }}
      />

      <ReminderDetailsDrawer
  open={drawerOpen}
  onClose={handleDrawerClose}
  reminderId={selectedReminderId}
  businessId={businessId}
  onEdit={handleEdit}
/>

{/* ── Delete Confirmation Dialog ── */}
<Dialog
  open={!!deleteTarget}
  onClose={() => !deleteLoading && setDeleteTarget(null)}
  maxWidth="xs"
  fullWidth
  PaperProps={{ sx: { borderRadius: 3, padding: "0 !important", overflow: "hidden" } }}
>
  <DialogTitle
    sx={{
      px: 3, pt: 2.5, pb: 2,
      borderBottom: "1px solid #F0F0F0",
      backgroundColor: "#fff",
      color: "#0F172A",
      fontWeight: 700,
      fontSize: "1rem",
    }}
  >
    Delete Reminder
  </DialogTitle>
  <DialogContent sx={{ px: 3, pt: 2.5 }}>
    <DialogContentText>
      Are you sure you want to delete the reminder for{" "}
      <strong>{deleteTarget?.title}</strong>? This action cannot be undone.
    </DialogContentText>
  </DialogContent>
  <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
    <Button
      variant="outlined"
      onClick={() => setDeleteTarget(null)}
      disabled={deleteLoading}
      sx={{ flex: 1 }}
    >
      Cancel
    </Button>
    <Button
      variant="contained"
      color="error"
      onClick={handleDeleteConfirm}
      disabled={deleteLoading}
      sx={{ flex: 1 }}
    >
      {deleteLoading ? <CircularProgress size={18} color="inherit" /> : "Delete"}
    </Button>
  </DialogActions>
</Dialog>
    </Box>
  );
}
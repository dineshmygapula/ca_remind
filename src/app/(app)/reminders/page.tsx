"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { usePagination } from "@/hooks/usePagination";
import { useWorkspace } from "@/context/WorkspaceContext";
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
  const { businessId, orgId } = useWorkspace();

  // Data state
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Dialog / drawer state
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [editingReminderId, setEditingReminderId] = useState<string | null>(null);
  const [selectedReminderId, setSelectedReminderId] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<{
    id: string;
    title: string;
  } | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<ReminderStatusFilter>("ALL");
  const [channelFilter, setChannelFilter] = useState<ReminderChannelFilter>("ALL");
  const [timeFilter, setTimeFilter] = useState<ReminderTimeFilter>("ALL");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  // Fetch all reminder pages for client-side filtering and pagination.
  const fetchReminders = useCallback(async () => {
    if (!businessId) return;

    try {
      setLoading(true);
      setError("");

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

  // Client-side filters
  const filteredReminders = useMemo(() => {
    let result = [...reminders];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (r) =>
          r.task?.title?.toLowerCase().includes(q) ||
          r.subject?.name?.toLowerCase().includes(q),
      );
    }

    if (statusFilter !== "ALL") {
      result = result.filter((r) => r.status === statusFilter);
    }

    if (channelFilter !== "ALL") {
      result = result.filter((r) => r.channel === channelFilter);
    }

    // Overdue / today / upcoming filter
    if (timeFilter !== "ALL") {
      const now = new Date();
      const todayStart = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
      );
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

    // UTC-safe date range boundaries
    if (dateFrom) {
      const fromBoundary = new Date(`${dateFrom}T00:00:00.000Z`);
      result = result.filter(
        (r) =>
          r.scheduledAt &&
          new Date(r.scheduledAt).getTime() >= fromBoundary.getTime(),
      );
    }

    if (dateTo) {
      const toBoundary = new Date(`${dateTo}T23:59:59.999Z`);
      result = result.filter(
        (r) =>
          r.scheduledAt &&
          new Date(r.scheduledAt).getTime() <= toBoundary.getTime(),
      );
    }

    return result;
  }, [
    reminders,
    searchQuery,
    statusFilter,
    channelFilter,
    timeFilter,
    dateFrom,
    dateTo,
  ]);

  // Client-side pagination
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
    resetDeps: [
      searchQuery,
      statusFilter,
      channelFilter,
      timeFilter,
      dateFrom,
      dateTo,
    ],
  });

  // Handlers
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

  // Loading guard
  if (!businessId) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-base-200">
        <span className="loading loading-spinner loading-lg text-primary" />
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-base-200 py-8">
      <div className="mx-auto w-full max-w-screen-2xl px-4 sm:px-6 lg:px-8">
        <div className="space-y-6">
          {/* Header */}
          <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-base-content">
                Reminders
              </h1>
              <p className="mt-1 text-sm text-base-content/70">
                Manage and monitor all reminder notifications
              </p>
            </div>

            <button
              type="button"
              className="btn btn-primary gap-2 font-semibold normal-case"
              onClick={() => setOpenCreateDialog(true)}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M12 5v14M5 12h14" />
              </svg>
              Create Reminder
            </button>
          </header>

          {/* Error banner */}
          {error && (
            <div role="alert" className="alert alert-error">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 9v3m0 4h.01M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z"
                />
              </svg>
              <span>{error}</span>
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                aria-label="Dismiss error"
                onClick={() => setError("")}
              >
                ✕
              </button>
            </div>
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
              // Clear To Date if it is now before From Date.
              if (dateTo && value && new Date(value) > new Date(dateTo)) {
                setDateTo("");
              }
            }}
            dateTo={dateTo}
            onDateToChange={setDateTo}
            onReset={handleResetFilters}
          />

          {/* Results count */}
          {!loading && (
            <p className="text-sm text-base-content/70">
              Showing {filteredReminders.length} of {reminders.length} reminders
            </p>
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
        </div>
      </div>

      {/* Dialogs and drawer remain connected to the existing components */}
      <CreateReminderDialog
        open={openCreateDialog}
        onClose={() => setOpenCreateDialog(false)}
        businessId={businessId}
        organizationId={orgId ?? ""}
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

      {/* DaisyUI delete confirmation modal */}
      {deleteTarget && (
        <div
          className="modal modal-open"
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-reminder-title"
        >
          <button
            type="button"
            className="modal-backdrop"
            aria-label="Close delete confirmation"
            disabled={deleteLoading}
            onClick={() => !deleteLoading && setDeleteTarget(null)}
          >
            Close
          </button>

          <div className="modal-box max-w-md rounded-2xl border border-base-300 p-0 shadow-2xl">
            <div className="border-b border-base-300 px-6 py-5">
              <h2
                id="delete-reminder-title"
                className="text-lg font-bold text-base-content"
              >
                Delete Reminder
              </h2>
              <p className="mt-1 text-sm text-base-content/60">
                This action cannot be undone.
              </p>
            </div>

            <div className="px-6 py-5 text-sm leading-6 text-base-content/80">
              Are you sure you want to delete the reminder for{" "}
              <strong className="font-semibold text-base-content">
                {deleteTarget.title}
              </strong>
              ?
            </div>

            <div className="flex flex-col-reverse gap-3 border-t border-base-300 bg-base-200/50 px-6 py-4 sm:flex-row sm:justify-end">
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => setDeleteTarget(null)}
                disabled={deleteLoading}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-error text-white"
                onClick={handleDeleteConfirm}
                disabled={deleteLoading}
              >
                {deleteLoading && (
                  <span className="loading loading-spinner loading-sm" />
                )}
                {deleteLoading ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

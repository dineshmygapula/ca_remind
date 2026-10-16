'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { Plus, X } from 'lucide-react';
import { useWorkspace } from '@/context/WorkspaceContext';
import { ReminderDetail } from '@/types/reminders.types';
import { getReminders, deleteReminder } from '@/services/reminderService';
import RemindersTable from '@/components/reminders/RemindersTable';
import RemindersFilter from '@/components/reminders/RemindersFilter';
import ReminderFormDrawer from '@/components/reminders/ReminderFormDrawer';
import ReminderDetailsDrawer from '@/components/reminders/ReminderDetailsDrawer';
import ConfirmDialog from '@/components/tasks/ConfirmDialog';
import {
  ReminderStatusFilter,
  ReminderChannelFilter,
  ReminderTimeFilter,
} from '@/constants/reminderConstants';
import PageSkeleton from '@/components/common/PageSkeleton';

export default function RemindersPage() {
  const { businessId, orgId } = useWorkspace();

  // Data state
  const [reminders, setReminders] = useState<ReminderDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Dialog / drawer state
  const [formDrawerOpen, setFormDrawerOpen] = useState(false);
  const [editingReminderId, setEditingReminderId] = useState<string | null>(null);
  const [selectedReminderId, setSelectedReminderId] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<{
    id: string;
    title: string;
  } | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<ReminderStatusFilter>('ALL');
  const [channelFilter, setChannelFilter] = useState<ReminderChannelFilter>('ALL');
  const [timeFilter, setTimeFilter] = useState<ReminderTimeFilter>('ALL');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  // Fetch all reminder pages for client-side filtering and AG Grid display
  const fetchReminders = useCallback(async () => {
    if (!businessId) return;

    try {
      setLoading(true);
      setError('');

      let allItems: ReminderDetail[] = [];
      let cursor: string | null = null;

      do {
        const data = await getReminders(businessId, cursor ?? undefined);
        allItems = [...allItems, ...(data.items || [])];
        cursor = data.next_cursor;
      } while (cursor);

      setReminders(allItems);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to fetch reminders');
    } finally {
      setLoading(false);
    }
  }, [businessId]);

  useEffect(() => {
    if (businessId) fetchReminders();
  }, [businessId, fetchReminders]);

  // Client-side filtering
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

    if (statusFilter !== 'ALL') {
      result = result.filter((r) => r.status === statusFilter);
    }

    if (channelFilter !== 'ALL') {
      result = result.filter((r) => r.channel === channelFilter);
    }

    // Overdue / today / upcoming filter
    if (timeFilter !== 'ALL') {
      const now = new Date();
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

      result = result.filter((r) => {
        if (!r.scheduledAt) return false;
        const scheduled = new Date(r.scheduledAt);

        if (timeFilter === 'OVERDUE') {
          return scheduled < todayStart && r.status === 'SCHEDULED';
        }
        if (timeFilter === 'TODAY') {
          return scheduled >= todayStart && scheduled <= todayEnd;
        }
        if (timeFilter === 'UPCOMING') {
          return scheduled > todayEnd;
        }
        return true;
      });
    }

    // Date range filter
    if (dateFrom) {
      const from = new Date(dateFrom);
      from.setHours(0, 0, 0, 0);
      result = result.filter((r) => r.scheduledAt && new Date(r.scheduledAt) >= from);
    }

    if (dateTo) {
      const to = new Date(dateTo);
      to.setHours(23, 59, 59, 999);
      result = result.filter((r) => r.scheduledAt && new Date(r.scheduledAt) <= to);
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

  // Handlers
  const handleView = (reminderId: string) => {
    setFormDrawerOpen(false);
    setEditingReminderId(null);
    setSelectedReminderId(reminderId);
    setDrawerOpen(true);
  };

  const handleCreate = () => {
    setSelectedReminderId(null);
    setDrawerOpen(false);
    setEditingReminderId(null);
    setFormDrawerOpen(true);
  };

  const handleEdit = (reminderId: string) => {
    setSelectedReminderId(null);
    setDrawerOpen(false);
    setEditingReminderId(reminderId);
    setFormDrawerOpen(true);
  };

  const handleDrawerClose = () => {
    setDrawerOpen(false);
    setSelectedReminderId(null);
  };

  const handleDeleteRequest = (reminderId: string, taskTitle: string) => {
    setDeleteTarget({ id: reminderId, title: taskTitle });
  };

  const handleDeleteConfirm = async () => {
    if (!businessId || !deleteTarget) return;

    try {
      setDeleteLoading(true);
      setError('');
      await deleteReminder(businessId, deleteTarget.id);
      setDeleteTarget(null);
      await fetchReminders();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to delete reminder');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setStatusFilter('ALL');
    setChannelFilter('ALL');
    setTimeFilter('ALL');
    setDateFrom('');
    setDateTo('');
  };

  // Loading guard
  if (!businessId || (loading && reminders.length === 0)) {
    return <PageSkeleton filterCount={4} />;
  }

  return (
    <div className="min-h-screen bg-bg py-8">
      <div className="mx-auto max-w-7xl space-y-6 px-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-txt-main">Reminders</h1>
            <p className="mt-1 text-sm text-txt-sub">
              Manage and monitor all reminder notifications
            </p>
          </div>

          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-xl bg-navy hover:bg-navy-hover px-4 py-2.5 text-sm font-semibold text-white shadow-xs transition-colors cursor-pointer"
            onClick={handleCreate}
          >
            <Plus className="h-4 w-4" />
            <span>Create Reminder</span>
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div role="alert" className="alert alert-error flex items-center justify-between text-sm">
            <span>{error}</span>
            <button
              type="button"
              className="btn btn-ghost btn-xs btn-circle"
              aria-label="Dismiss error"
              onClick={() => setError('')}
            >
              <X className="h-4 w-4" />
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
            if (dateTo && value && new Date(value) > new Date(dateTo)) {
              setDateTo('');
            }
          }}
          dateTo={dateTo}
          onDateToChange={setDateTo}
          onReset={handleResetFilters}
        />

        {/* Results count */}
        {!loading && (
          <p className="text-sm text-txt-sub">
            Showing {filteredReminders.length} of {reminders.length} reminders
          </p>
        )}

        {/* Table using CommonDataGrid */}
        <RemindersTable
          reminders={filteredReminders}
          loading={loading}
          businessId={businessId}
          onView={handleView}
          onEdit={handleEdit}
          onDelete={handleDeleteRequest}
          onRefresh={fetchReminders}
        />

        {/* View Details Drawer */}
        <ReminderDetailsDrawer
          open={drawerOpen}
          onClose={handleDrawerClose}
          reminderId={selectedReminderId}
          businessId={businessId}
          onEdit={handleEdit}
        />

        {/* Unified Form Drawer (Create & Update) */}
        <ReminderFormDrawer
          open={formDrawerOpen}
          onClose={() => {
            setFormDrawerOpen(false);
            setEditingReminderId(null);
          }}
          reminderId={editingReminderId}
          businessId={businessId}
          organizationId={orgId ?? ''}
          onSuccess={() => {
            fetchReminders();
            setFormDrawerOpen(false);
            setEditingReminderId(null);
          }}
        />

        {/* Delete Confirmation Dialog */}
        <ConfirmDialog
          open={!!deleteTarget}
          title="Delete Reminder"
          description={
            <>
              Are you sure you want to delete the reminder for{' '}
              <strong>{deleteTarget?.title}</strong>? This action cannot be undone.
            </>
          }
          confirmLabel="Delete"
          variant="danger"
          loading={deleteLoading}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeleteTarget(null)}
        />
      </div>
    </div>
  );
}

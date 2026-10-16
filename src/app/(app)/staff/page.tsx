'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import {
  Plus,
  Users,
  Loader2,
  AlertCircle,
  X,
  UserCheck,
  UserX,
  ShieldAlert,
  Shield,
  Layers,
} from 'lucide-react';

import { useWorkspace } from '@/context/WorkspaceContext';
import AddStaffDialog from '@/components/staff/AddStaffDialog';
import StaffTable from '@/components/staff/StaffTable';
import StaffFilter from '@/components/staff/StaffFilter';
import StaffDetailsDrawer from '@/components/staff/StaffDetailsDrawer';
import EditStaffDialog from '@/components/staff/EditStaffDialog';
import ConfirmDialog from '@/components/tasks/ConfirmDialog';

import { getStaff, deleteStaff } from '@/services/staffService';
import { StaffMember, StaffDetails } from '@/types/staff.types';
import { StaffStatusFilter } from '@/constants/staffConstants';

export default function StaffPage() {
  const { businessId } = useWorkspace();

  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Dialog & Drawer states
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [selectedMembershipId, setSelectedMembershipId] = useState<string | null>(null);
  const [editStaffData, setEditStaffData] = useState<StaffDetails | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Confirm delete dialog state
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StaffStatusFilter>('ALL');
  const [roleFilter, setRoleFilter] = useState('');

  const fetchStaff = useCallback(async () => {
    if (!businessId) return;

    try {
      setLoading(true);
      setError('');

      const data = await getStaff(businessId);
      setStaff(Array.isArray(data) ? data : []);
    } catch (err: unknown) {
      console.error('Fetch staff error:', err);
      setStaff([]);
      setError(
        err instanceof Error ? err.message : 'Failed to load staff members. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  }, [businessId]);

  useEffect(() => {
    if (businessId) {
      fetchStaff();
    }
  }, [businessId, fetchStaff]);

  // Derived Summary Metrics
  const activeCount = useMemo(() => {
    return staff.filter((m) => m.status === 'ACTIVE').length;
  }, [staff]);

  const inactiveCount = useMemo(() => {
    return staff.filter((m) => m.status === 'INACTIVE').length;
  }, [staff]);

  const adminCount = useMemo(() => {
    return staff.filter((m) => {
      const r = (m.roles?.[0] || m.role || '').toUpperCase();
      return r === 'ADMIN' || r === 'OWNER';
    }).length;
  }, [staff]);

  const filteredStaff = useMemo(() => {
    if (!Array.isArray(staff)) return [];

    let filtered = [...staff];

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (member) =>
          member.userName?.toLowerCase().includes(query) ||
          member.firstName?.toLowerCase().includes(query) ||
          member.lastName?.toLowerCase().includes(query) ||
          member.email?.toLowerCase().includes(query) ||
          member.phone?.includes(query) ||
          member.phoneMasked?.includes(query)
      );
    }

    if (statusFilter === 'ACTIVE') {
      filtered = filtered.filter((member) => member.status === 'ACTIVE');
    }

    if (statusFilter === 'INACTIVE') {
      filtered = filtered.filter((member) => member.status === 'INACTIVE');
    }

    if (roleFilter.trim() && roleFilter !== 'ALL') {
      filtered = filtered.filter((member) =>
        (member.roles?.[0] || member.role || '')
          .toLowerCase()
          .includes(roleFilter.toLowerCase())
      );
    }

    return filtered;
  }, [staff, searchQuery, statusFilter, roleFilter]);

  const handleView = (membershipId: string) => {
    setSelectedMembershipId(membershipId);
    setDrawerOpen(true);
  };

  const handleEdit = (membershipId: string) => {
    const member = staff.find((item) => item.id === membershipId);

    if (member) {
      const details: StaffDetails = {
        id: member.id,
        userId: member.userId,
        userName: member.userName,
        status: member.status,
        role: member.roles?.[0] || member.role || '',
        roles: member.roles || (member.role ? [member.role] : []),
        avatarUrl: null,
        lastActiveAt: member.updatedAt || null,
        contact: {
          email: member.email,
          phone: member.phone,
          phoneMasked: member.phoneMasked,
          firstName: member.firstName ?? '',
          lastName: member.lastName ?? '',
        },
      };

      setEditStaffData(details);
    }

    setSelectedMembershipId(membershipId);
    setOpenEditDialog(true);
    setDrawerOpen(false);
  };

  const handleDeleteRequest = (membershipId: string, staffName: string) => {
    setDeleteTarget({ id: membershipId, name: staffName });
  };

  const handleConfirmDelete = async () => {
    if (!businessId || !deleteTarget) return;

    try {
      setDeleteLoading(true);
      setError('');

      await deleteStaff(businessId, deleteTarget.id);

      setStaff((prev) => prev.filter((m) => m.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch (err: unknown) {
      console.error('Delete staff error:', err);
      setError(
        err instanceof Error ? err.message : 'Failed to remove staff member. Please try again.'
      );
    } finally {
      setDeleteLoading(false);
    }
  };

  if (!businessId) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-[var(--primary)]" />
          <p className="text-sm font-semibold text-[var(--text-secondary)]">
            Loading team workspace...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg)] pb-16 pt-6 text-[var(--text-primary)]">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="space-y-6">

          {/* Breadcrumbs & Top Bar */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)]">
              <Link href="/dashboard" className="transition-colors hover:text-[var(--primary)]">
                Dashboard
              </Link>
              <span>/</span>
              <span className="font-semibold text-[var(--text-primary)]">Staff Members</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
              </span>
              <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                Practice Directory Active • {staff.length} Total
              </span>
            </div>
          </div>

          {/* Page Header Banner */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3.5">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--primary)] text-white shadow-sm dark:bg-[var(--accent)] dark:text-[#0b1220]">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <h1 className="text-2xl font-black tracking-tight text-[var(--heading)] sm:text-3xl">
                  Staff Members
                </h1>
                <p className="mt-0.5 text-xs text-[var(--text-secondary)] sm:text-sm">
                  Manage your firm&apos;s team, assign compliance responsibilities, and monitor member workloads.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setOpenAddDialog(true)}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--primary)] px-4 py-2.5 text-xs font-bold text-white shadow-sm transition-all hover:bg-[var(--primary-hover)] hover:shadow-md dark:bg-[var(--accent)] dark:text-[#0b1220] dark:hover:bg-[var(--accent-hover)]"
            >
              <Plus className="h-4 w-4" />
              <span>Add Staff</span>
            </button>
          </div>

          {/* Summary Stat Cards Banner (Matching tasks and task-definitions architecture) */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-sm">
              <div className="flex items-center justify-between text-blue-600">
                <Users className="h-4 w-4" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)]">
                  Total Team
                </span>
              </div>
              <div className="mt-2 text-2xl font-black text-[var(--heading)]">
                {staff.length}
              </div>
              <div className="mt-0.5 text-[11px] text-[var(--text-secondary)]">
                Registered profiles
              </div>
            </div>

            <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-sm">
              <div className="flex items-center justify-between text-emerald-600">
                <UserCheck className="h-4 w-4" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)]">
                  Active
                </span>
              </div>
              <div className="mt-2 text-2xl font-black text-emerald-600">
                {activeCount}
              </div>
              <div className="mt-0.5 text-[11px] text-[var(--text-secondary)]">
                Ready for task assignment
              </div>
            </div>

            <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-sm">
              <div className="flex items-center justify-between text-slate-500">
                <UserX className="h-4 w-4" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)]">
                  Inactive
                </span>
              </div>
              <div className="mt-2 text-2xl font-black text-slate-600 dark:text-slate-400">
                {inactiveCount}
              </div>
              <div className="mt-0.5 text-[11px] text-[var(--text-secondary)]">
                Access suspended
              </div>
            </div>

            <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-sm">
              <div className="flex items-center justify-between text-purple-600">
                <Shield className="h-4 w-4" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)]">
                  Admins / Owners
                </span>
              </div>
              <div className="mt-2 text-2xl font-black text-purple-600">
                {adminCount}
              </div>
              <div className="mt-0.5 text-[11px] text-[var(--text-secondary)]">
                Full authority
              </div>
            </div>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="flex items-start justify-between gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-xs text-red-800 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300">
              <div className="flex items-start gap-2.5">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
              <button
                type="button"
                onClick={() => setError('')}
                className="text-red-600 hover:text-red-800 dark:text-red-400"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}

          {/* Filter Bar */}
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-sm">
            <StaffFilter
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              statusFilter={statusFilter}
              onStatusChange={setStatusFilter}
              roleFilter={roleFilter}
              onRoleChange={setRoleFilter}
              onReset={() => {
                setSearchQuery('');
                setStatusFilter('ALL');
                setRoleFilter('');
              }}
            />
          </div>

          {/* Results Summary */}
          {!loading && (
            <div className="flex items-center justify-between text-xs text-[var(--text-secondary)] px-1">
              <span>
                Showing <strong>{filteredStaff.length}</strong> of <strong>{staff.length}</strong> staff members
              </span>
            </div>
          )}

          {/* Staff Table (Modern CommonDataGrid) */}
          <div className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-sm">
            <StaffTable
              staff={filteredStaff}
              loading={loading}
              onView={handleView}
              onEdit={handleEdit}
              onDelete={handleDeleteRequest}
            />
          </div>

          {/* Add Staff Drawer */}
          <AddStaffDialog
            open={openAddDialog}
            onClose={() => setOpenAddDialog(false)}
            businessId={businessId}
            onSuccess={fetchStaff}
          />

          {/* Staff Details Drawer */}
          <StaffDetailsDrawer
            open={drawerOpen}
            onClose={() => {
              setDrawerOpen(false);
              setSelectedMembershipId(null);
            }}
            membershipId={selectedMembershipId}
            businessId={businessId}
            onEdit={handleEdit}
          />

          {/* Edit Staff Drawer */}
          <EditStaffDialog
            open={openEditDialog}
            onClose={() => {
              setOpenEditDialog(false);
              setSelectedMembershipId(null);
              setEditStaffData(null);
            }}
            membershipId={selectedMembershipId}
            businessId={businessId}
            onSuccess={fetchStaff}
            staffData={editStaffData}
          />

          {/* Delete Confirmation Modal */}
          <ConfirmDialog
            open={Boolean(deleteTarget)}
            title="Remove Staff Member"
            description={
              deleteTarget
                ? `Are you sure you want to remove "${deleteTarget.name}" from your firm? This member will immediately lose access to workspace tasks, clients, and reminder schedules.`
                : ''
            }
            confirmLabel={deleteLoading ? 'Removing...' : 'Yes, Remove Member'}
            cancelLabel="Cancel"
            loading={deleteLoading}
            variant="danger"
            onConfirm={handleConfirmDelete}
            onCancel={() => !deleteLoading && setDeleteTarget(null)}
          />

        </div>
      </div>
    </div>
  );
}

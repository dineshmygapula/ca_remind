'use client';

import { useMemo } from 'react';
import { Eye, Pencil, Trash2, Mail, Phone, UserX } from 'lucide-react';
import CommonDataGrid, { GridAction, GridColumn } from '@/components/common/CommonTable';
import { StaffMember } from '@/types/staff.types';

interface StaffTableProps {
  staff: StaffMember[];
  loading: boolean;
  onView: (membershipId: string) => void;
  onEdit: (membershipId: string) => void;
  onDelete: (membershipId: string, staffName: string) => void;
}

// ── Helpers ──

const getFullName = (member: StaffMember) => {
  return (
    member.userName ||
    `${member.firstName ?? ''} ${member.lastName ?? ''}`.trim() ||
    member.email ||
    'Unknown User'
  );
};

const getInitials = (name?: string) => {
  if (!name) return '??';
  return name
    .split(' ')
    .filter(Boolean)
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

function StaffRoleBadge({ role }: { role?: string }) {
  if (!role) return <span className="text-slate-400 text-xs">—</span>;
  const upper = role.toUpperCase();

  if (upper === 'ADMIN' || upper === 'OWNER') {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
        {upper}
      </span>
    );
  }
  if (upper === 'MANAGER') {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
        {upper}
      </span>
    );
  }
  if (upper === 'ACCOUNTANT') {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
        {upper}
      </span>
    );
  }

  return (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
      {role}
    </span>
  );
}

function StaffStatusBadge({ status }: { status: 'ACTIVE' | 'INACTIVE' }) {
  if (status === 'ACTIVE') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
        <span>Active</span>
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
      <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
      <span>Inactive</span>
    </span>
  );
}

export default function StaffTable({
  staff,
  loading,
  onView,
  onEdit,
  onDelete,
}: StaffTableProps) {
  const columns: GridColumn<StaffMember>[] = useMemo(
    () => [
      {
        headerName: 'Staff Member',
        field: 'userName',
        minWidth: 240,
        flex: 1.5,
        cellRenderer: (params) => {
          const member = params.data;
          if (!member) return null;
          const fullName = getFullName(member);
          const initials = getInitials(fullName);
          const isActive = member.status === 'ACTIVE';

          return (
            <div className="flex items-center gap-3 py-1">
              <div
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl font-bold text-xs ${
                  isActive
                    ? 'bg-[var(--primary)]/10 text-[var(--primary)] dark:bg-[var(--accent)]/15 dark:text-[var(--accent)]'
                    : 'bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500'
                }`}
              >
                {isActive ? initials : <UserX className="h-4 w-4" />}
              </div>
              <div className="min-w-0">
                <div className="font-bold text-sm text-[var(--heading)] truncate">
                  {fullName}
                </div>
                {member.userName && member.userName !== fullName && (
                  <div className="text-[11px] text-[var(--text-secondary)] truncate">
                    @{member.userName}
                  </div>
                )}
              </div>
            </div>
          );
        },
      },
      {
        headerName: 'Email Address',
        field: 'email',
        minWidth: 200,
        flex: 1.2,
        cellRenderer: (params) => {
          const email = params.data?.email;
          if (!email) return <span className="text-slate-400 text-xs">—</span>;
          return (
            <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)]">
              <Mail className="h-3.5 w-3.5 text-slate-400 shrink-0" />
              <span className="truncate">{email}</span>
            </div>
          );
        },
      },
      {
        headerName: 'Phone Number',
        field: 'phone',
        minWidth: 160,
        flex: 1,
        cellRenderer: (params) => {
          const phone = params.data?.phone || params.data?.phoneMasked;
          if (!phone) return <span className="text-slate-400 text-xs">—</span>;
          return (
            <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)]">
              <Phone className="h-3.5 w-3.5 text-slate-400 shrink-0" />
              <span>{phone}</span>
            </div>
          );
        },
      },
      {
        headerName: 'Role',
        field: 'role',
        minWidth: 140,
        flex: 0.9,
        cellRenderer: (params) => {
          const role = params.data?.roles?.[0] || params.data?.role;
          return <StaffRoleBadge role={role} />;
        },
      },
      {
        headerName: 'Status',
        field: 'status',
        minWidth: 120,
        flex: 0.8,
        cellRenderer: (params) => {
          const status = params.data?.status || 'ACTIVE';
          return <StaffStatusBadge status={status} />;
        },
      },
    ],
    []
  );

  const actions: GridAction<StaffMember>[] = useMemo(
    () => [
      {
        label: 'View Details',
        icon: <Eye className="h-4 w-4" />,
        variant: 'secondary',
        onClick: (member) => onView(member.id),
      },
      {
        label: 'Edit Role & Info',
        icon: <Pencil className="h-4 w-4" />,
        variant: 'secondary',
        onClick: (member) => onEdit(member.id),
      },
      {
        label: 'Remove Staff',
        icon: <Trash2 className="h-4 w-4" />,
        variant: 'danger',
        onClick: (member) => onDelete(member.id, getFullName(member)),
      },
    ],
    [onView, onEdit, onDelete]
  );

  return (
    <div className="w-full">
      <CommonDataGrid
        rowData={staff}
        columns={columns}
        actions={actions}
        isLoading={loading}
        onRowClick={(row) => onView(row.id)}
        emptyMessage="No staff members found matching your search or filters."
        paginationPageSize={10}
        rowHeight={56}
      />
    </div>
  );
}

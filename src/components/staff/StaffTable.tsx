'use client';

import React, { useMemo } from 'react';
import { Eye, Trash2, Mail, Phone, UserX } from 'lucide-react';
import CommonDataGrid, { GridAction, GridColumn, createTableActions } from '@/components/common/CommonTable';
import { StaffMember, UpdateStaffDto } from '@/types/staff.types';
import { updateStaff } from '@/services/staffService';

interface StaffTableProps {
  staff: StaffMember[];
  loading: boolean;
  businessId?: string;
  onView: (membershipId: string) => void;
  onDelete: (membershipId: string, staffName: string) => void;
  onRefresh?: () => void;
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
      <span className="inline-block px-3 py-0.5 rounded-full text-xs font-semibold bg-[#f5f3ff] text-[#6d28d9] dark:bg-purple-950/40 dark:text-purple-300 border border-purple-200/60 dark:border-purple-800/40">
        {upper}
      </span>
    );
  }
  if (upper === 'MANAGER') {
    return (
      <span className="inline-block px-3 py-0.5 rounded-full text-xs font-semibold bg-[#eff6ff] text-[#1d4ed8] dark:bg-blue-950/40 dark:text-blue-300 border border-blue-200/60 dark:border-blue-800/40">
        {upper}
      </span>
    );
  }
  if (upper === 'ACCOUNTANT') {
    return (
      <span className="inline-block px-3 py-0.5 rounded-full text-xs font-semibold bg-[#ecfdf5] text-[#047857] dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/40">
        {upper}
      </span>
    );
  }

  return (
    <span className="inline-block px-3 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700">
      {role}
    </span>
  );
}

function StaffStatusBadge({ status }: { status: 'ACTIVE' | 'INACTIVE' }) {
  if (status === 'ACTIVE') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#ecfdf5] text-[#047857] dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200/60">
        <span className="h-1.5 w-1.5 rounded-full bg-[#10b981]" />
        <span>Active</span>
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border border-slate-200/60">
      <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
      <span>Inactive</span>
    </span>
  );
}

export default function StaffTable({
  staff,
  loading,
  businessId,
  onView,
  onDelete,
  onRefresh,
}: StaffTableProps) {
  const columns: GridColumn<StaffMember>[] = useMemo(
    () => [
      {
        headerName: 'Staff Member',
        field: 'userName',
        minWidth: 260,
        flex: 2.2,
        editable: true,
        cellRenderer: (params) => {
          const member = params.data;
          if (!member) return null;
          const displayUserName = params.value || member.userName;
          const fullName =
            displayUserName ||
            `${member.firstName ?? ''} ${member.lastName ?? ''}`.trim() ||
            member.email ||
            'Unknown User';
          const initials = getInitials(fullName);
          const isActive = (member.status || 'ACTIVE') === 'ACTIVE';

          return (
            <div className="flex items-center gap-3 py-1">
              <span
                className={`w-11 h-9 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 border border-blue-200/50'
                    : 'bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500 border border-slate-200/50'
                }`}
              >
                {isActive ? initials : <UserX className="h-4 w-4" />}
              </span>
              <div className="flex flex-col min-w-0">
                <span className="font-bold text-sm text-[var(--primary)] dark:text-slate-100 truncate">
                  {fullName}
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400 truncate">
                  {displayUserName && displayUserName !== fullName
                    ? `@${displayUserName}`
                    : member.email || 'Team member'}
                </span>
              </div>
            </div>
          );
        },
      },
      {
        headerName: 'Email Address',
        field: 'email',
        minWidth: 200,
        flex: 1.4,
        cellRenderer: (params) => {
          const email = params.data?.email;
          if (!email) return <span className="text-slate-400 text-xs">—</span>;
          return (
            <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
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
        flex: 1.1,
        editable: true,
        cellRenderer: (params) => {
          const phone = params.value || params.data?.phone || params.data?.phoneMasked;
          if (!phone) return <span className="text-slate-400 text-xs">—</span>;
          return (
            <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
              <Phone className="h-3.5 w-3.5 text-slate-400 shrink-0" />
              <span className="font-mono">{phone}</span>
            </div>
          );
        },
      },
      {
        headerName: 'Role',
        field: 'role',
        minWidth: 140,
        flex: 1,
        editable: true,
        cellEditor: 'agSelectCellEditor',
        cellEditorParams: {
          values: ['Accountant', 'Manager', 'Admin'],
        },
        cellRenderer: (params) => {
          const role = params.value || params.data?.roles?.[0] || params.data?.role;
          return <StaffRoleBadge role={role} />;
        },
      },
      {
        headerName: 'Status',
        field: 'status',
        minWidth: 120,
        flex: 0.9,
        editable: true,
        cellEditor: 'agSelectCellEditor',
        cellEditorParams: {
          values: ['ACTIVE', 'INACTIVE'],
        },
        valueFormatter: (p) =>
          p.value === 'ACTIVE' || p.value === true ? 'ACTIVE' : 'INACTIVE',
        cellRenderer: (params) => {
          const status = (params.value || params.data?.status || 'ACTIVE') as
            | 'ACTIVE'
            | 'INACTIVE';
          return <StaffStatusBadge status={status} />;
        },
      },
    ],
    []
  );

  const actions: GridAction<StaffMember>[] = useMemo(
    () =>
      createTableActions<StaffMember>({
        onView: (member) => onView(member.id),
        onDelete: (member) => onDelete(member.id, getFullName(member)),
      }),
    [onView, onDelete]
  );

  return (
    <CommonDataGrid<StaffMember>
      rowData={staff}
      columns={columns}
      actions={actions}
      isLoading={loading}
      emptyMessage="No staff members found matching your search or filters."
      rowHeight={64}
      onUpdateCell={async ({ row, field, newValue }) => {
        if (!businessId) return;
        const dto: UpdateStaffDto = {};
        if (field === 'role') {
          dto.membership = { roles: [String(newValue)] };
        } else if (field === 'status') {
          dto.membership = { isActive: newValue === 'ACTIVE' || newValue === true };
        } else if (field === 'phone') {
          dto.user = { phone: String(newValue).trim() };
        } else if (field === 'userName') {
          dto.user = { userName: String(newValue).trim() };
        }
        await updateStaff(businessId, row.id, dto);
        onRefresh?.();
      }}
    />
  );
}


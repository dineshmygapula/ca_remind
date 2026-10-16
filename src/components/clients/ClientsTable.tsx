'use client';

import React, { useState, useMemo } from 'react';
import { Eye, Pencil, Trash2, Mail, Phone, Building2, X, ShieldCheck } from 'lucide-react';
import CommonDataGrid, { GridAction, GridColumn } from '@/components/common/CommonTable';
import { SubjectListItem } from '@/types/subject';
import { updateSubject } from '@/services/subjectService';

interface ClientsTableProps {
  clients: SubjectListItem[];
  loading: boolean;
  businessId: string;
  onView: (clientId: string) => void;
  onEdit: (clientId: string) => void;
  onDelete: (clientId: string, clientName: string) => void;
  onRefresh?: () => void;
}

// ─── Helpers ─────────────────────────────────────────────────
const getInitials = (name?: string) => {
  if (!name) return 'CL';
  return name
    .split(' ')
    .filter(Boolean)
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

const COMPLIANCE_STYLES: Record<
  string,
  { bg: string; text: string; border: string }
> = {
  gst: {
    bg: 'bg-slate-100 dark:bg-slate-800',
    text: 'text-slate-700 dark:text-slate-300',
    border: 'border-slate-200/60 dark:border-slate-700',
  },
  tds: {
    bg: 'bg-blue-50 dark:bg-blue-950/40',
    text: 'text-blue-700 dark:text-blue-300',
    border: 'border-blue-200/60 dark:border-blue-800/40',
  },
  itr: {
    bg: 'bg-indigo-50 dark:bg-indigo-950/40',
    text: 'text-indigo-700 dark:text-indigo-300',
    border: 'border-indigo-200/60 dark:border-indigo-800/40',
  },
  roc: {
    bg: 'bg-purple-50 dark:bg-purple-950/40',
    text: 'text-purple-700 dark:text-purple-300',
    border: 'border-purple-200/60 dark:border-purple-800/40',
  },
  msme: {
    bg: 'bg-amber-50 dark:bg-amber-950/40',
    text: 'text-amber-700 dark:text-amber-300',
    border: 'border-amber-200/60 dark:border-amber-800/40',
  },
};

function getComplianceStyle(name: string) {
  const key = name.toLowerCase();
  return (
    COMPLIANCE_STYLES[key] || {
      bg: 'bg-slate-100 dark:bg-slate-800',
      text: 'text-slate-700 dark:text-slate-300',
      border: 'border-slate-200/60 dark:border-slate-700',
    }
  );
}

function StatusBadge({ active }: { active: boolean }) {
  if (active) {
    return (
      <span className="inline-flex items-center justify-center h-6 gap-1.5 px-2.5 rounded-full text-xs font-semibold leading-none bg-[#ecfdf5] text-[#047857] dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200/60 shrink-0">
        <span className="w-1.5 h-1.5 rounded-full bg-[#10b981]" />
        <span>Active</span>
      </span>
    );
  }

  return (
    <span className="inline-flex items-center justify-center h-6 gap-1.5 px-2.5 rounded-full text-xs font-semibold leading-none bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border border-slate-200/60 shrink-0">
      <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
      <span>Inactive</span>
    </span>
  );
}

// ─── Main Component ──────────────────────────────────────────
export default function ClientsTable({
  clients,
  loading,
  businessId,
  onView,
  onEdit,
  onDelete,
  onRefresh,
}: ClientsTableProps) {
  // Popover state for showing all compliances when user clicks "+N more"
  const [compliancesModal, setCompliancesModal] = useState<{
    clientName: string;
    compliances: string[];
  } | null>(null);

  const columns: GridColumn<SubjectListItem>[] = useMemo(
    () => [
      {
        headerName: 'Client',
        field: 'displayName',
        minWidth: 250,
        flex: 2.2,
        cellRenderer: (p) => {
          const row = p.data;
          if (!row) return null;

          const displayName = row.displayName || row.name || 'Unnamed Client';
          const businessName = row.businessName;
          const initials = getInitials(displayName);

          return (
            <div className="flex items-center gap-3 py-1">
              <span className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 border border-blue-200/60">
                {initials}
              </span>
              <div className="flex flex-col min-w-0">
                <span className="font-bold text-sm text-[var(--primary)] dark:text-slate-100 truncate">
                  {displayName}
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400 truncate flex items-center gap-1">
                  {businessName ? (
                    <>
                      <Building2 className="w-3 h-3 text-slate-400 shrink-0" />
                      <span>{businessName}</span>
                    </>
                  ) : (
                    'Individual Client'
                  )}
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
        flex: 1.3,
        cellRenderer: (p) => {
          const email = p.value;
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
        minWidth: 170,
        flex: 1.1,
        cellRenderer: (p) => {
          const phone = p.value;
          if (!phone) return <span className="text-slate-400 text-xs">—</span>;
          return (
            <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-700 dark:text-slate-300 font-mono">
              <Phone className="h-3.5 w-3.5 text-slate-400 shrink-0" />
              <span>{phone}</span>
            </div>
          );
        },
      },
      {
        headerName: 'GSTIN',
        field: 'gstin',
        minWidth: 155,
        flex: 1,
        cellRenderer: (p) => {
          if (!p.value) return <span className="text-slate-400 text-xs">—</span>;
          return (
            <span className="inline-flex items-center justify-center h-6 font-mono text-xs font-semibold px-2.5 rounded-lg leading-none border border-divider bg-bg/80 text-txt-main shrink-0">
              {p.value}
            </span>
          );
        },
      },
      {
        headerName: 'Compliances',
        field: 'activeCompliances',
        minWidth: 210,
        flex: 1.4,
        cellRenderer: (p) => {
          const list: string[] = Array.isArray(p.value) ? p.value : [];
          if (list.length === 0) {
            return <span className="text-slate-400 text-xs">No services</span>;
          }

          // Show maximum 2 items, then "+N more" button on overflow
          const MAX_VISIBLE = 2;
          const visible = list.slice(0, MAX_VISIBLE);
          const remaining = list.length - MAX_VISIBLE;

          return (
            <div className="flex items-center h-full gap-1.5 whitespace-nowrap overflow-hidden py-1">
              {visible.map((c) => {
                const style = getComplianceStyle(c);
                return (
                  <span
                    key={c}
                    className={`inline-flex items-center justify-center h-6 px-2.5 rounded-full text-xs font-semibold leading-none border shrink-0 ${style.bg} ${style.text} ${style.border}`}
                  >
                    {c}
                  </span>
                );
              })}

              {remaining > 0 && (
                <button
                  type="button"
                  title="Click to view all compliances"
                  onClick={(e) => {
                    e.stopPropagation();
                    setCompliancesModal({
                      clientName: p.data?.displayName || p.data?.name || 'Client',
                      compliances: list,
                    });
                  }}
                  className="cursor-pointer inline-flex items-center justify-center h-6 px-2.5 rounded-full text-xs font-semibold leading-none bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-300/80 dark:border-slate-700 transition-colors shrink-0 shadow-2xs"
                >
                  +{remaining} more
                </button>
              )}
            </div>
          );
        },
      },
      {
        headerName: 'Status',
        field: 'isActive',
        minWidth: 120,
        flex: 0.9,
        editable: true,
        cellEditor: 'agSelectCellEditor',
        cellEditorParams: {
          values: ['Active', 'Inactive'],
        },
        valueFormatter: (p) => (p.value ? 'Active' : 'Inactive'),
        cellRenderer: (p) => <StatusBadge active={Boolean(p.data?.isActive)} />,
      },
    ],
    []
  );

  const actions: GridAction<SubjectListItem>[] = [
    {
      label: 'View',
      icon: <Eye className="h-4 w-4" />,
      variant: 'primary',
      onClick: (row) => onView(row.id),
    },
    {
      label: 'Edit',
      icon: <Pencil className="h-4 w-4" />,
      variant: 'secondary',
      onClick: (row) => onEdit(row.id),
    },
    {
      label: 'Delete',
      icon: <Trash2 className="h-4 w-4" />,
      variant: 'danger',
      onClick: (row) => onDelete(row.id, row.displayName || 'Client'),
    },
  ];

  return (
    <>
      <CommonDataGrid<SubjectListItem>
        rowData={clients}
        columns={columns}
        actions={actions}
        isLoading={loading}
        rowHeight={64}
        onRowClick={(row) => onView(row.id)}
        onRowDoubleClick={(row) => onEdit(row.id)}
        onUpdateCell={async ({ row, field, newValue }) => {
          if (!businessId) return;
          const valToSave = field === 'isActive' ? newValue === 'Active' : newValue;
          await updateSubject(businessId, row.id, {
            [field]: valToSave,
          });
          onRefresh?.();
        }}
        emptyMessage="No clients found"
      />

      {/* ── Compliances Popup Modal on Click of "+N more" ── */}
      {compliancesModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-fade-in"
          onClick={() => setCompliancesModal(null)}
        >
          <div
            className="w-full max-w-sm rounded-2xl border border-divider bg-surface p-6 shadow-xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-divider">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-navy dark:text-gold" />
                <h3 className="font-bold text-base text-txt-main">
                  Active Compliances
                </h3>
              </div>
              <button
                type="button"
                aria-label="Close"
                onClick={() => setCompliancesModal(null)}
                className="cursor-pointer rounded-full p-1.5 text-txt-sub hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <p className="text-xs text-txt-sub mb-3">
                All registered compliances for{' '}
                <strong className="text-txt-main">
                  {compliancesModal.clientName}
                </strong>
                :
              </p>
              <div className="flex flex-wrap gap-2">
                {compliancesModal.compliances.map((c) => {
                  const style = getComplianceStyle(c);
                  return (
                    <span
                      key={c}
                      className={`inline-flex px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${style.bg} ${style.text} ${style.border}`}
                    >
                      {c}
                    </span>
                  );
                })}
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setCompliancesModal(null)}
                className="cursor-pointer rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 px-4 py-2 text-xs font-semibold text-txt-main transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

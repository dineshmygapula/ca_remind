'use client';

import { useMemo } from 'react';
import { Eye, Pencil, Trash2 } from 'lucide-react';
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

const COMPLIANCE_STYLES: Record<string, { bg: string; text: string; border: string }> = {
  gst: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
  tds: { bg: 'bg-slate-100', text: 'text-slate-700', border: 'border-slate-200' },
  itr: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
  roc: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
  msme: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
};

export default function ClientsTable({
  clients,
  loading,
  businessId,
  onView,
  onEdit,
  onDelete,
  onRefresh,
}: ClientsTableProps) {
  const columns: GridColumn<SubjectListItem>[] = useMemo(
    () => [
      {
        headerName: 'Client Name',
        field: 'displayName',
        minWidth: 200,
        flex: 2,
        cellRenderer: (p) => (
          <span className="font-semibold text-txt-main">
            {p.value || '—'}
          </span>
        ),
      },
      {
        headerName: 'Business Name',
        field: 'businessName',
        minWidth: 170,
        cellRenderer: (p) => (
          <span className="text-txt-sub">
            {p.value || '—'}
          </span>
        ),
      },
      {
        headerName: 'Email',
        field: 'email',
        minWidth: 180,
        cellRenderer: (p) => (
          <span className="text-txt-sub">
            {p.value || '—'}
          </span>
        ),
      },
      {
        headerName: 'Phone',
        field: 'phone',
        minWidth: 140,
        cellRenderer: (p) => (
          <span className="font-mono text-xs text-txt-main">
            {p.value || '—'}
          </span>
        ),
      },
      {
        headerName: 'GSTIN',
        field: 'gstin',
        minWidth: 160,
        cellRenderer: (p) => {
          if (!p.value) return <span className="text-txt-sub/50">—</span>;
          return (
            <span className="inline-flex font-mono text-[11px] font-semibold px-2 py-0.5 rounded border border-[var(--border)] bg-[var(--surface-subtle)] text-txt-main">
              {p.value}
            </span>
          );
        },
      },
      {
        headerName: 'Compliances',
        field: 'activeCompliances',
        minWidth: 190,
        cellRenderer: (p) => {
          const list: string[] = Array.isArray(p.value) ? p.value : [];
          if (list.length === 0) {
            return <span className="text-txt-sub/40 text-xs">No services</span>;
          }
          return (
            <div className="flex flex-wrap items-center gap-1 py-1">
              {list.map((c) => {
                const style = COMPLIANCE_STYLES[c.toLowerCase()] || {
                  bg: 'bg-slate-50',
                  text: 'text-slate-700',
                  border: 'border-slate-200',
                };
                return (
                  <span
                    key={c}
                    className={`inline-flex px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${style.bg} ${style.text} ${style.border}`}
                  >
                    {c}
                  </span>
                );
              })}
            </div>
          );
        },
      },
      {
        headerName: 'Status',
        field: 'isActive',
        minWidth: 120,
        editable: true,
        cellEditor: 'agSelectCellEditor',
        cellEditorParams: {
          values: ['Active', 'Inactive'],
        },
        valueFormatter: (p) => (p.value ? 'Active' : 'Inactive'),
        cellRenderer: (p) => {
          const active = Boolean(p.data?.isActive);
          return (
            <span
              className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border ${
                active
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-slate-100 text-slate-600 border-slate-200'
              }`}
            >
              {active ? 'Active' : 'Inactive'}
            </span>
          );
        },
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
    <CommonDataGrid<SubjectListItem>
      rowData={clients}
      columns={columns}
      actions={actions}
      isLoading={loading}
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
  );
}

'use client';

import { useState, useMemo } from 'react';
import { Eye, Pencil, Trash2, Mail, MessageSquare, Bell, Phone, Loader2 } from 'lucide-react';
import CommonDataGrid, { GridAction, GridColumn, createTableActions } from '@/components/common/CommonTable';
import { MessageTemplateListItem, ChannelType } from '@/types/messageTemplate.types';
import { updateMessageTemplate } from '@/services/messageTemplateService';
import { useToast } from '@/context/ToastContext';

interface TemplatesTableProps {
  templates: MessageTemplateListItem[];
  loading: boolean;
  businessId?: string;
  onView: (templateId: string) => void;
  onEdit: (templateId: string) => void;
  onDelete: (templateId: string, templateName: string) => void;
  onRefresh?: () => void;
}

function getTypeBadgeClass(type?: string) {
  const t = (type || '').toUpperCase();
  if (t === 'GST') return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
  if (t === 'TDS') return 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 border-blue-200 dark:border-blue-800';
  if (t === 'ITR') return 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800';
  if (t === 'ROC') return 'bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300 border-purple-200 dark:border-purple-800';
  if (t === 'MSME') return 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border-amber-200 dark:border-amber-800';
  return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700';
}

function ChannelIconBadge({ channel }: { channel: ChannelType | string }) {
  const c = String(channel).toLowerCase();

  if (c === 'whatsapp') {
    return (
      <span
        title="WhatsApp"
        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-[#dcfce7] text-[#15803d] dark:bg-emerald-950/50 dark:text-emerald-400 border border-[#bbf7d0] dark:border-emerald-900/60"
      >
        <MessageSquare className="w-3 h-3 text-[#16a34a]" />
        <span>WhatsApp</span>
      </span>
    );
  }

  if (c === 'email') {
    return (
      <span
        title="Email"
        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-400 border border-blue-200 dark:border-blue-900/60"
      >
        <Mail className="w-3 h-3 text-blue-600" />
        <span>Email</span>
      </span>
    );
  }

  if (c === 'sms') {
    return (
      <span
        title="SMS"
        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400 border border-amber-200 dark:border-amber-900/60"
      >
        <Phone className="w-3 h-3 text-amber-600" />
        <span>SMS</span>
      </span>
    );
  }

  return (
    <span
      title="In-App"
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
    >
      <Bell className="w-3 h-3 text-slate-600 dark:text-slate-400" />
      <span>In-App</span>
    </span>
  );
}

export default function TemplatesTable({
  templates,
  loading,
  businessId,
  onView,
  onEdit,
  onDelete,
  onRefresh,
}: TemplatesTableProps) {
  const { showToast } = useToast();
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const handleToggleActive = async (e: React.MouseEvent, row: MessageTemplateListItem) => {
    e.stopPropagation();
    if (!businessId || togglingId) return;

    const nextVal = !row.isActive;
    try {
      setTogglingId(row.id);
      await updateMessageTemplate(businessId, row.id, { isActive: nextVal });
      row.isActive = nextVal;
      showToast(`Template ${nextVal ? 'activated' : 'deactivated'}`, 'success');
      onRefresh?.();
    } catch {
      showToast('Failed to update template status', 'error');
    } finally {
      setTogglingId(null);
    }
  };

  const columns = useMemo<GridColumn<MessageTemplateListItem>[]>(
    () => [
      {
        headerName: 'Template name',
        field: 'name',
        minWidth: 260,
        flex: 2,
        cellRenderer: (p) => {
          const row = p.data;
          if (!row) return null;
          return (
            <div className="flex flex-col justify-center py-1.5 leading-snug">
              <span className="font-semibold text-sm text-txt-main truncate hover:underline">
                {row.name}
              </span>
              <span className="text-xs text-txt-sub truncate mt-0.5 font-mono">
                {row.key ? `Key: ${row.key}` : `ID: ${row.id.slice(0, 10)}...`}
              </span>
            </div>
          );
        },
      },
      {
        headerName: 'Type',
        field: 'reminder_type',
        minWidth: 120,
        flex: 0.9,
        cellRenderer: (p) => {
          const type = p.data?.reminder_type;
          if (!type) return <span className="text-xs text-txt-sub">—</span>;
          return (
            <span
              className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getTypeBadgeClass(
                type
              )}`}
            >
              {type}
            </span>
          );
        },
      },
      {
        headerName: 'Channels',
        colId: 'channels',
        minWidth: 190,
        flex: 1.3,
        cellRenderer: (p) => {
          const channels = p.data?.channels || [];
          if (channels.length === 0) {
            return <span className="text-xs text-txt-sub">No channels</span>;
          }
          return (
            <div className="flex flex-wrap items-center gap-1.5 py-1">
              {channels.map((ch) => (
                <ChannelIconBadge key={ch} channel={ch} />
              ))}
            </div>
          );
        },
      },
      {
        headerName: 'Category',
        field: 'businessCategory',
        minWidth: 130,
        flex: 0.9,
        cellRenderer: (p) => {
          const cat = p.data?.businessCategory;
          return (
            <span className="text-xs font-medium text-txt-sub capitalize">
              {cat ? cat.toLowerCase() : 'General'}
            </span>
          );
        },
      },
      {
        headerName: 'Placeholders',
        colId: 'placeholders',
        minWidth: 200,
        flex: 1.4,
        cellRenderer: (p) => {
          const list = p.data?.placeholders || [];
          if (list.length === 0) {
            return <span className="text-xs text-txt-sub/60">None</span>;
          }
          const visible = list.slice(0, 2);
          const remaining = list.length - visible.length;

          return (
            <div className="flex items-center gap-1 py-1 flex-wrap">
              {visible.map((ph) => (
                <span
                  key={ph}
                  className="font-mono text-[10px] font-semibold px-1.5 py-0.5 rounded bg-bg border border-divider text-txt-sub"
                >
                  [{ph}]
                </span>
              ))}
              {remaining > 0 && (
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-bg text-txt-sub border border-divider">
                  +{remaining}
                </span>
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
        cellRenderer: (p) => {
          const row = p.data;
          if (!row) return null;
          const isToggling = togglingId === row.id;
          const checked = Boolean(row.isActive);

          return (
            <div
              className="flex h-full items-center gap-2 cursor-pointer select-none"
              onClick={(e) => handleToggleActive(e, row)}
              title="Click to toggle status"
            >
              {isToggling ? (
                <Loader2 className="h-4 w-4 animate-spin text-slate-500" />
              ) : (
                <div
                  className={`w-9 h-5 rounded-full p-0.5 flex items-center transition-colors relative ${
                    checked ? 'bg-[#14224D]' : 'bg-slate-300 dark:bg-slate-700'
                  }`}
                >
                  <div
                    className={`w-4 h-4 bg-white rounded-full shadow-xs transition-transform ${
                      checked ? 'translate-x-4' : 'translate-x-0'
                    }`}
                  />
                </div>
              )}
              <span
                className={`text-xs font-semibold ${
                  checked
                    ? 'text-[#059669] dark:text-emerald-400'
                    : 'text-slate-500 dark:text-slate-400'
                }`}
              >
                {checked ? 'Active' : 'Inactive'}
              </span>
            </div>
          );
        },
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [togglingId, businessId]
  );

  const actions: GridAction<MessageTemplateListItem>[] = useMemo(
    () =>
      createTableActions<MessageTemplateListItem>({
        onView: (row) => onView(row.id),
        onEdit: (row) => onEdit(row.id),
        onDelete: (row) => onDelete(row.id, row.name),
      }),
    [onView, onEdit, onDelete]
  );

  return (
    <CommonDataGrid<MessageTemplateListItem>
      rowData={templates}
      columns={columns}
      actions={actions}
      isLoading={loading}
      actionStyle="ghost"
      rowHeight={64}
      emptyMessage="No message templates found"
    />
  );
}
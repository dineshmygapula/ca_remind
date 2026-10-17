'use client';

import { useState, useMemo } from 'react';
import { Mail, Smartphone, Bell, Loader2 } from 'lucide-react';
import CommonDataGrid, { GridAction, GridColumn, createTableActions } from '@/components/common/CommonTable';
import { MessageTemplateListItem, ChannelType } from '@/types/messageTemplate.types';
import { updateMessageTemplate } from '@/services/messageTemplateService';
import { useToast } from '@/context/ToastContext';
import WhatsAppIcon from '@/components/common/WhatsAppIcon';

interface TemplatesTableProps {
  templates: MessageTemplateListItem[];
  loading: boolean;
  businessId?: string;
  onView: (templateId: string) => void;
  onEdit: (templateId: string) => void;
  onDelete: (templateId: string, templateName: string) => void;
  onRefresh?: () => void;
}

// ─── Rule / Type Styling Helpers (Matching Task Definitions) ───────────────
function getTemplatePrefix(val?: string) {
  if (!val) return 'TMPL';
  const upper = val.toUpperCase();
  if (upper.includes('GST')) return 'GST';
  if (upper.includes('TDS')) return 'TDS';
  if (upper.includes('ITR')) return 'ITR';
  if (upper.includes('ROC')) return 'ROC';
  if (upper.includes('MSME')) return 'MSME';
  return val.split('_')[0] || 'TMPL';
}

function getTemplateBadgeClass(val?: string) {
  const prefix = getTemplatePrefix(val);
  if (prefix === 'TDS') return 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300';
  if (prefix === 'ITR') return 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300';
  if (prefix === 'GST') return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300';
  if (prefix === 'ROC') return 'bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300';
  if (prefix === 'MSME') return 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300';
  return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300';
}

function getTemplateDescription(type?: string, name?: string) {
  const key = (type || name || '').toUpperCase();
  if (key.includes('GST')) return 'Goods & Services Tax';
  if (key.includes('TDS')) return 'Tax Deducted at Source';
  if (key.includes('ITR')) return 'Income Tax Return';
  if (key.includes('ROC')) return 'Registrar of Companies';
  if (key.includes('MSME')) return 'Ministry of MSME';
  return type || 'Compliance Template';
}

// ─── Channel Badge Renderer with authentic WhatsApp Icon ───────────────────
function ChannelBadge({ channel }: { channel: ChannelType | string }) {
  const c = String(channel).toLowerCase();

  if (c === 'whatsapp') {
    return (
      <span
        title="WhatsApp Channel"
        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#ecfdf5] text-[#047857] dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/40 shadow-2xs shrink-0"
      >
        <WhatsAppIcon size={13} className="fill-current text-[#047857] dark:text-emerald-300 shrink-0" />
        <span>WhatsApp</span>
      </span>
    );
  }

  if (c === 'email') {
    return (
      <span
        title="Email Channel"
        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#eff6ff] text-[#1d4ed8] dark:bg-blue-950/50 dark:text-blue-300 border border-blue-200/60 dark:border-blue-800/40 shadow-2xs shrink-0"
      >
        <Mail className="h-3.5 w-3.5 text-[#1d4ed8] dark:text-blue-300 shrink-0" />
        <span>Email</span>
      </span>
    );
  }

  if (c === 'sms') {
    return (
      <span
        title="SMS Channel"
        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#eef2ff] text-[#4338ca] dark:bg-indigo-950/50 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800/40 shadow-2xs shrink-0"
      >
        <Smartphone className="h-3.5 w-3.5 text-[#4338ca] dark:text-indigo-300 shrink-0" />
        <span>SMS</span>
      </span>
    );
  }

  return (
    <span
      title="In-App Notification"
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200/60 shadow-2xs shrink-0"
    >
      <Bell className="h-3.5 w-3.5 text-slate-600 dark:text-slate-400 shrink-0" />
      <span>In-App</span>
    </span>
  );
}

// ─── Category Badge Renderer (Matching Task Definitions ScheduleBadge) ──────
function CategoryBadge({ category }: { category?: string }) {
  const cat = (category || '').toUpperCase();
  let badgeStyle = 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300';
  if (cat.includes('ACCOUNT')) {
    badgeStyle = 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300';
  } else if (cat.includes('TAX')) {
    badgeStyle = 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300';
  } else if (cat.includes('COMPLIANCE')) {
    badgeStyle = 'bg-[#e0f2fe] text-[#0369a1] dark:bg-blue-950/40 dark:text-blue-300';
  } else if (cat.includes('AUDIT')) {
    badgeStyle = 'bg-[#f3e8ff] text-[#7e22ce] dark:bg-purple-950/40 dark:text-purple-300';
  } else if (cat.includes('GENERAL')) {
    badgeStyle = 'bg-[#fef3c7] text-[#b45309] dark:bg-amber-950/40 dark:text-amber-300';
  }

  return (
    <span className={`inline-block px-3 py-0.5 rounded-full text-xs font-semibold capitalize ${badgeStyle}`}>
      {category ? category.toLowerCase() : 'General'}
    </span>
  );
}

// ─── Templates Table Component ──────────────────────────────────────────────
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
        flex: 2.2,
        editable: true,
        cellRenderer: (p) => {
          const row = p.data;
          if (!row) return null;
          const name = p.value || row.name;
          const prefixKey = row.reminder_type || row.key || name;
          return (
            <div className="flex items-center gap-3 py-1">
              <span
                className={`w-11 h-9 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${getTemplateBadgeClass(
                  prefixKey
                )}`}
              >
                {getTemplatePrefix(prefixKey)}
              </span>
              <div className="flex flex-col min-w-0">
                <span className="font-bold text-sm text-[var(--primary)] dark:text-slate-100 truncate">
                  {name}
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400 truncate">
                  {row.key ? `Key: ${row.key}` : getTemplateDescription(row.reminder_type, name)}
                </span>
              </div>
            </div>
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
            return <span className="text-xs text-slate-400 dark:text-slate-500 italic">No channels</span>;
          }
          return (
            <div className="flex items-center gap-1.5 py-1 overflow-hidden">
              {channels.map((ch) => (
                <ChannelBadge key={ch} channel={ch} />
              ))}
            </div>
          );
        },
      },
      {
        headerName: 'Category',
        field: 'businessCategory',
        minWidth: 130,
        flex: 1,
        editable: true,
        cellEditor: 'agSelectCellEditor',
        cellEditorParams: {
          values: ['ACCOUNTS', 'TAX', 'COMPLIANCE', 'AUDIT', 'GENERAL'],
        },
        cellRenderer: (p) => <CategoryBadge category={p.value || p.data?.businessCategory} />,
      },
      {
        headerName: 'Placeholders',
        colId: 'placeholders',
        minWidth: 200,
        flex: 1.5,
        cellRenderer: (p) => {
          const list = p.data?.placeholders || [];
          if (list.length === 0) {
            return <span className="text-xs text-slate-400 dark:text-slate-500 italic">None</span>;
          }
          const visible = list.slice(0, 2);
          const remaining = list.length - visible.length;

          return (
            <div
              className="flex items-center gap-1.5 py-1 whitespace-nowrap overflow-hidden"
              title={`Available Placeholders:\n${list.map((ph) => `[${ph}]`).join(', ')}`}
            >
              {visible.map((ph) => (
                <span
                  key={ph}
                  className="inline-flex items-center font-mono text-[11px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 text-slate-600 dark:text-slate-300 shrink-0 shadow-2xs"
                >
                  [{ph}]
                </span>
              ))}
              {remaining > 0 && (
                <span
                  className="inline-flex items-center font-mono text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-slate-200/80 dark:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-300/80 dark:border-slate-600 shrink-0 cursor-help"
                >
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
        minWidth: 110,
        flex: 0.9,
        editable: true,
        cellEditor: 'agSelectCellEditor',
        cellEditorParams: {
          values: ['Active', 'Inactive'],
        },
        valueFormatter: (p) =>
          p.value === 'Active' || p.value === true ? 'Active' : 'Inactive',
        cellRenderer: (p) => {
          const row = p.data;
          if (!row) return null;
          const isToggling = togglingId === row.id;
          const active =
            p.value === 'Active' ||
            p.value === true ||
            (p.value !== 'Inactive' && Boolean(row.isActive));

          return (
            <div
              className="flex items-center gap-2 cursor-pointer select-none group"
              onClick={(e) => handleToggleActive(e, row)}
              title="Click to toggle status"
            >
              {isToggling ? (
                <Loader2 className="h-4 w-4 animate-spin text-slate-500" />
              ) : active ? (
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#059669] dark:text-emerald-400 group-hover:opacity-80 transition-opacity">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#10b981]" />
                  Active
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-slate-400 group-hover:opacity-80 transition-opacity">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                  Inactive
                </span>
              )}
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
      onUpdateCell={async ({ row, field, newValue }) => {
        if (!businessId) return;
        let valToSave: unknown = newValue;
        if (field === 'isActive') {
          valToSave = newValue === 'Active' || newValue === true;
        }
        try {
          await updateMessageTemplate(businessId, row.id, {
            [field]: valToSave,
          });
          showToast('Template updated successfully', 'success');
          onRefresh?.();
        } catch {
          showToast('Failed to update template', 'error');
        }
      }}
      emptyMessage="No message templates found"
    />
  );
}
"use client";

import React, { useMemo } from "react";
import CommonDataGrid, {
  GridAction,
  GridColumn,
  createTableActions,
} from "@/components/common/CommonTable";
import { ReminderDetail, ReminderStatus } from "@/types/reminders.types";
import { updateReminder } from "@/services/reminderService";
import ChannelBadge from "@/components/common/ChannelBadge";
import { DueDate } from "@/components/common/DueDate";
import { DateCellEditor } from "@/components/grid/DateCellEditor";
import { useAsyncAction } from "@/hooks/useAnyAction";

interface RemindersTableProps {
  reminders: ReminderDetail[];
  loading: boolean;
  businessId: string;
  onView: (id: string) => void;
  onEdit?: (id: string) => void;
  onDelete: (id: string, taskTitle: string) => void;
  onRefresh?: () => void;
}

// ─── Task Type Styling Helpers (Matching Task Definitions) ───
function getTaskTypePrefix(val?: string) {
  if (!val) return "TASK";
  const upper = val.toUpperCase();
  if (upper.includes("GST")) return "GST";
  if (upper.includes("TDS")) return "TDS";
  if (upper.includes("ITR")) return "ITR";
  if (upper.includes("ROC")) return "ROC";
  if (upper.includes("MSME")) return "MSME";
  return val.split("_")[0] || "TASK";
}

function getTaskTypeBadgeClass(val?: string) {
  const prefix = getTaskTypePrefix(val);
  if (prefix === "TDS")
    return "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300";
  if (prefix === "ITR")
    return "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300";
  if (prefix === "GST")
    return "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300";
  if (prefix === "ROC")
    return "bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300";
  return "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300";
}

// ─── Status Badge Renderer (Matching DaisyUI & Task Definitions) ───
function StatusBadge({ status }: { status?: ReminderStatus | string }) {
  const s = (status || "").toUpperCase();
  switch (s) {
    case "SENT":
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#ecfdf5] text-[#047857] dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200/60">
          <span className="w-1.5 h-1.5 rounded-full bg-[#10b981]" />
          <span>Sent</span>
        </span>
      );
    case "SCHEDULED":
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#fffbeb] text-[#b45309] dark:bg-amber-950/40 dark:text-amber-400 border border-amber-200/60">
          <span className="w-1.5 h-1.5 rounded-full bg-[#f59e0b]" />
          <span>Scheduled</span>
        </span>
      );
    case "FAILED":
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#fef2f2] text-[#dc2626] dark:bg-rose-950/40 dark:text-rose-400 border border-rose-200/60">
          <span className="w-1.5 h-1.5 rounded-full bg-[#ef4444]" />
          <span>Failed</span>
        </span>
      );
    case "CANCELLED":
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border border-slate-200/60">
          <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
          <span>Cancelled</span>
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border border-slate-200/60">
          <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
          <span>{status || "—"}</span>
        </span>
      );
  }
}

// ─── Reminders Table Component ──────────────────────────────
export default function RemindersTable({
  reminders,
  loading,
  businessId,
  onView,
  onDelete,
}: RemindersTableProps) {
  const { run } = useAsyncAction();
  const columns: GridColumn<ReminderDetail>[] = useMemo(
    () => [
      {
        headerName: "Task",
        field: "task",
        minWidth: 260,
        flex: 2.5,
        cellRenderer: (p) => {
          const row = p.data;
          if (!row) return null;

          const taskTitle = row.task?.title || "Reminder Notification";
          const clientName = row.subject?.name;
          const taskType = row.taskType || row.task?.title || "";
          const prefix = getTaskTypePrefix(taskType);
          const badgeClass = getTaskTypeBadgeClass(taskType);

          return (
            <div className="flex items-center gap-3 py-1">
              <span
                className={`w-11 h-9 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${badgeClass}`}
              >
                {prefix}
              </span>
              <div className="flex flex-col min-w-0">
                <span className="font-bold text-sm text-[var(--primary)] dark:text-slate-100 truncate">
                  {taskTitle}
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400 truncate">
                  {clientName ? `Client: ${clientName}` : "General reminder"}
                </span>
              </div>
            </div>
          );
        },
      },
      {
        headerName: "Client",
        colId: "client",
        valueGetter: (p) => p.data?.subject?.name ?? "—",
        minWidth: 160,
        flex: 1.2,
        cellRenderer: (p) => {
          const name = p.data?.subject?.name;
          if (!name) return <span className="text-xs text-slate-400">—</span>;
          const initial = name.charAt(0).toUpperCase();

          return (
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-[10px] font-bold text-slate-600 dark:text-slate-300 shrink-0">
                {initial}
              </span>
              <span className="font-semibold text-xs sm:text-sm text-slate-800 dark:text-slate-200 truncate">
                {name}
              </span>
            </div>
          );
        },
      },
      {
        headerName: "Channel",
        field: "channel",
        minWidth: 140,
        flex: 1.1,
        cellRenderer: (p) => <ChannelBadge channel={p.data?.channel} />,
      },
      {
        headerName: "Task Type",
        field: "taskType",
        minWidth: 130,
        flex: 1,
        cellRenderer: (p) => {
          const val = p.value || p.data?.task?.title;
          const prefix = getTaskTypePrefix(val);
          return (
            <span className="inline-block px-3 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
              {prefix}
            </span>
          );
        },
      },
      {
        headerName: "Status",
        field: "status",
        minWidth: 145,
        flex: 1.1,
        editable: true,
        cellEditor: "agSelectCellEditor",
        cellEditorParams: {
          values: ["SCHEDULED", "SENT", "FAILED", "CANCELLED"],
        },
        cellRenderer: (p) => (
          <StatusBadge status={(p.value ?? p.data?.status) as ReminderStatus} />
        ),
      },
      {
        headerName: "Scheduled At",
        field: "scheduledAt",
        minWidth: 180,
        flex: 1.4,
        editable: true,
        cellEditor: DateCellEditor,
        cellEditorPopup: true,
        cellEditorPopupPosition: "under",
        cellRenderer: (p) => (
          <DueDate
            value={p.value}
            showTime={true}
            badgeMode="scheduled"
            completed={
              p.data?.status === "SENT" || p.data?.status === "CANCELLED"
            }
          />
        ),
      },
    ],
    [],
  );

  // Edit icon removed per requirements as status and date are only editable
  const actions: GridAction<ReminderDetail>[] = useMemo(
    () =>
      createTableActions<ReminderDetail>({
        onView: (row) => onView(row.id),
        onDelete: (row) => onDelete(row.id, row.task?.title || "Reminder"),
      }),
    [onView, onDelete],
  );

  return (
    <CommonDataGrid<ReminderDetail>
      rowData={reminders}
      columns={columns}
      actions={actions}
      isLoading={loading}
      rowHeight={64}
      onUpdateCell={async ({ row, field, newValue }) => {
        if (!businessId) return;

        let value = newValue;
        if (
          field === "scheduledAt" &&
          typeof newValue === "string" &&
          newValue.trim()
        ) {
          const orig = row.scheduledAt ? new Date(row.scheduledAt) : null;
          const hasOrig = orig && !isNaN(orig.getTime());
          const parts = newValue.split("-");
          if (parts.length === 3) {
            const [year, month, day] = parts.map((p) => parseInt(p, 10));
            value = new Date(
              year,
              month - 1,
              day,
              hasOrig ? orig.getHours() : 9,
              hasOrig ? orig.getMinutes() : 0,
              0,
              0,
            ).toISOString();
          } else {
            const d = new Date(newValue);
            if (!isNaN(d.getTime())) value = d.toISOString();
          }
        }

        await run(
          () => updateReminder(businessId, row.id, { [field]: value }),
          {
            successMessage: "Reminder updated successfully",
            errorMessage: "Failed to update reminder",
            // onSuccess: () =>
            //   onPatch?.(row.id, { [field]: value } as Partial<ReminderDetail>),
          },
        );
      }}
      emptyMessage="No reminders found"
    />
  );
}

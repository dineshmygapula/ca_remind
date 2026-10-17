/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useMemo, ReactNode } from "react";

import { AgGridReact } from "ag-grid-react";
import { Eye, Pencil, Trash2, Loader2 } from "lucide-react";
import { useIsDarkMode } from "@/hooks/useIsDarkMode";
import { agGridDefaultConfig } from "@/constants/agConfig";
import { useToast } from "@/context/ToastContext";
import TableActions, { createTableActions } from "@/components/common/TableActions";
export { TableActions, createTableActions };


import {
    AllCommunityModule,
    ModuleRegistry,
    ColDef,
    ValueGetterParams,
    ValueFormatterParams,
    ICellRendererParams,
    ColDefField,
} from 'ag-grid-community';

ModuleRegistry.registerModules([
    AllCommunityModule,
]);
// ─── Types ───────────────────────────────────────────────────────────────────

export interface GridColumn<T = any> {
    headerName: string;
    field?: Extract<keyof T, string>;
    colId?: string;

    width?: number;
    minWidth?: number;
    flex?: number;

    sortable?: boolean;
    resizable?: boolean;
    filter?: boolean;

    editable?: boolean;

    // Cell editing configuration
    cellEditor?: any;
    cellEditorParams?: Record<string, any>;
    cellEditorPopup?: boolean;
    cellEditorPopupPosition?: 'over' | 'under';

    valueGetter?: (params: ValueGetterParams<T>) => any;
    valueFormatter?: (params: ValueFormatterParams<T>) => string;
    cellRenderer?: (params: ICellRendererParams<T>) => ReactNode;

    hidden?: boolean;
    pinned?: 'left' | 'right';
}

export interface GridAction<T = any> {
    label: string;
    icon?: ReactNode;
    onClick: (row: T) => void | Promise<void>;
    visible?: (row: T) => boolean;
    loading?: (row: T) => boolean;
    disabled?: (row: T) => boolean;
    variant?: "primary" | "secondary" | "danger";
    showText?: boolean;
}

export interface CommonDataGridProps<T = any> {
    rowData: T[];
    columns: GridColumn<T>[];
    actions?: GridAction<T>[];
    isLoading?: boolean;
    onRowClick?: (row: T) => void;
    onRowDoubleClick?: (row: T) => void;
    rowHeight?: number;
    paginationPageSize?: number;
    paginationPageSizeSelector?: number[] | false;
    defaultColDef?: Partial<ColDef<T>>;
    toolbar?: ReactNode;
    emptyMessage?: string;
    hideToolbar?: boolean;
    editable?: boolean;
    selectionMode?: "singleRow" | "multiRow" | "none";
    className?: string;
    actionStyle?: 'tinted' | 'ghost';
    // Common dynamic database update handler for inline cell edits:
    onUpdateCell?: (params: {
        row: T;
        field: string;
        newValue: any;
        oldValue: any;
    }) => Promise<any> | void;
    // Optional custom success message generator
    getUpdateSuccessMessage?: (field: string, newValue: any, row: T) => string;
    // Fired when an editable cell is committed.
    onCellValueChanged?: (params: {
        row: T;
        field: string | undefined;
        oldValue: any;
        newValue: any;
    }) => void;
}

// ─── Utility Functions ────────────────────────────────────────────────────────

export function formatCurrency(value: number | null | undefined): string {
    if (value === null || value === undefined) return "N/A";
    return `₹${value.toFixed(2)}`;
}

// ─── Cell Renderers ──────────────────────────────────────────────────────────

interface ActionCellProps<T = any> {
    row: T;
    actions: GridAction<T>[];
    actionStyle?: 'tinted' | 'ghost';
}

// Maps semantic variants onto tinted icon-square styling (matches the
// eye / pencil / trash icon buttons in the reference design).
const VARIANT_CLASS: Record<NonNullable<GridAction["variant"]>, string> = {
    primary: "rc-action-btn rc-action-btn--primary",
    secondary: "rc-action-btn rc-action-btn--secondary",
    danger: "rc-action-btn rc-action-btn--danger",
};

const GHOST_VARIANT_CLASS: Record<NonNullable<GridAction["variant"]>, string> = {
    primary: "p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer",
    secondary: "p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer",
    danger: "p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors cursor-pointer",
};

// Fallback icons so existing callers that don't pass `icon` still get the
// eye / pencil / trash look from the reference design, keyed off variant.
const DEFAULT_ICON: Record<NonNullable<GridAction["variant"]>, ReactNode> = {
    primary: <Eye className="h-4 w-4" />,
    secondary: <Pencil className="h-4 w-4" />,
    danger: <Trash2 className="h-4 w-4" />,
};

function ActionCell<T = any>({ row, actions, actionStyle = 'tinted' }: ActionCellProps<T>) {
    const actionItems = actions.map((action, idx) => ({
        key: String(idx),
        label: action.label,
        icon: action.icon ?? DEFAULT_ICON[action.variant ?? 'primary'],
        variant: action.variant,
        disabled: action.disabled?.(row) ?? false,
        loading: action.loading?.(row) ?? false,
        showText: action.showText,
        visible: !action.visible || action.visible(row),
        onClick: (e: React.MouseEvent) => {
            e.stopPropagation();
            action.onClick(row);
        },
    }));

    return <TableActions actions={actionItems} style={actionStyle} />;
}


// ─── Main Component ──────────────────────────────────────────────────────────

export default function CommonDataGrid<T extends Record<string, any>>({
    rowData,
    columns,
    actions = [],
    isLoading = false,
    onRowClick,
    onRowDoubleClick,
    onUpdateCell,
    getUpdateSuccessMessage,
    onCellValueChanged,
    rowHeight = agGridDefaultConfig.rowHeight,
    paginationPageSize = 10,
    paginationPageSizeSelector = [10, 20, 50, 100],
    defaultColDef,
    toolbar,
    emptyMessage = "No data available",
    hideToolbar = false,
    selectionMode = "singleRow",
    className = "",
    actionStyle = "tinted",
}: CommonDataGridProps<T>) {
    const isDark = useIsDarkMode();
    const toast = useToast();
    const isRevertingRef = React.useRef(false);

    // Map selection mode to AG Grid format
    const rowSelection =
        selectionMode === "singleRow"
            ? "single"
            : selectionMode === "multiRow"
                ? "multiple"
                : undefined;

    // Build column definitions
    const columnDefs = useMemo(() => {
        const cols: ColDef<T>[] = columns.map((col) => {
            const baseDef: ColDef<T> = {
                headerName: col.headerName,
                field: col.field as ColDefField<T, string>,
                colId: col.colId,

                width: col.width,
                minWidth: col.minWidth ?? 150,
                flex: col.flex ?? 1,

                sortable: col.sortable !== false,
                resizable: col.resizable !== false,
                filter: col.filter !== false,

                // IMPORTANT:
                // Only columns with editable: true can be edited.
                editable: col.editable === true,

                hide: col.hidden,
                pinned: col.pinned,
            };
            if (col.cellEditor) {
                baseDef.cellEditor = col.cellEditor;
            }

            if (col.cellEditorParams) {
                baseDef.cellEditorParams = col.cellEditorParams;
            }

            if (col.cellEditorPopup !== undefined) {
                baseDef.cellEditorPopup = col.cellEditorPopup;
            } else if (typeof col.cellEditor !== 'string' && col.cellEditor !== undefined) {
                baseDef.cellEditorPopup = true;
            }

            if (col.cellEditorPopupPosition !== undefined) {
                baseDef.cellEditorPopupPosition = col.cellEditorPopupPosition;
            } else if (baseDef.cellEditorPopup) {
                baseDef.cellEditorPopupPosition = 'under';
            }
            if (col.valueGetter) {
                baseDef.valueGetter = col.valueGetter;
            }

            if (col.valueFormatter) {
                baseDef.valueFormatter = col.valueFormatter;
            }

            if (col.cellRenderer) {
                baseDef.cellRenderer = col.cellRenderer;
            }

            return baseDef;
        });

        // Actions column
        if (actions.length > 0) {
            const actionColWidth = actionStyle === 'ghost'
                ? Math.max(actions.length * 36 + 24, 110)
                : Math.max(actions.length * 48 + 36, 130);
            const actionMinWidth = actionStyle === 'ghost' ? 100 : 120;

            cols.push({
                headerName: "Actions",
                colId: "actions",
                width: actionColWidth,
                minWidth: actionMinWidth,

                sortable: false,
                resizable: true,
                filter: false,
                pinned: "right",

                // Actions column must NEVER be editable
                editable: false,

                cellRenderer: (params: ICellRendererParams<T>) => (
                    <ActionCell
                        row={params.data as T}
                        actions={actions}
                        actionStyle={actionStyle}
                    />
                ),
            });
        }

        return cols;
    }, [columns, actions, actionStyle]);

    return (
        <div className={`w-full ${className}`}>
            {!hideToolbar && toolbar && <div className="mb-4">{toolbar}</div>}

            {/* Card wrapper — surface background, theme divider, rounded corners */}
            <div className="w-full overflow-hidden rounded-2xl border border-divider bg-surface shadow-xs">
                <div className="w-full overflow-x-auto">
                    <div
                        className={
                            isDark
                                ? "ag-theme-alpine-dark rc-grid-theme"
                                : "ag-theme-alpine rc-grid-theme"
                        }
                        style={{ minWidth: "100%" }}
                    >
                        <AgGridReact<T>
                            rowData={rowData}
                            columnDefs={columnDefs}

                            domLayout="autoHeight"
                            animateRows

                            rowSelection={rowSelection}
                            getRowHeight={() => rowHeight}

                            pagination
                            paginationPageSize={paginationPageSize}
                            paginationPageSizeSelector={paginationPageSizeSelector}

                            loading={isLoading}

                            // IMPORTANT:
                            // false = double-click starts editing
                            singleClickEdit={false}

                            // Optional but recommended:
                            // clicking outside the grid commits the edit.
                            stopEditingWhenCellsLoseFocus={true}

                            overlayNoRowsTemplate={`
        <span class="ag-overlay-no-rows-center">
            ${emptyMessage}
        </span>
    `}

                            defaultColDef={{
                                resizable: true,
                                sortable: true,
                                unSortIcon: true,
                                minWidth: 150,
                                flex: 1,

                               
                                ...defaultColDef,
                            }}

                            onRowClicked={(event) => {
                                if (event.column?.getColId() === 'actions') return;
                                if (event.data) {
                                    onRowClick?.(event.data as T);
                                }
                            }}

                            onRowDoubleClicked={(event) => {
                                if (event.column?.getColId() === 'actions') return;
                                // If user double-clicks an editable cell, let AG Grid inline editing take place without firing row double-click
                                if (event.colDef?.editable) return;
                                if (event.data) {
                                    onRowDoubleClick?.(event.data as T);
                                }
                            }}

                            onCellValueChanged={async (event) => {
                                // If the change came from an internal revert, ignore it
                                if (isRevertingRef.current || event.source === 'api' || event.source === 'revert') {
                                    return;
                                }

                                const field = event.colDef.field;
                                const oldValue = event.oldValue;
                                const newValue = event.newValue;
                                const row = event.data as T;
                                const headerName = event.colDef.headerName || field || 'Item';

                                // Skip if value did not change
                                if (oldValue === newValue) return;

                                if (onUpdateCell && field) {
                                    try {
                                        await onUpdateCell({
                                            row,
                                            field,
                                            newValue,
                                            oldValue,
                                        });

                                        // Ensure in-memory row data and all dependent cells in the row are refreshed
                                        (row as any)[field] = newValue;
                                        event.api.refreshCells({ rowNodes: [event.node], force: true });

                                        const successMsg = getUpdateSuccessMessage
                                            ? getUpdateSuccessMessage(field, newValue, row)
                                            : `${headerName} updated successfully`;
                                        toast.success(successMsg);
                                    } catch (err: unknown) {
                                        // Revert cell in AG Grid and in memory on failure
                                        try {
                                            isRevertingRef.current = true;
                                            (row as any)[field] = oldValue;
                                            if (field) {
                                                event.node.setDataValue(field, oldValue, 'revert');
                                            }
                                            event.api.refreshCells({ rowNodes: [event.node], force: true });
                                        } finally {
                                            setTimeout(() => {
                                                isRevertingRef.current = false;
                                            }, 50);
                                        }

                                        const errorMsg =
                                            err instanceof Error ? err.message : `Failed to update ${headerName}`;
                                        toast.error(errorMsg);
                                    }
                                }

                                onCellValueChanged?.({
                                    row,
                                    field: field as string | undefined,
                                    oldValue,
                                    newValue,
                                });
                            }}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
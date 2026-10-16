/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useMemo, ReactNode } from "react";

import { AgGridReact } from "ag-grid-react";
import { Eye, Pencil, Trash2, Loader2 } from "lucide-react";
import { useIsDarkMode } from "@/hooks/useIsDarkMode";
import { agGridDefaultConfig } from "@/constants/agConfig";


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

    // Add these
    cellEditor?: string;
    cellEditorParams?: Record<string, any>;

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
    // Fired when an editable cell is committed. Wire this to a save call later —
    // for now it's safe to leave unhandled, edits just update the grid's local state.
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
}

// Maps semantic variants onto tinted icon-square styling (matches the
// eye / pencil / trash icon buttons in the reference design).
const VARIANT_CLASS: Record<NonNullable<GridAction["variant"]>, string> = {
    primary: "rc-action-btn rc-action-btn--primary",
    secondary: "rc-action-btn rc-action-btn--secondary",
    danger: "rc-action-btn rc-action-btn--danger",
};

// Fallback icons so existing callers that don't pass `icon` still get the
// eye / pencil / trash look from the reference design, keyed off variant.
const DEFAULT_ICON: Record<NonNullable<GridAction["variant"]>, ReactNode> = {
    primary: <Eye className="h-4 w-4" />,
    secondary: <Pencil className="h-4 w-4" />,
    danger: <Trash2 className="h-4 w-4" />,
};

function ActionCell<T = any>({ row, actions }: ActionCellProps<T>) {
    const visibleActions = actions.filter(
        (action) => !action.visible || action.visible(row),
    );

    if (visibleActions.length === 0) {
        return <span className="text-sm text-txt-sub/50">No actions</span>;
    }

    return (
        <div className="flex h-full items-center gap-2">
            {visibleActions.map((action, idx) => {
                const isLoading = action.loading?.(row) ?? false;
                const isDisabled = action.disabled?.(row) ?? false;
                const variant = action.variant ?? "primary";

                return (
                    <button
                        key={idx}
                        onClick={() => {
                            if (!isLoading && !isDisabled) {
                                action.onClick(row);
                            }
                        }}
                        disabled={isLoading || isDisabled}
                        className={VARIANT_CLASS[variant]}
                        title={action.label}
                    >
                        {isLoading ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <>
                                {action.icon ?? DEFAULT_ICON[variant]}
                                {action.showText && (
                                    <span className="ml-1.5 text-sm font-medium">
                                        {action.label}
                                    </span>
                                )}
                            </>
                        )}
                    </button>
                );
            })}
        </div>
    );
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function CommonDataGrid<T extends Record<string, any>>({
    rowData,
    columns,
    actions = [],
    isLoading = false,
    onRowClick,
    onCellValueChanged,   // ← add this
    rowHeight = agGridDefaultConfig.rowHeight,
    paginationPageSize = 10,
    paginationPageSizeSelector = [10, 20, 50, 100],
    defaultColDef,
    toolbar,
    emptyMessage = "No data available",
    hideToolbar = false,
    selectionMode = "singleRow",
    className = "",
}: CommonDataGridProps<T>) {
    const isDark = useIsDarkMode();

    // Map selection mode to AG Grid format
    const rowSelection =
        selectionMode === "singleRow"
            ? "single"
            : selectionMode === "multiRow"
                ? "multiple"
                : undefined;

    // Build column definitions
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
            cols.push({
                headerName: "Actions",
                colId: "actions",
                width: Math.min(actions.length * 60, 220),
                minWidth: 120,

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
                    />
                ),
            });
        }

        return cols;
    }, [columns, actions]);

    return (
        <div className={`w-full ${className}`}>
            {!hideToolbar && toolbar && <div className="mb-4">{toolbar}</div>}

            {/* Card wrapper — white surface, soft border, rounded corners */}
            <div className="w-full overflow-hidden rounded-2xl border border-divider bg-surface shadow-sm">
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
                                minWidth: 150,
                                flex: 1,

                                // DO NOT put editable: true here.
                                // Each column controls its own editability.
                                ...defaultColDef,
                            }}

                            onCellValueChanged={(event) => {
                                onCellValueChanged?.({
                                    row: event.data as T,
                                    field: event.colDef.field as string | undefined,
                                    oldValue: event.oldValue,
                                    newValue: event.newValue,
                                });
                            }}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
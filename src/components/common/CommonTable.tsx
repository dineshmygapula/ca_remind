/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useMemo, ReactNode } from "react";
import {
    ClientSideRowModelModule,
    ModuleRegistry,
    NumberFilterModule,
    PaginationModule,
    TextFilterModule,
    ColDef,
    ValueGetterParams,
    ValueFormatterParams,
    ICellRendererParams,
    GridApi,
    ColDefField,
} from "ag-grid-community";
import { AgGridReact } from "ag-grid-react";
import { Loader2 } from "lucide-react";
import { useIsDarkMode } from "@/hooks/useIsDarkMode";
import { agGridDefaultConfig } from "@/constants/agConfig";

// Register modules
ModuleRegistry.registerModules([
    ClientSideRowModelModule,
    TextFilterModule,
    PaginationModule,
    NumberFilterModule,
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

    valueGetter?: (params: ValueGetterParams<T>) => any;
    valueFormatter?: (params: ValueFormatterParams<T>) => string;
    cellRenderer?: (params: ICellRendererParams<T>) => ReactNode;

    hidden?: boolean;
    pinned?: "left" | "right";
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
    defaultColDef?: Partial<ColDef<T>>;
    toolbar?: ReactNode;
    emptyMessage?: string;
    hideToolbar?: boolean;
    selectionMode?: "singleRow" | "multiRow" | "none";
    className?: string;
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

// Maps our semantic variants onto DaisyUI's button color modifiers.
const VARIANT_CLASS: Record<NonNullable<GridAction["variant"]>, string> = {
    primary: "btn-primary",
    secondary: "btn-neutral",
    danger: "btn-error",
};

function ActionCell<T = any>({ row, actions }: ActionCellProps<T>) {
    const visibleActions = actions.filter(
        (action) => !action.visible || action.visible(row),
    );

    if (visibleActions.length === 0) {
        return <span className="text-sm text-base-content/40">No actions</span>;
    }

    return (
        <div className="flex h-full items-center gap-2">
            {visibleActions.map((action, idx) => {
                const isLoading = action.loading?.(row) ?? false;
                const isDisabled = action.disabled?.(row) ?? false;

                return (
                    <button
                        key={idx}
                        onClick={() => {
                            if (!isLoading && !isDisabled) {
                                action.onClick(row);
                            }
                        }}
                        disabled={isLoading || isDisabled}
                        className={`btn btn-sm ${VARIANT_CLASS[action.variant ?? "primary"]}`}
                        title={action.label}
                    >
                        {isLoading ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <>
                                {action.icon && (
                                    <span className="flex items-center justify-center">
                                        {action.icon}
                                    </span>
                                )}
                                {action.showText && <span>{action.label}</span>}
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
    rowHeight = agGridDefaultConfig.rowHeight,
    paginationPageSize = 10,
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
                hide: col.hidden,
                pinned: col.pinned,
            };

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
                width: Math.min(actions.length * 100, 350),
                minWidth: 150,
                sortable: false,
                resizable: true,
                filter: false,
                pinned: "right",
                cellRenderer: (params: ICellRendererParams<T>) => (
                    <ActionCell row={params.data as T} actions={actions} />
                ),
            });
        }

        return cols;
    }, [columns, actions]);

    return (
        <div className={`w-full ${className}`}>
            {!hideToolbar && toolbar && <div className="mb-4">{toolbar}</div>}

            <div className="w-full overflow-x-auto pb-4">
                <div
                    className={isDark ? "ag-theme-alpine-dark" : "ag-theme-alpine"}
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
                        loading={isLoading}
                        overlayNoRowsTemplate={`<span class="ag-overlay-no-rows-center">${emptyMessage}</span>`}
                        defaultColDef={{
                            resizable: true,
                            autoHeight: true,
                            sortable: true,
                            minWidth: 150,
                            flex: 1,
                            ...defaultColDef,
                        }}
                        onRowClicked={(event) => onRowClick?.(event.data as T)}
                    />
                </div>
            </div>
        </div>
    );
}
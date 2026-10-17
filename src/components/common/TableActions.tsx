'use client';

import React, { ReactNode } from 'react';
import { Eye, Pencil, Trash2, Loader2 } from 'lucide-react';
import type { GridAction } from '@/components/common/CommonTable';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface ActionItem {
  key?: string;
  label: string;
  icon?: ReactNode;
  onClick: (e: React.MouseEvent) => void;
  variant?: 'primary' | 'secondary' | 'danger';
  disabled?: boolean;
  loading?: boolean;
  showText?: boolean;
  visible?: boolean;
}

export interface TableActionsProps {
  onView?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  viewTitle?: string;
  editTitle?: string;
  deleteTitle?: string;
  viewDisabled?: boolean;
  editDisabled?: boolean;
  deleteDisabled?: boolean;
  isViewing?: boolean;
  isEditing?: boolean;
  isDeleting?: boolean;
  style?: 'tinted' | 'ghost';
  actions?: ActionItem[];
  children?: ReactNode;
  className?: string;
}

// ─── Style Mappings ──────────────────────────────────────────────────────────

const TINTED_CLASSES: Record<'primary' | 'secondary' | 'danger', string> = {
  primary: 'rc-action-btn rc-action-btn--primary',
  secondary: 'rc-action-btn rc-action-btn--secondary',
  danger: 'rc-action-btn rc-action-btn--danger',
};

const GHOST_CLASSES: Record<'primary' | 'secondary' | 'danger', string> = {
  primary:
    'w-8 h-8 inline-flex items-center justify-center rounded-lg text-slate-400 ' +
    'hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40 ' +
    'transition-all duration-150 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed',
  secondary:
    'w-8 h-8 inline-flex items-center justify-center rounded-lg text-slate-400 ' +
    'hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40 ' +
    'transition-all duration-150 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed',
  danger:
    'w-8 h-8 inline-flex items-center justify-center rounded-lg text-slate-400 ' +
    'hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 ' +
    'transition-all duration-150 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed',
};

// ─── Reusable Component ──────────────────────────────────────────────────────

export default function TableActions({
  onView,
  onEdit,
  onDelete,
  viewTitle = 'View details',
  editTitle = 'Edit',
  deleteTitle = 'Delete',
  viewDisabled = false,
  editDisabled = false,
  deleteDisabled = false,
  isViewing = false,
  isEditing = false,
  isDeleting = false,
  style = 'tinted',
  actions,
  children,
  className = '',
}: TableActionsProps) {
  const getBtnClass = (variant: 'primary' | 'secondary' | 'danger') =>
    style === 'ghost' ? GHOST_CLASSES[variant] : TINTED_CLASSES[variant];

  // If explicit custom actions array is provided, render those
  if (actions && actions.length > 0) {
    const visibleActions = actions.filter((a) => a.visible !== false);
    if (visibleActions.length === 0) {
      return <span className="text-xs text-txt-sub/50">No actions</span>;
    }

    return (
      <div
        className={`flex h-full items-center gap-1.5 ${className}`}
        onClick={(e) => e.stopPropagation()}
      >
        {visibleActions.map((action, idx) => {
          const variant = action.variant ?? 'primary';
          const btnClass = getBtnClass(variant);

          return (
            <button
              key={action.key ?? idx}
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                if (!action.loading && !action.disabled) {
                  action.onClick(e);
                }
              }}
              disabled={action.loading || action.disabled}
              className={btnClass}
              title={action.label}
              aria-label={action.label}
            >
              {action.loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  {action.icon}
                  {action.showText && (
                    <span className="ml-1.5 text-xs font-semibold">
                      {action.label}
                    </span>
                  )}
                </>
              )}
            </button>
          );
        })}
        {children}
      </div>
    );
  }

  return (
    <div
      className={`flex h-full items-center gap-1.5 ${className}`}
      onClick={(e) => e.stopPropagation()}
    >
      {onView && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            if (!viewDisabled && !isViewing) onView();
          }}
          disabled={viewDisabled || isViewing}
          className={getBtnClass('primary')}
          title={viewTitle}
          aria-label={viewTitle}
        >
          {isViewing ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Eye className="h-4 w-4" />
          )}
        </button>
      )}

      {onEdit && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            if (!editDisabled && !isEditing) onEdit();
          }}
          disabled={editDisabled || isEditing}
          className={getBtnClass('secondary')}
          title={editTitle}
          aria-label={editTitle}
        >
          {isEditing ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Pencil className="h-4 w-4" />
          )}
        </button>
      )}

      {onDelete && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            if (!deleteDisabled && !isDeleting) onDelete();
          }}
          disabled={deleteDisabled || isDeleting}
          className={getBtnClass('danger')}
          title={deleteTitle}
          aria-label={deleteTitle}
        >
          {isDeleting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Trash2 className="h-4 w-4" />
          )}
        </button>
      )}

      {children}
    </div>
  );
}

// ─── Helper for CommonDataGrid actions array ─────────────────────────────────

export interface CreateTableActionsOptions<T> {
  onView?: (row: T) => void;
  onEdit?: (row: T) => void;
  onDelete?: (row: T) => void;
  viewTitle?: string;
  editTitle?: string;
  deleteTitle?: string;
  isViewVisible?: (row: T) => boolean;
  isEditVisible?: (row: T) => boolean;
  isDeleteVisible?: (row: T) => boolean;
  isViewDisabled?: (row: T) => boolean;
  isEditDisabled?: (row: T) => boolean;
  isDeleteDisabled?: (row: T) => boolean;
  isDeleting?: (row: T) => boolean;
  extraActions?: GridAction<T>[];
}

/**
 * Convenience helper to create a standard View / Edit / Delete GridAction[]
 * array for CommonDataGrid without boilerplate.
 */
export function createTableActions<T>({
  onView,
  onEdit,
  onDelete,
  viewTitle = 'View',
  editTitle = 'Edit',
  deleteTitle = 'Delete',
  isViewVisible,
  isEditVisible,
  isDeleteVisible,
  isViewDisabled,
  isEditDisabled,
  isDeleteDisabled,
  isDeleting,
  extraActions = [],
}: CreateTableActionsOptions<T>): GridAction<T>[] {
  const result: GridAction<T>[] = [];

  if (onView) {
    result.push({
      label: viewTitle,
      icon: <Eye className="h-4 w-4" />,
      variant: 'primary',
      onClick: onView,
      visible: isViewVisible,
      disabled: isViewDisabled,
    });
  }

  if (onEdit) {
    result.push({
      label: editTitle,
      icon: <Pencil className="h-4 w-4" />,
      variant: 'secondary',
      onClick: onEdit,
      visible: isEditVisible,
      disabled: isEditDisabled,
    });
  }

  if (onDelete) {
    result.push({
      label: deleteTitle,
      icon: <Trash2 className="h-4 w-4" />,
      variant: 'danger',
      onClick: onDelete,
      visible: isDeleteVisible,
      disabled: isDeleteDisabled,
      loading: isDeleting,
    });
  }

  if (extraActions.length > 0) {
    result.push(...extraActions);
  }

  return result;
}

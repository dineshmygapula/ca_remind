import { ReactNode } from "react";
import { Plus, X } from "lucide-react";
import SortDropdown, { SortDropdownProps } from "./SortDropdown";

const ACTION_VARIANTS = {
  navy: "bg-navy hover:bg-navy-hover text-white",
  amber: "bg-[#f59e0b] hover:bg-[#d97706] text-slate-900",
} as const;

interface ResourcePageLayoutProps {
  title: string;
  description: string;
  actionLabel: string;
  onAction: () => void;
  actionVariant?: keyof typeof ACTION_VARIANTS;
  error?: string;
  onDismissError?: () => void;
  stats?: ReactNode;
  banner?: ReactNode;
  filters?: ReactNode;
  summary?: ReactNode;
  sort?: SortDropdownProps;
  children: ReactNode;
  overlays?: ReactNode;
}

export default function ResourcePageLayout({
  title,
  description,
  actionLabel,
  onAction,
  actionVariant = "navy",
  error,
  onDismissError,
  stats,
  banner,
  filters,
  summary,
  sort,
  children,
  overlays,
}: ResourcePageLayoutProps) {
  return (
    <div className="min-h-screen bg-bg py-8">
      <div className="mx-auto max-w-7xl space-y-6 px-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-txt-main">{title}</h1>
            <p className="mt-1 text-sm text-txt-sub">{description}</p>
          </div>
          <button
            type="button"
            onClick={onAction}
            className={`inline-flex cursor-pointer items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold shadow-xs transition-colors ${ACTION_VARIANTS[actionVariant]}`}
          >
            <Plus className="h-4 w-4" />
            <span>{actionLabel}</span>
          </button>
        </div>

        {error && (
          <div role="alert" className="alert alert-error flex items-center justify-between text-sm">
            <span>{error}</span>
            <button
              type="button"
              className="btn btn-ghost btn-xs btn-circle"
              aria-label="Dismiss error"
              onClick={onDismissError}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {stats && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">{stats}</div>
        )}

        {banner}
        {filters}

        {(summary || sort) && (
          <div className="flex items-center justify-between pt-1">
            <div>{summary}</div>
            {sort && <SortDropdown {...sort} />}
          </div>
        )}

        {children}
        {overlays}
      </div>
    </div>
  );
}
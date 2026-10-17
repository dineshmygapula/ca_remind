'use client';

import React from 'react';
import { Building2 } from 'lucide-react';
import SearchableSelect from '@/components/common/SearchableSelect';
import { SubjectListItem } from '@/types/subject';

export interface ClientSelectorProps {
  clients: SubjectListItem[];
  value: SubjectListItem | null;
  onChange: (client: SubjectListItem | null) => void;
  loading?: boolean;
  error?: string;
  label?: string;
  required?: boolean;
  placeholder?: string;
  emptyMessage?: string;
  className?: string;
}

export default function ClientSelector({
  clients,
  value,
  onChange,
  loading = false,
  error,
  label = 'Select Client',
  required = false,
  placeholder = 'Search and select client',
  emptyMessage = 'No matching clients',
  className = '',
}: ClientSelectorProps) {
  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      {label && (
        <label className="text-xs font-semibold text-txt-main">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}

      <SearchableSelect<SubjectListItem>
        options={clients}
        value={value}
        onChange={onChange}
        getOptionLabel={(c) => c.displayName || c.businessName || 'Unnamed'}
        getOptionKey={(c) => c.id}
        loading={loading}
        placeholder={placeholder}
        emptyMessage={
          clients.length === 0
            ? 'No clients found. Create a client first.'
            : emptyMessage
        }
        renderOption={(c) => (
          <div className="flex flex-col py-0.5">
            <span className="font-semibold text-txt-main text-sm">
              {c.displayName || c.businessName}
            </span>
            {c.email && (
              <span className="text-xs text-txt-sub">{c.email}</span>
            )}
          </div>
        )}
      />

      {error && (
        <p className="mt-0.5 text-xs font-medium leading-4 text-red-500">
          {error}
        </p>
      )}

      {value && (
        <div className="flex items-center justify-between px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-divider text-xs">
          <div className="flex items-center gap-2 text-txt-sub">
            <Building2 className="w-3.5 h-3.5 text-amber-500 shrink-0" />
            <span className="truncate">
              Selected:{' '}
              <strong className="text-txt-main">
                {value.displayName || value.businessName}
              </strong>
            </span>
          </div>
          <span className="font-mono text-[11px] text-txt-sub shrink-0">
            {value.phone || value.email || ''}
          </span>
        </div>
      )}
    </div>
  );
}

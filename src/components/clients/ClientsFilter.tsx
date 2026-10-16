'use client';

import { Search, ChevronDown } from 'lucide-react';
import type {
  StatusFilter,
  GstinFilter,
  ComplianceFilter,
} from '../../types/subject';

const STATUS_OPTIONS: { value: StatusFilter; label: string }[] = [
  { value: 'ALL', label: 'All Status' },
  { value: 'ACTIVE', label: 'Active' },
  { value: 'INACTIVE', label: 'Inactive' },
];

const GSTIN_OPTIONS: { value: GstinFilter; label: string }[] = [
  { value: 'ALL', label: 'All Clients' },
  { value: 'WITH_GST', label: 'With GSTIN' },
  { value: 'WITHOUT_GST', label: 'Without GSTIN' },
];

const COMPLIANCE_OPTIONS: { value: ComplianceFilter; label: string }[] = [
  { value: 'ALL', label: 'All Clients' },
  { value: 'GST', label: 'GST' },
  { value: 'TDS', label: 'TDS' },
  { value: 'ITR', label: 'ITR' },
  { value: 'ROC', label: 'ROC' },
  { value: 'MSME', label: 'MSME' },
];

interface ClientsFilterProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  statusFilter: StatusFilter;
  onStatusChange: (value: StatusFilter) => void;
  gstinFilter: GstinFilter;
  onGstinChange: (value: GstinFilter) => void;
  complianceFilter: ComplianceFilter;
  onComplianceChange: (value: ComplianceFilter) => void;
}

export default function ClientsFilter({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusChange,
  gstinFilter,
  onGstinChange,
  complianceFilter,
  onComplianceChange,
}: ClientsFilterProps) {
  const selectClass =
    'select select-bordered select-sm w-full bg-base-100 focus:outline-none focus:ring-2 focus:ring-primary/30';
  const labelClass = 'label-text text-sm font-medium text-base-content/80';

  return (
    <section className="rounded-xl border border-base-300 bg-base-100 p-4 shadow-sm sm:p-5">
      <div className="grid grid-cols-1 gap-3 md:grid-cols-12 md:gap-4">
        {/* Search */}
        <div className="md:col-span-4">
          <label className="input input-bordered input-sm flex w-full items-center gap-2 bg-base-100 focus-within:outline-none focus-within:ring-2 focus-within:ring-primary/30">
            <Search className="h-4 w-4 shrink-0 text-base-content/60" aria-hidden="true" />
            <input
              type="search"
              className="grow bg-transparent text-sm outline-none"
              placeholder="Search clients..."
              value={searchQuery}
              onChange={(event) => onSearchChange(event.target.value)}
              aria-label="Search clients"
            />
          </label>
        </div>

        {/* Status Filter */}
        <div className="md:col-span-2">
          <label className="mb-1 block">
            <span className={labelClass}>Status</span>
            <span className="relative mt-1 block">
              <select
                className={selectClass}
                value={statusFilter}
                onChange={(event) => onStatusChange(event.target.value as StatusFilter)}
              >
                {STATUS_OPTIONS.map(({ value, label }) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-base-content/60" aria-hidden="true" />
            </span>
          </label>
        </div>

        {/* GSTIN Filter */}
        <div className="md:col-span-3">
          <label className="mb-1 block">
            <span className={labelClass}>GST Status</span>
            <span className="relative mt-1 block">
              <select
                className={selectClass}
                value={gstinFilter}
                onChange={(event) => onGstinChange(event.target.value as GstinFilter)}
              >
                {GSTIN_OPTIONS.map(({ value, label }) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-base-content/60" aria-hidden="true" />
            </span>
          </label>
        </div>

        {/* Compliance Type Filter */}
        <div className="md:col-span-3">
          <label className="mb-1 block">
            <span className={labelClass}>Compliance Type</span>
            <span className="relative mt-1 block">
              <select
                className={selectClass}
                value={complianceFilter}
                onChange={(event) =>
                  onComplianceChange(event.target.value as ComplianceFilter)
                }
              >
                {COMPLIANCE_OPTIONS.map(({ value, label }) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-base-content/60" aria-hidden="true" />
            </span>
          </label>
        </div>
      </div>
    </section>
  );
}

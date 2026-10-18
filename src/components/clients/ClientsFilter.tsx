'use client';

import { useMemo } from 'react';
import FilterBar, { FilterSelectConfig } from '@/components/common/Filter';
import type {
  StatusFilter,
  GstinFilter,
  ComplianceFilter,
} from '@/types/subject';

const STATUS_OPTIONS: { value: StatusFilter; label: string }[] = [
  { value: 'ALL', label: 'All Statuses' },
  { value: 'ACTIVE', label: 'Active' },
  { value: 'INACTIVE', label: 'Inactive' },
];

const GSTIN_OPTIONS: { value: GstinFilter; label: string }[] = [
  { value: 'ALL', label: 'All GSTIN' },
  { value: 'WITH_GST', label: 'With GSTIN' },
  { value: 'WITHOUT_GST', label: 'Without GSTIN' },
];

const COMPLIANCE_OPTIONS: { value: ComplianceFilter; label: string }[] = [
  { value: 'ALL', label: 'All Compliances' },
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
  onReset?: () => void;
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
  onReset,
}: ClientsFilterProps) {
  const filters: FilterSelectConfig[] = useMemo(
    () => [
      {
        key: 'status',
        label: 'Status',
        value: statusFilter,
        options: STATUS_OPTIONS,
        onChange: (v) => onStatusChange(v as StatusFilter),
        widthClass: 'min-w-[130px]',
      },
      {
        key: 'gstin',
        label: 'GSTIN',
        value: gstinFilter,
        options: GSTIN_OPTIONS,
        onChange: (v) => onGstinChange(v as GstinFilter),
        widthClass: 'min-w-[140px]',
      },
      {
        key: 'compliance',
        label: 'Compliance',
        value: complianceFilter,
        options: COMPLIANCE_OPTIONS,
        onChange: (v) => onComplianceChange(v as ComplianceFilter),
        widthClass: 'min-w-[150px]',
      },
    ],
    [statusFilter, gstinFilter, complianceFilter, onStatusChange, onGstinChange, onComplianceChange]
  );

  return (
    <FilterBar
      searchValue={searchQuery}
      onSearchChange={onSearchChange}
      searchPlaceholder="Search by name, email, or phone..."
      filters={filters}
      onReset={onReset}
    />
  );
}

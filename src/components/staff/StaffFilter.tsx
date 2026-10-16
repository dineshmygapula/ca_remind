'use client';

import FilterBar from '@/components/common/Filter';
import { STATUS_OPTIONS, StaffStatusFilter, STAFF_ROLES } from '../../constants/staffConstants';

interface StaffFilterProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  statusFilter: StaffStatusFilter;
  onStatusChange: (value: StaffStatusFilter) => void;
  roleFilter: string;
  onRoleChange: (value: string) => void;
  onReset?: () => void;
}

export default function StaffFilter({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusChange,
  roleFilter,
  onRoleChange,
  onReset,
}: StaffFilterProps) {
  return (
    <FilterBar
      searchValue={searchQuery}
      onSearchChange={onSearchChange}
      searchPlaceholder="Search staff by name, email, or phone..."
      filters={[
        {
          key: 'status',
          label: 'Status',
          value: statusFilter,
          options: STATUS_OPTIONS,
          onChange: (v) => onStatusChange(v as StaffStatusFilter),
        },
        {
          key: 'role',
          label: 'Role',
          value: roleFilter || 'ALL',
          options: [{ value: 'ALL', label: 'All Roles' }, ...STAFF_ROLES],
          onChange: (v) => onRoleChange(v === 'ALL' ? '' : v),
        },
      ]}
      onReset={
        onReset ||
        (() => {
          onSearchChange('');
          onStatusChange('ALL');
          onRoleChange('');
        })
      }
    />
  );
}
'use client';

import FilterBar from '@/components/common/Filter';

interface TaskDefinitionsFilterProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  statusFilter: 'ALL' | 'ACTIVE' | 'INACTIVE';
  onStatusChange: (value: 'ALL' | 'ACTIVE' | 'INACTIVE') => void;
  scheduleFilter: string;
  onScheduleChange: (value: string) => void;
  autoCreateFilter: 'ALL' | 'ON' | 'OFF';
  onAutoCreateChange: (value: 'ALL' | 'ON' | 'OFF') => void;
  onReset?: () => void;
}

export default function TaskDefinitionsFilter({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusChange,
  scheduleFilter,
  onScheduleChange,
  autoCreateFilter,
  onAutoCreateChange,
  onReset,
}: TaskDefinitionsFilterProps) {
  const handleReset = () => {
    onSearchChange('');
    onStatusChange('ALL');
    onScheduleChange('');
    onAutoCreateChange('ALL');
    onReset?.();
  };

  return (
    <FilterBar
      searchValue={searchQuery}
      onSearchChange={onSearchChange}
      searchPlaceholder="Search rules by name or type"
      tabs={{
        options: [
          { label: 'All', value: '' },
          { label: 'Monthly', value: 'monthly' },
          { label: 'Quarterly', value: 'quarterly' },
          { label: 'Yearly', value: 'yearly' },
        ],
        value: scheduleFilter,
        onChange: onScheduleChange,
      }}
      filters={[
        {
          key: 'status',
          label: 'Status',
          value: statusFilter,
          options: [
            { label: 'All', value: 'ALL' },
            { label: 'Active', value: 'ACTIVE' },
            { label: 'Inactive', value: 'INACTIVE' },
          ],
          onChange: (v) => onStatusChange(v as 'ALL' | 'ACTIVE' | 'INACTIVE'),
        },
        {
          key: 'autoCreate',
          label: 'Auto-create',
          value: autoCreateFilter,
          options: [
            { label: 'All', value: 'ALL' },
            { label: 'Auto ON', value: 'ON' },
            { label: 'Auto OFF', value: 'OFF' },
          ],
          onChange: (v) => onAutoCreateChange(v as 'ALL' | 'ON' | 'OFF'),
        },
      ]}
      onReset={handleReset}
    />
  );
}
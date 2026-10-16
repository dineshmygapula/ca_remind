'use client';

import FilterBar, { FilterSelectConfig } from '@/components/common/Filter';
import { SCHEDULE_PATTERNS } from '@/constants/taskDefinition.constants';

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
  const filters: FilterSelectConfig[] = [
    {
      key: 'status',
      label: 'Status',
      value: statusFilter,
      options: [
        { value: 'ALL', label: 'All Status' },
        { value: 'ACTIVE', label: 'Active' },
        { value: 'INACTIVE', label: 'Inactive' },
      ],
      onChange: (val) => onStatusChange(val as 'ALL' | 'ACTIVE' | 'INACTIVE'),
    },
    {
      key: 'schedule',
      label: 'Schedule',
      value: scheduleFilter || 'ALL',
      options: [
        { value: 'ALL', label: 'All Schedules' },
        ...SCHEDULE_PATTERNS.map((p) => ({ value: p.value, label: p.label })),
      ],
      onChange: (val) => onScheduleChange(val === 'ALL' ? '' : val),
    },
    {
      key: 'autoCreate',
      label: 'Auto Create',
      value: autoCreateFilter,
      options: [
        { value: 'ALL', label: 'All' },
        { value: 'ON', label: 'Auto ON' },
        { value: 'OFF', label: 'Auto OFF' },
      ],
      onChange: (val) => onAutoCreateChange(val as 'ALL' | 'ON' | 'OFF'),
    },
  ];

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
      searchPlaceholder="Search task rules by name or type..."
      filters={filters}
      onReset={handleReset}
    />
  );
}
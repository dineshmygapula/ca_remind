'use client';

import { useMemo } from 'react';
import FilterBar, { FilterSelectConfig, DateRangeConfig } from '@/components/common/Filter';
import {
  STATUS_FILTER_OPTIONS,
  CHANNEL_FILTER_OPTIONS,
  TIME_FILTER_OPTIONS,
  ReminderStatusFilter,
  ReminderChannelFilter,
  ReminderTimeFilter,
} from '@/constants/reminderConstants';

interface RemindersFilterProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  statusFilter: ReminderStatusFilter;
  onStatusChange: (value: ReminderStatusFilter) => void;
  channelFilter: ReminderChannelFilter;
  onChannelChange: (value: ReminderChannelFilter) => void;
  timeFilter: ReminderTimeFilter;
  onTimeChange: (value: ReminderTimeFilter) => void;
  dateFrom: string;
  onDateFromChange: (value: string) => void;
  dateTo: string;
  onDateToChange: (value: string) => void;
  onReset: () => void;
}

export default function RemindersFilter({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusChange,
  channelFilter,
  onChannelChange,
  timeFilter,
  onTimeChange,
  dateFrom,
  onDateFromChange,
  dateTo,
  onDateToChange,
  onReset,
}: RemindersFilterProps) {
  const filters: FilterSelectConfig[] = useMemo(
    () => [
      {
        key: 'status',
        label: 'Status',
        value: statusFilter,
        options: STATUS_FILTER_OPTIONS,
        onChange: (v) => onStatusChange(v as ReminderStatusFilter),
        widthClass: 'min-w-[140px]',
      },
      {
        key: 'channel',
        label: 'Channel',
        value: channelFilter,
        options: CHANNEL_FILTER_OPTIONS,
        onChange: (v) => onChannelChange(v as ReminderChannelFilter),
        widthClass: 'min-w-[140px]',
      },
      {
        key: 'time',
        label: 'When',
        value: timeFilter,
        options: TIME_FILTER_OPTIONS,
        onChange: (v) => onTimeChange(v as ReminderTimeFilter),
        widthClass: 'min-w-[130px]',
      },
    ],
    [statusFilter, channelFilter, timeFilter, onStatusChange, onChannelChange, onTimeChange]
  );

  const dateRange: DateRangeConfig = useMemo(
    () => ({
      fromLabel: 'From Date',
      toLabel: 'To Date',
      fromValue: dateFrom,
      toValue: dateTo,
      onFromChange: onDateFromChange,
      onToChange: onDateToChange,
    }),
    [dateFrom, dateTo, onDateFromChange, onDateToChange]
  );

  return (
    <FilterBar
      searchValue={searchQuery}
      onSearchChange={onSearchChange}
      searchPlaceholder="Search by task title or client name..."
      filters={filters}
      dateRange={dateRange}
      onReset={onReset}
    />
  );
}
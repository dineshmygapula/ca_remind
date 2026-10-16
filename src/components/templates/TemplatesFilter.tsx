'use client';

import FilterBar from '@/components/common/Filter';
import {
  STATUS_FILTER_OPTIONS,
  CHANNEL_FILTER_OPTIONS,
  REMINDER_TYPE_FILTER_OPTIONS,
  StatusFilter,
  ChannelFilter,
  ReminderTypeFilter,
} from '@/constants/messageTemplateConstants';

interface TemplatesFilterProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  statusFilter: StatusFilter;
  onStatusChange: (value: StatusFilter) => void;
  channelFilter: ChannelFilter;
  onChannelChange: (value: ChannelFilter) => void;
  reminderTypeFilter: ReminderTypeFilter;
  onReminderTypeChange: (value: ReminderTypeFilter) => void;
  onReset?: () => void;
}

export default function TemplatesFilter({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusChange,
  channelFilter,
  onChannelChange,
  reminderTypeFilter,
  onReminderTypeChange,
  onReset,
}: TemplatesFilterProps) {
  return (
    <FilterBar
      searchValue={searchQuery}
      onSearchChange={onSearchChange}
      searchPlaceholder="Search templates by name..."
      filters={[
        {
          key: 'status',
          label: 'Status',
          value: statusFilter,
          options: STATUS_FILTER_OPTIONS,
          onChange: (v) => onStatusChange(v as StatusFilter),
        },
        {
          key: 'channel',
          label: 'Channel',
          value: channelFilter,
          options: CHANNEL_FILTER_OPTIONS,
          onChange: (v) => onChannelChange(v as ChannelFilter),
        },
        {
          key: 'reminderType',
          label: 'Type',
          value: reminderTypeFilter,
          options: REMINDER_TYPE_FILTER_OPTIONS,
          onChange: (v) => onReminderTypeChange(v as ReminderTypeFilter),
        },
      ]}
      onReset={
        onReset ||
        (() => {
          onSearchChange('');
          onStatusChange('ALL');
          onChannelChange('ALL');
          onReminderTypeChange('ALL');
        })
      }
    />
  );
}
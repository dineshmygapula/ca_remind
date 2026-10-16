'use client';

import FilterBar from '@/components/common/Filter';

interface ReminderDefinitionsFilterProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  channelFilter: string;
  onChannelChange: (value: string) => void;
  statusFilter: 'ALL' | 'ACTIVE' | 'INACTIVE';
  onStatusChange: (value: 'ALL' | 'ACTIVE' | 'INACTIVE') => void;
  onReset?: () => void;
}

const STATUS_OPTIONS = [
  { value: 'ALL', label: 'All Status' },
  { value: 'ACTIVE', label: 'Active' },
  { value: 'INACTIVE', label: 'Inactive' },
];

const CHANNEL_OPTIONS = [
  { value: '', label: 'All Channels' },
  { value: 'EMAIL', label: 'Email' },
  { value: 'WHATSAPP', label: 'WhatsApp' },
  { value: 'SMS', label: 'SMS' },
  { value: 'IN_APP', label: 'In-App' },
];

export default function ReminderDefinitionsFilter({
  searchQuery,
  onSearchChange,
  channelFilter,
  onChannelChange,
  statusFilter,
  onStatusChange,
  onReset,
}: ReminderDefinitionsFilterProps) {
  return (
    <FilterBar
      searchValue={searchQuery}
      onSearchChange={onSearchChange}
      searchPlaceholder="Search by name..."
      filters={[
        {
          key: 'channel',
          label: 'Channel',
          value: channelFilter,
          options: CHANNEL_OPTIONS,
          onChange: onChannelChange,
        },
        {
          key: 'status',
          label: 'Status',
          value: statusFilter,
          options: STATUS_OPTIONS,
          onChange: (v) => onStatusChange(v as 'ALL' | 'ACTIVE' | 'INACTIVE'),
        },
      ]}
      onReset={
        onReset ||
        (() => {
          onSearchChange('');
          onChannelChange('');
          onStatusChange('ALL');
        })
      }
    />
  );
}
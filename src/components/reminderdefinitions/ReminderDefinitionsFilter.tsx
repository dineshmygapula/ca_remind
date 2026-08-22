'use client';

import { Box, TextField, MenuItem, Grid } from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';

interface ReminderDefinitionsFilterProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  channelFilter: string;
  onChannelChange: (value: string) => void;
  statusFilter: 'ALL' | 'ACTIVE' | 'INACTIVE';
  onStatusChange: (value: 'ALL' | 'ACTIVE' | 'INACTIVE') => void;
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
}: ReminderDefinitionsFilterProps) {
  return (
    <Box sx={{ bgcolor: 'white', p: 2, borderRadius: 1, boxShadow: 1 }}>
      <Grid container spacing={2}>
        {/* Search */}
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            size="small"
            placeholder="Search by name..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            InputProps={{
              startAdornment: <SearchIcon sx={{ color: 'text.secondary', mr: 1 }} />,
            }}
          />
        </Grid>

        {/* Channel Filter */}
        <Grid item xs={12} sm={6} md={3}>
          <TextField
            fullWidth
            select
            size="small"
            label="Channel"
            value={channelFilter}
            onChange={(e) => onChannelChange(e.target.value)}
          >
            {CHANNEL_OPTIONS.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>
        </Grid>

        {/* Status Filter */}
        <Grid item xs={12} sm={6} md={3}>
          <TextField
            fullWidth
            select
            size="small"
            label="Status"
            value={statusFilter}
            onChange={(e) => onStatusChange(e.target.value as 'ALL' | 'ACTIVE' | 'INACTIVE')}
          >
            {STATUS_OPTIONS.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>
        </Grid>
      </Grid>
    </Box>
  );
}
'use client';

import {
  Paper,
  TextField,
  MenuItem,
  Grid,
  InputAdornment,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
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
}: TemplatesFilterProps) {
  return (
    <Paper sx={{ p: 2.5 }}>
      <Grid container spacing={2}>
        {/* Search */}
        <Grid size={{ xs: 12, md: 5 }}>
          <TextField
            fullWidth
            size="small"
            placeholder="Search templates by name..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
            }}
          />
        </Grid>

        {/* Status Filter */}
        <Grid size={{ xs: 12, sm: 4, md: 2 }}>
          <TextField
            select
            fullWidth
            size="small"
            label="Status"
            value={statusFilter}
            onChange={(e) => onStatusChange(e.target.value as StatusFilter)}
          >
            {STATUS_FILTER_OPTIONS.map((opt) => (
              <MenuItem key={opt.value} value={opt.value}>
                {opt.label}
              </MenuItem>
            ))}
          </TextField>
        </Grid>

        {/* Channel Filter */}
        <Grid size={{ xs: 12, sm: 4, md: 2 }}>
          <TextField
            select
            fullWidth
            size="small"
            label="Channel"
            value={channelFilter}
            onChange={(e) => onChannelChange(e.target.value as ChannelFilter)}
          >
            {CHANNEL_FILTER_OPTIONS.map((opt) => (
              <MenuItem key={opt.value} value={opt.value}>
                {opt.label}
              </MenuItem>
            ))}
          </TextField>
        </Grid>

        {/* Reminder Type Filter */}
        <Grid size={{ xs: 12, sm: 4, md: 3 }}>
          <TextField
            select
            fullWidth
            size="small"
            label="Reminder Type"
            value={reminderTypeFilter}
            onChange={(e) => onReminderTypeChange(e.target.value as ReminderTypeFilter)}
          >
            {REMINDER_TYPE_FILTER_OPTIONS.map((opt) => (
              <MenuItem key={opt.value} value={opt.value}>
                {opt.label}
              </MenuItem>
            ))}
          </TextField>
        </Grid>
      </Grid>
    </Paper>
  );
}
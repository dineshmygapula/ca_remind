'use client';

import {
  Paper,
  TextField,
  MenuItem,
  Grid,
  InputAdornment,
  Button,
  
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
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
  return (
    <Paper sx={{ p: 2.5 }}>
      <Grid container spacing={2}>
        {/* Search */}
        <Grid size={{ xs: 12, md: 4 }}>
          <TextField
            fullWidth
            size="small"
            placeholder="Search by task or client name..."
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

        {/* Time Filter — Overdue / Today / Upcoming */}
        <Grid size={{ xs: 12, sm: 6, md: 2 }}>
          <TextField
            select
            fullWidth
            size="small"
            label="When"
            value={timeFilter}
            onChange={(e) => onTimeChange(e.target.value as ReminderTimeFilter)}
          >
            {TIME_FILTER_OPTIONS.map((opt) => (
              <MenuItem key={opt.value} value={opt.value}>
                {opt.label}
              </MenuItem>
            ))}
          </TextField>
        </Grid>

        {/* Status Filter */}
        <Grid size={{ xs: 12, sm: 6, md: 2 }}>
          <TextField
            select
            fullWidth
            size="small"
            label="Status"
            value={statusFilter}
            onChange={(e) => onStatusChange(e.target.value as ReminderStatusFilter)}
          >
            {STATUS_FILTER_OPTIONS.map((opt) => (
              <MenuItem key={opt.value} value={opt.value}>
                {opt.label}
              </MenuItem>
            ))}
          </TextField>
        </Grid>

        {/* Channel Filter */}
        <Grid size={{ xs: 12, sm: 6, md: 2 }}>
          <TextField
            select
            fullWidth
            size="small"
            label="Channel"
            value={channelFilter}
            onChange={(e) => onChannelChange(e.target.value as ReminderChannelFilter)}
          >
            {CHANNEL_FILTER_OPTIONS.map((opt) => (
              <MenuItem key={opt.value} value={opt.value}>
                {opt.label}
              </MenuItem>
            ))}
          </TextField>
        </Grid>

        {/* Reset Button */}
        <Grid size={{ xs: 12, sm: 6, md: 2 }}>
          <Button
            fullWidth
            variant="outlined"
            startIcon={<RestartAltIcon fontSize="small" />}
            onClick={onReset}
            sx={{ height: '40px', textTransform: 'none', fontWeight: 600 }}
          >
            Reset
          </Button>
        </Grid>

        {/* Date Range */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <TextField
            type="date"
            fullWidth
            size="small"
            label="From Date"
            value={dateFrom}
            onChange={(e) => onDateFromChange(e.target.value)}
            InputLabelProps={{ shrink: true }}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <TextField
            type="date"
            fullWidth
            size="small"
            label="To Date"
            value={dateTo}
            onChange={(e) => onDateToChange(e.target.value)}
            InputLabelProps={{ shrink: true }}
            inputProps={{ min: dateFrom || undefined }}
          />
        </Grid>
      </Grid>
    </Paper>
  );
}
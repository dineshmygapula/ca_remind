'use client';

import {
  Paper,
  TextField,
  MenuItem,
  Grid,
  InputAdornment,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { SCHEDULE_PATTERNS } from '../../constants/taskDefinition.constants';

interface TaskDefinitionsFilterProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  statusFilter: 'ALL' | 'ACTIVE' | 'INACTIVE';
  onStatusChange: (value: 'ALL' | 'ACTIVE' | 'INACTIVE') => void;
  scheduleFilter: string;
  onScheduleChange: (value: string) => void;
  autoCreateFilter: 'ALL' | 'ON' | 'OFF';
  onAutoCreateChange: (value: 'ALL' | 'ON' | 'OFF') => void;
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
}: TaskDefinitionsFilterProps) {
  return (
    <Paper sx={{ p: 2.5 }}>
      <Grid container spacing={2}>

        {/* Search */}
        <Grid size={{ xs: 12, md: 5 }}>
          <TextField
            fullWidth
            size="small"
            placeholder="Search task definitions..."
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
        <Grid size={{ xs: 6, sm: 2}}>
          <TextField
            select
            fullWidth
            size="small"
            label="Status"
            value={statusFilter}
            onChange={(e) => onStatusChange(e.target.value as 'ALL' | 'ACTIVE' | 'INACTIVE')}
          >
            <MenuItem value="ALL">All Status</MenuItem>
            <MenuItem value="ACTIVE">Active</MenuItem>
            <MenuItem value="INACTIVE">Inactive</MenuItem>
          </TextField>
        </Grid>

        {/* Schedule Filter */}
        <Grid size={{ xs: 6, sm: 2}}>
          <TextField
            select
            fullWidth
            size="small"
            label="Schedule"
            value={scheduleFilter}
            onChange={(e) => onScheduleChange(e.target.value)}
          >
            <MenuItem value="">All Schedules</MenuItem>
            {SCHEDULE_PATTERNS.map((pattern) => (
              <MenuItem key={pattern.value} value={pattern.value}>
                {pattern.label}
              </MenuItem>
            ))}
          </TextField>
        </Grid>

        {/* Auto Create Filter */}
        <Grid size={{ xs: 6, sm: 2}}>
          <TextField
            select
            fullWidth
            size="small"
            label="Auto Create"
            value={autoCreateFilter}
            onChange={(e) => onAutoCreateChange(e.target.value as 'ALL' | 'ON' | 'OFF')}
          >
            <MenuItem value="ALL">All</MenuItem>
            <MenuItem value="ON">Auto ON</MenuItem>
            <MenuItem value="OFF">Auto OFF</MenuItem>
          </TextField>
        </Grid>

      </Grid>
    </Paper>
  );
}
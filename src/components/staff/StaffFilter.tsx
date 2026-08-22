'use client';

import { Box, TextField,Grid } from '@mui/material';

import { Search as SearchIcon } from '@mui/icons-material';
import { STATUS_OPTIONS, StaffStatusFilter } from "../../constants/staffConstants"
import { MenuItem } from '@mui/material';
interface StaffFilterProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  statusFilter: StaffStatusFilter; // ← Use imported type
  onStatusChange: (value: StaffStatusFilter) => void; // ← Use imported type
  roleFilter: string;
  onRoleChange: (value: string) => void;
}

export default function StaffFilter({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusChange,
  roleFilter,
  onRoleChange,
}: StaffFilterProps) {
  return (
    <Box sx={{ bgcolor: 'background.paper', p: 2, borderRadius: 1, boxShadow: 1 }}>
      <Grid container spacing={2}>
        {/* Search */}
        <Grid size={{ xs: 12, md: 6 }}>
          <TextField
            fullWidth
            size="small"
            placeholder="Search staff by name, email, or phone..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            InputProps={{
              startAdornment: <SearchIcon sx={{ color: 'text.secondary', mr: 1 }} />,
            }}
          />
        </Grid>

        {/* Status Filter */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <TextField
            fullWidth
            select
            size="small"
            label="Status"
            value={statusFilter}
            onChange={(e) => onStatusChange(e.target.value as StaffStatusFilter)}
          >
            {STATUS_OPTIONS.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>
        </Grid>

        {/* Role Filter */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <TextField
            fullWidth
            size="small"
            label="Filter by Role"
            value={roleFilter}
            onChange={(e) => onRoleChange(e.target.value)}
            placeholder="e.g., Admin, Accountant"
          />
        </Grid>
      </Grid>
    </Box>
  );
}
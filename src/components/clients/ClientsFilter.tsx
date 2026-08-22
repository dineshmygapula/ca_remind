'use client';

import {
  Paper,
  TextField,
  MenuItem,
  Grid,
  InputAdornment,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import{StatusFilter,GstinFilter,ComplianceFilter} from '../../types/subject'


// ── Constants ──────────────────────────────────────────
const STATUS_OPTIONS: { value: StatusFilter; label: string }[] = [
  { value: 'ALL',      label: 'All Status' },
  { value: 'ACTIVE',   label: 'Active'     },
  { value: 'INACTIVE', label: 'Inactive'   },
];

const GSTIN_OPTIONS: { value: GstinFilter; label: string }[] = [
  { value: 'ALL',          label: 'All Clients'    },
  { value: 'WITH_GST',     label: 'With GSTIN'     },
  { value: 'WITHOUT_GST',  label: 'Without GSTIN'  },
];

const COMPLIANCE_OPTIONS: { value: ComplianceFilter; label: string }[] = [
  { value: 'ALL', label: 'All Clients' },
  { value: 'GST', label: 'GST'         },
  { value: 'TDS', label: 'TDS'         },
  { value: 'ITR', label: 'ITR'         },
  { value: 'ROC', label: 'ROC'         },
  { value: 'MSME', label: 'MSME'         },
  
  
];

// ── Props ──────────────────────────────────────────────
interface ClientsFilterProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  statusFilter: StatusFilter;
  onStatusChange: (value: StatusFilter) => void;
  gstinFilter: GstinFilter;
  onGstinChange: (value: GstinFilter) => void;
  complianceFilter: ComplianceFilter;
  onComplianceChange: (value: ComplianceFilter) => void;
}

// ── Component ──────────────────────────────────────────
export default function ClientsFilter({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusChange,
  gstinFilter,
  onGstinChange,
  complianceFilter,
  onComplianceChange,
}: ClientsFilterProps) {
  return (
    <Paper sx={{ p: 2.5 }}>
      <Grid container spacing={2}>

        {/* Search */}
        <Grid size={{ xs: 12, md: 4 }}>
          <TextField
            fullWidth
            size="small"
            placeholder="Search clients..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                </InputAdornment>
              ),
            }}
          />
        </Grid>

        {/* Status Filter */}
        <Grid size={{ xs: 12, sm: 6, md: 2 }}>
          <TextField
            select
            fullWidth
            size="small"
            label="Status"
            value={statusFilter}
            onChange={(e) => onStatusChange(e.target.value as StatusFilter)}
          >
            {STATUS_OPTIONS.map(({ value, label }) => (
              <MenuItem key={value} value={value}>{label}</MenuItem>
            ))}
          </TextField>
        </Grid>

        {/* GSTIN Filter */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <TextField
            select
            fullWidth
            size="small"
            label="GST Status"
            value={gstinFilter}
            onChange={(e) => onGstinChange(e.target.value as GstinFilter)}
          >
            {GSTIN_OPTIONS.map(({ value, label }) => (
              <MenuItem key={value} value={value}>{label}</MenuItem>
            ))}
          </TextField>
        </Grid>

        {/* Compliance Type Filter */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <TextField
            select
            fullWidth
            size="small"
            label="Compliance Type"
            value={complianceFilter}
            onChange={(e) => onComplianceChange(e.target.value as ComplianceFilter)}
          >
            {COMPLIANCE_OPTIONS.map(({ value, label }) => (
              <MenuItem key={value} value={value}>{label}</MenuItem>
            ))}
          </TextField>
        </Grid>

      </Grid>
    </Paper>
  );
}
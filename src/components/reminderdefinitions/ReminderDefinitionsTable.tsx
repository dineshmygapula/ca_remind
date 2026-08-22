'use client';

import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
  Tooltip,
  Typography,
  Box,
  CircularProgress,
} from '@mui/material';
import {
  Visibility as ViewIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Email as EmailIcon,
  WhatsApp as WhatsAppIcon,
  Sms as SmsIcon,
  Notifications as NotifIcon,
} from '@mui/icons-material';
import { V2ReminderDefinition } from '@/types/v2ReminderDefinition.types';

interface ReminderDefinitionsTableProps {
  definitions: V2ReminderDefinition [];
  loading: boolean;
  onView: (definitionId: string) => void;
  onEdit: (definitionId: string) => void;
  onDelete: (definitionId: string, name: string) => void;
}

const getChannelIcon = (channel: string) => {
  switch (channel) {
    case 'EMAIL':
      return <EmailIcon fontSize="small" />;
    case 'WHATSAPP':
      return <WhatsAppIcon fontSize="small" sx={{ color: '#25D366' }} />;
    case 'SMS':
      return <SmsIcon fontSize="small" />;
    
    default:
      return null;
  }
};

const getChannelColor = (channel: string) => {
  switch (channel) {
    case 'WHATSAPP':
      return 'success';
    case 'EMAIL':
      return 'primary';
    case 'SMS':
      return 'secondary';
   
    default:
      return 'default';
  }
};

export default function ReminderDefinitionsTable({
  definitions,
  loading,
  onView,
  onEdit,
  onDelete,
}: ReminderDefinitionsTableProps) {
  if (loading) {
    return (
      <Paper sx={{ p: 8, textAlign: 'center' }}>
        <CircularProgress />
        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          Loading reminder definitions...
        </Typography>
      </Paper>
    );
  }

  if (definitions.length === 0) {
    return (
      <Paper sx={{ p: 8, textAlign: 'center' }}>
        <Typography variant="h6" color="text.secondary">
          No reminder definitions found
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Create a reminder definition to get started
        </Typography>
      </Paper>
    );
  }

  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow sx={{ bgcolor: 'grey.50' }}>
            <TableCell sx={{ fontWeight: 600 }}>Name</TableCell>
            <TableCell sx={{ fontWeight: 600 }}>Channel</TableCell>
            <TableCell sx={{ fontWeight: 600 }}>Offset Days</TableCell>
            <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
            <TableCell align="right" sx={{ fontWeight: 600 }}>
              Actions
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {definitions.map((def) => (
            <TableRow
              key={def.id}
              hover
              sx={{ cursor: 'pointer', '&:hover': { bgcolor: 'action.hover' } }}
              onClick={() => onView(def.id)}
            >
              {/* Name */}
              <TableCell>
                <Typography variant="body2" fontWeight={500}>
                  {def.name}
                </Typography>
              </TableCell>

              {/* Channel */}
              <TableCell>
                <Chip
                  icon={getChannelIcon(def.channel)}
                  label={def.channel}
                  size="small"
                  color={getChannelColor(def.channel) as any}
                />
              </TableCell>

              {/* Offset Days */}
              <TableCell>
                <Typography variant="body2">
                  {def.offsetDays > 0 && `${def.offsetDays} days before`}
                  {def.offsetDays === 0 && 'On due date'}
                  {def.offsetDays < 0 && `${Math.abs(def.offsetDays)} days after`}
                </Typography>
              </TableCell>

              {/* Status */}
              <TableCell>
                <Chip
                  label={def.isActive ? 'Active' : 'Inactive'}
                  size="small"
                  color={def.isActive ? 'success' : 'default'}
                />
              </TableCell>

              {/* Actions */}
              <TableCell align="right" onClick={(e) => e.stopPropagation()}>
                <Tooltip title="View Details">
                  <IconButton size="small" onClick={() => onView(def.id)}>
                    <ViewIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Edit Reminder">
                  <IconButton size="small" onClick={() => onEdit(def.id)}>
                    <EditIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Delete Reminder">
                  <IconButton size="small" color="error" onClick={() => onDelete(def.id, def.name)}>
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
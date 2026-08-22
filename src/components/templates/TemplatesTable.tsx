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
  Stack,
} from '@mui/material';
import {
  Visibility as ViewIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  } from '@mui/icons-material';
import { MessageTemplateListItem } from '@/types/messageTemplate.types';
import { Email as EmailIcon, WhatsApp as WhatsAppIcon } from '@mui/icons-material';

interface TemplatesTableProps {
  templates: MessageTemplateListItem[];
  loading: boolean;
  onView: (templateId: string) => void;
  onEdit: (templateId: string) => void;
  onDelete: (templateId: string, templateName: string) => void;
}

export default function TemplatesTable({
  templates,
  loading,
  onView,
  onEdit,
  onDelete,
}: TemplatesTableProps) {
  // ─── Loading State ────────────────────────────────────────────────────────
  if (loading) {
    return (
      <Paper sx={{ p: 8, textAlign: 'center' }}>
        <CircularProgress />
        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          Loading templates...
        </Typography>
      </Paper>
    );
  }

  // ─── Empty State ──────────────────────────────────────────────────────────
  if (templates.length === 0) {
    return (
      <Paper sx={{ p: 8, textAlign: 'center' }}>
        <Typography variant="h6" color="text.secondary">
          No templates found
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Create your first message template to get started
        </Typography>
      </Paper>
    );
  }

  // ─── Get Channel Icon ─────────────────────────────────────────────────────
  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case 'email':
        return <EmailIcon fontSize="small" sx={{ color: '#10b981' }} />;
      case 'whatsapp':
        return <WhatsAppIcon fontSize="small" sx={{ color: '#25D366' }} />;
      
      default:
        return null;
    }
  };

  // ─── Get Reminder Type Color ──────────────────────────────────────────────
  const getReminderTypeColor = (type: string) => {
    switch (type) {
      case 'GST':
        return '#16a34a';
      case 'TDS':
        return '#374151';
      case 'ITR':
        return '#2563eb';
      case 'ROC':
        return '#7c3aed';
      case 'MSME': return '#ea580c';
      default:
        return '#64748b';
    }
  };

  // ─── Table ────────────────────────────────────────────────────────────────
  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow sx={{ bgcolor: '#f8fafc' }}>
            <TableCell
              sx={{
                fontWeight: 700,
                color: '#0b1f3a',
                fontSize: '0.8rem',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
              }}
            >
              Template Name
            </TableCell>
            <TableCell sx={{ fontWeight: 600 }}>Channels</TableCell>
            <TableCell sx={{ fontWeight: 600 }}>Reminder Type</TableCell>
            <TableCell sx={{ fontWeight: 600 }}>Category</TableCell>
            <TableCell sx={{ fontWeight: 600 }}>Placeholders</TableCell>
            <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
            <TableCell align="right" sx={{ fontWeight: 600 }}>
              Actions
            </TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {templates.map((template) => (
            <TableRow
              key={template.id}
              hover
              sx={{
                cursor: 'pointer',
                '&:hover': { bgcolor: 'action.hover' },
              }}
              onClick={() => onView(template.id)}
            >
              {/* Template Name */}
              <TableCell>
                <Typography variant="body2" fontWeight={600}>
                  {template.name}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  ID: {template.id.slice(0, 8)}...
                </Typography>
              </TableCell>

              {/* Channels */}
              <TableCell>
                <Stack direction="row" spacing={0.5} alignItems="center">
                  {template.channels.map((channel) => (
                    <Tooltip
                      key={channel}
                      title={channel === 'email' ? 'Email' : channel === 'whatsapp' ? 'WhatsApp' : channel === 'sms' ? 'SMS' : 'In-App'}
                    >
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          p: 0.5,
                          borderRadius: 1,
                          bgcolor: 'action.hover',
                        }}
                      >
                        {getChannelIcon(channel)}
                      </Box>
                    </Tooltip>
                  ))}
                  {template.channels.length === 0 && (
                    <Typography variant="caption" color="text.disabled">
                      No channels
                    </Typography>
                  )}
                </Stack>
              </TableCell>

              {/* Reminder Type */}
              <TableCell>
                <Chip
                  label={template.reminder_type}
                  size="small"
                  sx={{
                    bgcolor: getReminderTypeColor(template.reminder_type),
                    color: '#fff',
                    fontWeight: 600,
                    fontSize: '0.75rem',
                  }}
                />
              </TableCell>

              {/* Category */}
              <TableCell>
                <Typography variant="body2">{template.businessCategory}</Typography>
              </TableCell>

              {/* Placeholders */}
              <TableCell>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {template.placeholders.slice(0, 3).map((placeholder) => (
                    <Chip
                      key={placeholder}
                      label={`[${placeholder}]`}
                      size="small"
                      variant="outlined"
                      sx={{
                        fontSize: '0.65rem',
                        height: '20px',
                        fontFamily: 'monospace',
                      }}
                    />
                  ))}
                  {template.placeholders.length > 3 && (
                    <Chip
                      label={`+${template.placeholders.length - 3}`}
                      size="small"
                      sx={{
                        fontSize: '0.65rem',
                        height: '20px',
                        bgcolor: '#e5e7eb',
                        fontWeight: 600,
                      }}
                    />
                  )}
                  {template.placeholders.length === 0 && (
                    <Typography variant="caption" color="text.disabled">
                      None
                    </Typography>
                  )}
                </Box>
              </TableCell>

              {/* Status */}
              <TableCell>
                <Chip
                  label={template.isActive ? 'Active' : 'Inactive'}
                  size="small"
                  color={template.isActive ? 'success' : 'default'}
                  sx={{ fontWeight: 600 }}
                />
              </TableCell>

              {/* Actions */}
              <TableCell align="right" onClick={(e) => e.stopPropagation()}>
                <Tooltip title="View Details">
                  <IconButton
                    size="small"
                    onClick={() => onView(template.id)}
                    sx={{
                      color: '#5A6380',
                      '&:hover': {
                        color: '#1A1F36',
                        backgroundColor: 'rgba(90,99,128,0.08)',
                      },
                    }}
                  >
                    <ViewIcon fontSize="small" />
                  </IconButton>
                </Tooltip>

                <Tooltip title="Edit Template">
                  <IconButton
                    size="small"
                    onClick={() => onEdit(template.id)}
                    sx={{
                      color: '#5A6380',
                      '&:hover': {
                        color: '#1A1F36',
                        backgroundColor: 'rgba(90,99,128,0.08)',
                      },
                    }}
                  >
                    <EditIcon fontSize="small" />
                  </IconButton>
                </Tooltip>

                <Tooltip title="Delete Template">
                  <IconButton
                    size="small"
                    onClick={() => onDelete(template.id, template.name)}
                    sx={{
                      color: '#5A6380',
                      '&:hover': {
                        color: '#C0392B',
                        backgroundColor: 'rgba(192,57,43,0.08)',
                      },
                    }}
                  >
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
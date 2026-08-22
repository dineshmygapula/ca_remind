'use client';

import { useState } from 'react';
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Box,
  IconButton,
  Chip,
  Divider,
  Stack,
  Button,
  Tooltip,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  //ContentCopy as DuplicateIcon,
  ExpandMore as ExpandMoreIcon,
  Email as EmailIcon,
  WhatsApp as WhatsAppIcon,
} from '@mui/icons-material';
import { MessageTemplate } from '@/types/messageTemplate.types';

interface TemplateCardProps {
  template: MessageTemplate;
  onEdit: (templateId: string) => void;
  onDelete: (templateId: string, name: string) => void;
}

export default function TemplateCard({ template, onEdit, onDelete }: TemplateCardProps) {
  const [expanded, setExpanded] = useState(false);

  const truncateText = (text: string, maxLength: number = 100) => {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + '...';
  };

  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        transition: 'all 0.3s ease',
        '&:hover': {
          boxShadow: 6,
          transform: 'translateY(-4px)',
        },
        border: '1px solid',
        borderColor: 'grey.200',
      }}
    >
      {/* Header */}
      <CardContent sx={{ flexGrow: 1, pb: 1 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={2}>
          <Box>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              {template.name}
            </Typography>
            <Stack direction="row" spacing={1} mt={1}>
              <Chip
                label={template.reminder_type}
                size="small"
                color="primary"
                variant="outlined"
              />
              <Chip
                label={template.isActive ? 'Active' : 'Inactive'}
                size="small"
                color={template.isActive ? 'success' : 'default'}
              />
            </Stack>
          </Box>
          <Stack direction="row" spacing={0.5}>
            {template.channels.includes('email') && (
              <Tooltip title="Email">
                <EmailIcon fontSize="small" color="action" />
              </Tooltip>
            )}
            {template.channels.includes('whatsapp') && (
              <Tooltip title="WhatsApp">
                <WhatsAppIcon fontSize="small" sx={{ color: '#25D366' }} />
              </Tooltip>
            )}
          </Stack>
        </Stack>

        <Divider sx={{ my: 2 }} />

        {/* Email Preview */}
        {template.templates.email && (
          <Box mb={2}>
            <Stack direction="row" alignItems="center" spacing={1} mb={1}>
              <EmailIcon fontSize="small" color="primary" />
              <Typography variant="subtitle2" fontWeight={600}>
                Email Template
              </Typography>
            </Stack>
            <Box sx={{ bgcolor: 'grey.50', p: 1.5, borderRadius: 1, border: '1px solid', borderColor: 'grey.200' }}>
              <Typography variant="caption" color="text.secondary" fontWeight={600}>
                Subject:
              </Typography>
              <Typography variant="body2" gutterBottom>
                {template.templates.email.subject}
              </Typography>
              <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ mt: 1, display: 'block' }}>
                Body:
              </Typography>
              <Typography variant="body2" sx={{ whiteSpace: 'pre-line' }}>
                {expanded
                  ? template.templates.email.body
                  : truncateText(template.templates.email.body, 100)}
              </Typography>
            </Box>
          </Box>
        )}

        {/* WhatsApp Preview */}
        {template.templates.whatsapp && (
          <Box mb={2}>
            <Stack direction="row" alignItems="center" spacing={1} mb={1}>
              <WhatsAppIcon fontSize="small" sx={{ color: '#25D366' }} />
              <Typography variant="subtitle2" fontWeight={600}>
                WhatsApp Template
              </Typography>
            </Stack>
            <Box sx={{ bgcolor: '#E7F8ED', p: 1.5, borderRadius: 1, border: '1px solid #25D366' }}>
              <Typography variant="body2" sx={{ whiteSpace: 'pre-line' }}>
                {expanded
                  ? template.templates.whatsapp.body
                  : truncateText(template.templates.whatsapp.body, 100)}
              </Typography>
            </Box>
          </Box>
        )}

        {/* Placeholders */}
        {template.placeholders.length > 0 && (
          <Box>
            <Typography variant="caption" color="text.secondary" fontWeight={600} gutterBottom display="block">
              Placeholders ({template.placeholders.length}):
            </Typography>
            <Stack direction="row" spacing={0.5} flexWrap="wrap" gap={0.5}>
              {template.placeholders.slice(0, expanded ? undefined : 3).map((placeholder) => (
                <Chip
                  key={placeholder}
                  label={`[${placeholder}]`}
                  size="small"
                  variant="outlined"
                  sx={{ fontSize: '0.7rem', fontFamily: 'monospace' }}
                />
              ))}
              {!expanded && template.placeholders.length > 3 && (
                <Chip label={`+${template.placeholders.length - 3} more`} size="small" />
              )}
            </Stack>
          </Box>
        )}
      </CardContent>

      {/* Actions */}
      <Divider />
      <CardActions sx={{ justifyContent: 'space-between', px: 2, py: 1.5 }}>
        <Button
          size="small"
          onClick={() => setExpanded(!expanded)}
          endIcon={
            <ExpandMoreIcon
              sx={{
                transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: 'transform 0.3s',
              }}
            />
          }
        >
          {expanded ? 'Show Less' : 'Read More'}
        </Button>

        <Stack direction="row" spacing={1}>
          <Tooltip title="Edit Template">
            <IconButton size="small" color="primary" onClick={() => onEdit(template.id)}>
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete Template">
            <IconButton
              size="small"
              color="error"
              onClick={() => onDelete(template.id, template.name)}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>
      </CardActions>
    </Card>
  );
}
'use client';

import { useState, useEffect } from 'react';
import {
  Drawer,
  Box,
  Typography,
  IconButton,
  Stack,
  Chip,
  Divider,
  CircularProgress,
  Alert,
  Paper,
} from '@mui/material';
import {
  Close as CloseIcon,
  Edit as EditIcon,
  Email as EmailIcon,
  WhatsApp as WhatsAppIcon,
  Sms as SmsIcon,
  Notifications as NotificationsIcon,
  Label as LabelIcon,
  Category as CategoryIcon,
} from '@mui/icons-material';
import { getMessageTemplateById } from '@/services/messageTemplateService';
import { MessageTemplate } from '@/types/messageTemplate.types';

interface TemplateDetailsDrawerProps {
  open: boolean;
  onClose: () => void;
  templateId: string | null;
  businessId: string;
  onEdit: (templateId: string) => void;
}

export default function TemplateDetailsDrawer({
  open,
  onClose,
  templateId,
  businessId,
  onEdit,
}: TemplateDetailsDrawerProps) {
  const [template, setTemplate] = useState<MessageTemplate | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // ─── Fetch Template Details ───────────────────────────────────────────────
  useEffect(() => {
    if (open && templateId && businessId) {
      fetchTemplateDetails();
    }
  }, [open, templateId, businessId]);

  const fetchTemplateDetails = async () => {
    if (!templateId || !businessId) return;
    try {
      setLoading(true);
      setError('');
      console.log('🔍 Fetching template:', templateId);
      const data = await getMessageTemplateById(businessId, templateId);
      console.log('📦 Fetched template data:', data);
      setTemplate(data);
    } catch (err: unknown) {
      console.error('❌ Fetch error:', err);
      setError(err instanceof Error ? err.message : 'Failed to load template details');
    } finally {
      setLoading(false);
    }
  };

  // ─── Section Component ────────────────────────────────────────────────────
  const Section = ({
    title,
    icon,
    children,
  }: {
    title: string;
    icon: React.ReactNode;
    children: React.ReactNode;
  }) => (
    <Box sx={{ mb: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        {icon}
        <Typography
          variant="overline"
          sx={{ fontWeight: 700, letterSpacing: '0.08em', color: 'text.secondary' }}
        >
          {title}
        </Typography>
      </Box>
      {children}
    </Box>
  );

  // ─── Info Row Component ───────────────────────────────────────────────────
  const InfoRow = ({
    label,
    value,
  }: {
    label: string;
    value: string | number | null | undefined;
  }) => (
    <Box sx={{ mb: 1.5 }}>
      <Typography
        variant="caption"
        sx={{
          display: 'block',
          mb: 0.5,
          color: '#64748b',
          fontWeight: 600,
        }}
      >
        {label}
      </Typography>
      <Typography
        variant="body2"
        sx={{
          fontWeight: 500,
          color: '#1e293b',
          fontSize: '0.875rem',
        }}
      >
        {value || '—'}
      </Typography>
    </Box>
  );

  // ─── Template Preview Component ───────────────────────────────────────────
  const TemplatePreview = ({
    title,
    icon,
    subject,
    body,
  }: {
    title: string;
    icon: React.ReactNode;
    subject?: string;
    body: string;
  }) => (
    <Paper
      sx={{
        p: 2.5,
        bgcolor: '#f8fafc',
        border: '1px solid',
        borderColor: 'divider',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        {icon}
        <Typography variant="subtitle2" fontWeight={700}>
          {title}
        </Typography>
      </Box>
      {subject && (
        <Box sx={{ mb: 2 }}>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
            Subject
          </Typography>
          <Typography
            variant="body2"
            sx={{
              fontWeight: 600,
              p: 1.5,
              bgcolor: '#fff',
              borderRadius: 1,
              border: '1px solid',
              borderColor: 'divider',
            }}
          >
            {subject}
          </Typography>
        </Box>
      )}
      <Box>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
          {subject ? 'Body' : 'Message'}
        </Typography>
        <Typography
          variant="body2"
          sx={{
            whiteSpace: 'pre-wrap',
            p: 2,
            bgcolor: '#fff',
            borderRadius: 1,
            border: '1px solid',
            borderColor: 'divider',
            fontFamily: 'inherit',
            lineHeight: 1.7,
          }}
        >
          {body}
        </Typography>
      </Box>
    </Paper>
  );

  // ─── Get Reminder Type Color ──────────────────────────────────────────────
  const getReminderTypeColor = (type: string) => {
    switch (type) {
      case 'GST': return '#16a34a';
      case 'TDS': return '#374151';
      case 'ITR': return '#2563eb';
      case 'ROC': return '#7c3aed';
      case 'ESI': return '#ea580c';
      case 'PF': return '#f59e0b';
      case 'GENERAL': return '#64748b';
      default: return '#64748b';
    }
  };

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: { xs: '100%', sm: 600, md: 700 },
          borderRadius: 0,
        },
      }}
    >
      {/* Header */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #1e3a5f 0%, #2563eb 100%)',
          color: '#fff',
          p: 3,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Box>
          <Typography
            variant="caption"
            sx={{
              color: 'rgba(255,255,255,0.7)',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
            }}
          >
            Message Template Details
          </Typography>
          <Typography variant="h6" sx={{ fontWeight: 700, mt: 0.5 }}>
            {template?.name || 'Loading...'}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          {templateId && (
            <IconButton
              onClick={() => onEdit(templateId)}
              sx={{
                color: '#fff',
                bgcolor: 'rgba(255,255,255,0.15)',
                '&:hover': { bgcolor: 'rgba(255,255,255,0.25)' },
              }}
            >
              <EditIcon fontSize="small" />
            </IconButton>
          )}
          <IconButton
            onClick={onClose}
            sx={{
              color: '#fff',
              bgcolor: 'rgba(255,255,255,0.15)',
              '&:hover': { bgcolor: 'rgba(255,255,255,0.25)' },
            }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>
      </Box>

      {/* Content */}
      <Box sx={{ p: 3, overflowY: 'auto', flex: 1, bgcolor: '#f8fafc' }}>
        {/* Loading */}
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress />
          </Box>
        )}

        {/* Error */}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* Template Data */}
        {template && !loading && (
          <Stack spacing={3}>
            {/* Status & Type */}
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              <Chip
                label={template.isActive ? 'Active' : 'Inactive'}
                size="small"
                color={template.isActive ? 'success' : 'default'}
                sx={{ fontWeight: 600 }}
              />
              <Chip
                label={template.reminder_type}
                size="small"
                sx={{
                  bgcolor: getReminderTypeColor(template.reminder_type),
                  color: '#fff',
                  fontWeight: 600,
                }}
              />
              <Chip
                label={template.businessCategory}
                size="small"
                variant="outlined"
                sx={{ fontWeight: 600 }}
              />
            </Box>

            <Divider />

            {/* Basic Info */}
            <Section title="Basic Information" icon={<CategoryIcon fontSize="small" />}>
              <Box
                sx={{
                  bgcolor: '#fff',
                  borderRadius: 2,
                  p: 2.5,
                  border: '1px solid',
                  borderColor: 'divider',
                }}
              >
                <InfoRow label="Template Name" value={template.name} />
                <InfoRow label="Reminder Type" value={template.reminder_type} />
                <InfoRow label="Business Category" value={template.businessCategory} />
                <InfoRow label="Template ID" value={template.id} />
              </Box>
            </Section>

            {/* Channels */}
            <Section title="Delivery Channels" icon={<NotificationsIcon fontSize="small" />}>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {template.channels.map((channel) => {
                  let icon, label, color;
                  if (channel === 'email') {
                    icon = <EmailIcon fontSize="small" />;
                    label = 'Email';
                    color = '#10b981';
                  } else if (channel === 'whatsapp') {
                    icon = <WhatsAppIcon fontSize="small" />;
                    label = 'WhatsApp';
                    color = '#25D366';
                  } else if (channel === 'sms') {
                    icon = <SmsIcon fontSize="small" />;
                    label = 'SMS';
                    color = '#f59e0b';
                  } else {
                    icon = <NotificationsIcon fontSize="small" />;
                    label = 'In-App';
                    color = '#3b82f6';
                  }

                  return (
                    <Chip
                      key={channel}
                      icon={icon}
                      label={label}
                      sx={{
                        bgcolor: color,
                        color: '#fff',
                        fontWeight: 600,
                        '& .MuiChip-icon': { color: '#fff' },
                      }}
                    />
                  );
                })}
              </Box>
            </Section>

            {/* Placeholders */}
            <Section title="Placeholders" icon={<LabelIcon fontSize="small" />}>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {template.placeholders.map((placeholder) => (
                  <Chip
                    key={placeholder}
                    label={`[${placeholder}]`}
                    variant="outlined"
                    sx={{
                      fontFamily: 'monospace',
                      fontWeight: 600,
                      fontSize: '0.75rem',
                    }}
                  />
                ))}
                {template.placeholders.length === 0 && (
                  <Typography variant="body2" color="text.disabled">
                    No placeholders defined
                  </Typography>
                )}
              </Box>
            </Section>

            <Divider />

            {/* Email Template */}
            {template.templates.email && (
              <Section title="Templates" icon={<EmailIcon fontSize="small" />}>
                <Stack spacing={2}>
                  <TemplatePreview
                    title="Email Template"
                    icon={<EmailIcon fontSize="small" sx={{ color: '#10b981' }} />}
                    subject={template.templates.email.subject}
                    body={template.templates.email.body}
                  />
                </Stack>
              </Section>
            )}

            {/* WhatsApp Template */}
            {template.templates.whatsapp && (
              <Section title="" icon={null}>
                <TemplatePreview
                  title="WhatsApp Template"
                  icon={<WhatsAppIcon fontSize="small" sx={{ color: '#25D366' }} />}
                  body={template.templates.whatsapp.body}
                />
              </Section>
            )}

            {/* SMS Template */}
            {template.templates.sms && (
              <Section title="" icon={null}>
                <TemplatePreview
                  title="SMS Template"
                  icon={<SmsIcon fontSize="small" sx={{ color: '#f59e0b' }} />}
                  body={template.templates.sms.body}
                />
              </Section>
            )}

            {/* In-App Template */}
            {template.templates.in_app && (
              <Section title="" icon={null}>
                <TemplatePreview
                  title="In-App Template"
                  icon={<NotificationsIcon fontSize="small" sx={{ color: '#3b82f6' }} />}
                  body={template.templates.in_app.body}
                />
              </Section>
            )}

            {/* Metadata */}
            <Box sx={{ bgcolor: '#f1f5f9', borderRadius: 2, p: 2 }}>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                Template ID: {template.id}
              </Typography>
            </Box>
          </Stack>
        )}

        {/* Debug Info */}
        {!loading && !error && !template && (
          <Alert severity="info">No template loaded. Template ID: {templateId}</Alert>
        )}
      </Box>
    </Drawer>
  );
}
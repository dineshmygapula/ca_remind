'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  Grid,
  Typography,
  Box,
  Stack,
  CircularProgress,
  IconButton,
  Alert,
  Checkbox,
  FormControlLabel,
  FormGroup,
  Chip,
  Divider,
} from '@mui/material';
import {
  Close as CloseIcon,
  Add as AddIcon,
  Info as InfoIcon,
} from '@mui/icons-material';
import { createMessageTemplate } from '@/services/messageTemplateService';
import { CreateMessageTemplateDto, Templates } from '@/types/messageTemplate.types';
import {
  CHANNEL_OPTIONS,
  REMINDER_TYPE_OPTIONS,
  BUSINESS_CATEGORY_OPTIONS,
  COMMON_PLACEHOLDERS,
  DEFAULT_EMAIL_TEMPLATE,
  DEFAULT_WHATSAPP_TEMPLATE,
  DEFAULT_SMS_TEMPLATE,
  DEFAULT_INAPP_TEMPLATE,
} from '@/constants/messageTemplateConstants';

interface AddTemplateDialogProps {
  open: boolean;
  onClose: () => void;
  businessId: string;
  onSuccess?: () => void;
}

interface FormData {
  name: string;
  channels: string[];
  reminderType: string;
  businessCategory: string;
  isActive: boolean;
  
  // Email
  emailSubject: string;
  emailBody: string;
  
  // WhatsApp
  whatsappBody: string;
  
  // SMS
  smsBody: string;
  
  // In-App
  inAppBody: string;
  
  // Placeholders
  selectedPlaceholders: string[];
}

const DEFAULT_FORM: FormData = {
  name: '',
  channels: ['email'],
  reminderType: 'GENERAL',
  businessCategory: 'GENERAL',
  isActive: true,
  emailSubject: DEFAULT_EMAIL_TEMPLATE.subject,
  emailBody: DEFAULT_EMAIL_TEMPLATE.body,
  whatsappBody: DEFAULT_WHATSAPP_TEMPLATE.body,
  smsBody: DEFAULT_SMS_TEMPLATE.body,
  inAppBody: DEFAULT_INAPP_TEMPLATE.body,
  selectedPlaceholders: ['CLIENTNAME', 'BUSINESSNAME', 'DUEDATE', 'SERVICETYPE', 'YOURFIRMNAME'],
};

export default function CreateTemplateDialog({
  open,
  onClose,
  businessId,
  onSuccess,
}: AddTemplateDialogProps) {
  const [form, setForm] = useState<FormData>(DEFAULT_FORM);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const set = <K extends keyof FormData>(field: K, value: FormData[K]) => {
    setForm((f) => ({ ...f, [field]: value }));
    if (error) setError('');
  };

  // ─── Handle Channel Toggle ────────────────────────────────────────────────
  const handleChannelToggle = (channel: string) => {
    const newChannels = form.channels.includes(channel)
      ? form.channels.filter((c) => c !== channel)
      : [...form.channels, channel];
    set('channels', newChannels);
  };

  // ─── Handle Placeholder Toggle ────────────────────────────────────────────
  const handlePlaceholderToggle = (placeholder: string) => {
    const newPlaceholders = form.selectedPlaceholders.includes(placeholder)
      ? form.selectedPlaceholders.filter((p) => p !== placeholder)
      : [...form.selectedPlaceholders, placeholder];
    set('selectedPlaceholders', newPlaceholders);
  };

  // ─── Insert Placeholder ───────────────────────────────────────────────────
  const insertPlaceholder = (field: keyof FormData, placeholder: string) => {
    const currentValue = form[field] as string;
    const newValue = currentValue + `[${placeholder}]`;
    set(field, newValue as FormData[typeof field]);
  };

  // ─── Submit ───────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    // Validation
    if (!form.name.trim()) {
      setError('Template name is required');
      return;
    }
    if (form.channels.length === 0) {
      setError('At least one channel must be selected');
      return;
    }
    if (form.channels.includes('email') && !form.emailSubject.trim()) {
      setError('Email subject is required');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Build templates object based on selected channels
      const templates: Templates = {};

      if (form.channels.includes('email')) {
        templates.email = {
          subject: form.emailSubject,
          body: form.emailBody,
        };
      }

      if (form.channels.includes('whatsapp')) {
        templates.whatsapp = {
          body: form.whatsappBody,
        };
      }

      if (form.channels.includes('sms')) {
        templates.sms = {
          body: form.smsBody,
        };
      }

      if (form.channels.includes('in_app')) {
        templates.in_app = {
          body: form.inAppBody,
        };
      }

      const dto: CreateMessageTemplateDto = {
        name: form.name,
        templates: templates,
        placeholders: form.selectedPlaceholders,
        channels: form.channels as ('email' | 'whatsapp' | 'sms' | 'in_app')[],
        reminder_type: form.reminderType as CreateMessageTemplateDto['reminder_type'],
        businessCategory: form.businessCategory as CreateMessageTemplateDto['businessCategory'],
        isActive: form.isActive,
      };

      console.log('📤 Creating message template:', dto);

      await createMessageTemplate(businessId, dto);

      console.log('✅ Message template created successfully');
      setForm(DEFAULT_FORM);
      onSuccess?.();
      onClose();
    } catch (err: unknown) {
      console.error('❌ Create template error:', err);
      setError(err instanceof Error ? err.message : 'Failed to create template');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setForm(DEFAULT_FORM);
      setError('');
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="lg" fullWidth>
      {/* Header */}
      <DialogTitle
        sx={{
          background: 'linear-gradient(135deg, #1e3a5f 0%, #2563eb 100%)',
          color: '#fff',
          px: 3,
          py: 2.5,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <AddIcon sx={{ fontSize: 22 }} />
          <Box>
            <Typography
              variant="caption"
              sx={{
                color: 'rgba(255,255,255,0.65)',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                display: 'block',
                lineHeight: 1,
              }}
            >
              New Message Template
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.3 }}>
              Create Template
            </Typography>
          </Box>
        </Box>
        <IconButton
          onClick={handleClose}
          disabled={loading}
          size="small"
          sx={{
            color: '#fff',
            bgcolor: 'rgba(255,255,255,0.15)',
            '&:hover': { bgcolor: 'rgba(255,255,255,0.25)' },
          }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      {/* Content */}
      <DialogContent sx={{ p: 3, bgcolor: '#f8fafc' }}>
        <Stack spacing={3}>
          {/* Error */}
          {error && (
            <Alert severity="error" onClose={() => setError('')}>
              {error}
            </Alert>
          )}

          {/* Info Alert */}
          <Alert severity="info" icon={<InfoIcon />}>
            Use placeholders like [CLIENTNAME], [DUEDATE] in your templates. They will be replaced with actual values when sending.
          </Alert>

          {/* Basic Information */}
          <Box
            sx={{
              bgcolor: '#fff',
              borderRadius: 2,
              border: '1px solid',
              borderColor: 'divider',
              p: 2.5,
            }}
          >
            <Typography
              variant="overline"
              sx={{
                fontWeight: 700,
                color: 'text.secondary',
                letterSpacing: '0.08em',
                display: 'block',
                mb: 2,
              }}
            >
              Basic Information
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  label="Template Name"
                  required
                  fullWidth
                  size="small"
                  value={form.name}
                  onChange={(e) => set('name', e.target.value)}
                  placeholder="e.g., Monthly GST Reminder"
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField
                  label="Reminder Type"
                  select
                  fullWidth
                  size="small"
                  value={form.reminderType}
                  onChange={(e) => set('reminderType', e.target.value)}
                >
                  {REMINDER_TYPE_OPTIONS.map((opt) => (
                    <MenuItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField
                  label="Business Category"
                  select
                  fullWidth
                  size="small"
                  value={form.businessCategory}
                  onChange={(e) => set('businessCategory', e.target.value)}
                >
                  {BUSINESS_CATEGORY_OPTIONS.map((opt) => (
                    <MenuItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={form.isActive}
                      onChange={(e) => set('isActive', e.target.checked)}
                    />
                  }
                  label="Active"
                />
              </Grid>
            </Grid>
          </Box>

          {/* Channels */}
          <Box
            sx={{
              bgcolor: '#fff',
              borderRadius: 2,
              border: '1px solid',
              borderColor: 'divider',
              p: 2.5,
            }}
          >
            <Typography
              variant="overline"
              sx={{
                fontWeight: 700,
                color: 'text.secondary',
                letterSpacing: '0.08em',
                display: 'block',
                mb: 2,
              }}
            >
              Delivery Channels
            </Typography>
            <FormGroup row>
              {CHANNEL_OPTIONS.map((channel) => (
                <FormControlLabel
                  key={channel.value}
                  control={
                    <Checkbox
                      checked={form.channels.includes(channel.value)}
                      onChange={() => handleChannelToggle(channel.value)}
                    />
                  }
                  label={`${channel.icon} ${channel.label}`}
                />
              ))}
            </FormGroup>
          </Box>

          {/* Placeholders */}
          <Box
            sx={{
              bgcolor: '#fff',
              borderRadius: 2,
              border: '1px solid',
              borderColor: 'divider',
              p: 2.5,
            }}
          >
            <Typography
              variant="overline"
              sx={{
                fontWeight: 700,
                color: 'text.secondary',
                letterSpacing: '0.08em',
                display: 'block',
                mb: 2,
              }}
            >
              Placeholders
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {COMMON_PLACEHOLDERS.map((placeholder) => (
                <Chip
                  key={placeholder.value}
                  label={`[${placeholder.value}]`}
                  size="small"
                  clickable
                  color={form.selectedPlaceholders.includes(placeholder.value) ? 'primary' : 'default'}
                  onClick={() => handlePlaceholderToggle(placeholder.value)}
                  sx={{ fontFamily: 'monospace', fontWeight: 600 }}
                />
              ))}
            </Box>
          </Box>

          <Divider />

          {/* Email Template */}
          {form.channels.includes('email') && (
            <Box
              sx={{
                bgcolor: '#fff',
                borderRadius: 2,
                border: '1px solid',
                borderColor: 'divider',
                p: 2.5,
              }}
            >
              <Typography
                variant="overline"
                sx={{
                  fontWeight: 700,
                  color: 'text.secondary',
                  letterSpacing: '0.08em',
                  display: 'block',
                  mb: 2,
                }}
              >
                📧 Email Template
              </Typography>
              <Stack spacing={2}>
                <TextField
                  label="Subject"
                  required
                  fullWidth
                  size="small"
                  value={form.emailSubject}
                  onChange={(e) => set('emailSubject', e.target.value)}
                  placeholder="Enter email subject..."
                />
                <TextField
                  label="Body"
                  required
                  fullWidth
                  multiline
                  rows={6}
                  value={form.emailBody}
                  onChange={(e) => set('emailBody', e.target.value)}
                  placeholder="Enter email body..."
                />
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  <Typography variant="caption" color="text.secondary" sx={{ mr: 1 }}>
                    Quick insert:
                  </Typography>
                  {form.selectedPlaceholders.map((p) => (
                    <Chip
                      key={p}
                      label={`[${p}]`}
                      size="small"
                      onClick={() => insertPlaceholder('emailBody', p)}
                      sx={{ fontSize: '0.65rem', height: '20px', cursor: 'pointer' }}
                    />
                  ))}
                </Box>
              </Stack>
            </Box>
          )}

          {/* WhatsApp Template */}
          {form.channels.includes('whatsapp') && (
            <Box
              sx={{
                bgcolor: '#fff',
                borderRadius: 2,
                border: '1px solid',
                borderColor: 'divider',
                p: 2.5,
              }}
            >
              <Typography
                variant="overline"
                sx={{
                  fontWeight: 700,
                  color: 'text.secondary',
                  letterSpacing: '0.08em',
                  display: 'block',
                  mb: 2,
                }}
              >
                📱 WhatsApp Template
              </Typography>
              <Stack spacing={2}>
                <TextField
                  label="Message"
                  required
                  fullWidth
                  multiline
                  rows={6}
                  value={form.whatsappBody}
                  onChange={(e) => set('whatsappBody', e.target.value)}
                  placeholder="Enter WhatsApp message..."
                />
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  <Typography variant="caption" color="text.secondary" sx={{ mr: 1 }}>
                    Quick insert:
                  </Typography>
                  {form.selectedPlaceholders.map((p) => (
                    <Chip
                      key={p}
                      label={`[${p}]`}
                      size="small"
                      onClick={() => insertPlaceholder('whatsappBody', p)}
                      sx={{ fontSize: '0.65rem', height: '20px', cursor: 'pointer' }}
                    />
                  ))}
                </Box>
              </Stack>
            </Box>
          )}

          {/* SMS Template */}
          {form.channels.includes('sms') && (
            <Box
              sx={{
                bgcolor: '#fff',
                borderRadius: 2,
                border: '1px solid',
                borderColor: 'divider',
                p: 2.5,
              }}
            >
              <Typography
                variant="overline"
                sx={{
                  fontWeight: 700,
                  color: 'text.secondary',
                  letterSpacing: '0.08em',
                  display: 'block',
                  mb: 2,
                }}
              >
                💬 SMS Template
              </Typography>
              <Stack spacing={2}>
                <TextField
                  label="Message (160 char limit)"
                  required
                  fullWidth
                  multiline
                  rows={3}
                  value={form.smsBody}
                  onChange={(e) => set('smsBody', e.target.value)}
                  placeholder="Enter SMS message..."
                  inputProps={{ maxLength: 160 }}
                  helperText={`${form.smsBody.length}/160 characters`}
                />
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  <Typography variant="caption" color="text.secondary" sx={{ mr: 1 }}>
                    Quick insert:
                  </Typography>
                  {form.selectedPlaceholders.map((p) => (
                    <Chip
                      key={p}
                      label={`[${p}]`}
                      size="small"
                      onClick={() => insertPlaceholder('smsBody', p)}
                      sx={{ fontSize: '0.65rem', height: '20px', cursor: 'pointer' }}
                    />
                  ))}
                </Box>
              </Stack>
            </Box>
          )}

          {/* In-App Template */}
          {form.channels.includes('in_app') && (
            <Box
              sx={{
                bgcolor: '#fff',
                borderRadius: 2,
                border: '1px solid',
                borderColor: 'divider',
                p: 2.5,
              }}
            >
              <Typography
                variant="overline"
                sx={{
                  fontWeight: 700,
                  color: 'text.secondary',
                  letterSpacing: '0.08em',
                  display: 'block',
                  mb: 2,
                }}
              >
                🔔 In-App Template
              </Typography>
              <Stack spacing={2}>
                <TextField
                  label="Message"
                  required
                  fullWidth
                  multiline
                  rows={4}
                  value={form.inAppBody}
                  onChange={(e) => set('inAppBody', e.target.value)}
                  placeholder="Enter in-app notification message..."
                />
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  <Typography variant="caption" color="text.secondary" sx={{ mr: 1 }}>
                    Quick insert:
                  </Typography>
                  {form.selectedPlaceholders.map((p) => (
                    <Chip
                      key={p}
                      label={`[${p}]`}
                      size="small"
                      onClick={() => insertPlaceholder('inAppBody', p)}
                      sx={{ fontSize: '0.65rem', height: '20px', cursor: 'pointer' }}
                    />
                  ))}
                </Box>
              </Stack>
            </Box>
          )}
        </Stack>
      </DialogContent>

      {/* Footer */}
      <DialogActions
        sx={{
          px: 3,
          py: 2,
          bgcolor: '#fff',
          borderTop: '1px solid',
          borderColor: 'divider',
          gap: 1,
        }}
      >
        <Button
          variant="outlined"
          onClick={handleClose}
          disabled={loading}
          sx={{
            flex: 1,
            textTransform: 'none',
            fontWeight: 600,
            borderRadius: 2,
            py: 1.2,
          }}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={loading}
          startIcon={
            loading ? <CircularProgress size={16} color="inherit" /> : <AddIcon />
          }
          sx={{
            flex: 2,
            textTransform: 'none',
            fontWeight: 700,
            borderRadius: 2,
            py: 1.2,
            background: 'linear-gradient(135deg, #1e3a5f 0%, #2563eb 100%)',
            '&:hover': {
              background: 'linear-gradient(135deg, #1e3a5f 0%, #1d4ed8 100%)',
            },
            '&:disabled': { background: '#93c5fd', color: '#fff' },
          }}
        >
          {loading ? 'Creating…' : 'Create Template'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
'use client';

import {
  Drawer, Box, Typography, IconButton,
  Stack, Divider, CircularProgress, Button,
} from '@mui/material';
import {
  Close as CloseIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Email as EmailIcon,
  WhatsApp as WhatsAppIcon,
  Sms as SmsIcon,
  Notifications as NotifIcon,
  NotificationsActive as ReminderIcon,
} from '@mui/icons-material';
import { V2ReminderDefinition } from '@/types/v2ReminderDefinition.types';

interface Props {
  open: boolean;
  onClose: () => void;
  rule: V2ReminderDefinition | null;
  ruleIndex: number;
  onEdit: (ruleId: string) => void;
  onDelete: (ruleId: string, name: string) => void;
  deleting: boolean;
}

// Returns the right icon for each channel
function ChannelIcon({ channel }: { channel: string }) {
  if (channel === 'EMAIL') return <EmailIcon fontSize="small" sx={{ color: 'primary.main' }} />;
  if (channel === 'WHATSAPP') return <WhatsAppIcon fontSize="small" sx={{ color: '#25D366' }} />;
  if (channel === 'SMS') return <SmsIcon fontSize="small" color="action" />;
  return <NotifIcon fontSize="small" color="action" />;
}

// Converts "EMAIL" → "Email", "WHATSAPP" → "WhatsApp"
function formatChannel(channel: string) {
  if (channel === 'WHATSAPP') return 'WhatsApp';
  if (channel === 'EMAIL') return 'Email';
  if (channel === 'SMS') return 'SMS';
  if (channel === 'IN_APP') return 'In-App';
  return channel;
}

// Converts offsetDays into "Before due date" / "On due date" / "After due date"
function formatTrigger(offsetDays: number) {
  if (offsetDays > 0) return 'Before due date';
  if (offsetDays === 0) return 'On due date';
  return 'After due date';
}

// Converts 7 → "7 days", 0 → "On due date"
function formatOffset(offsetDays: number) {
  if (offsetDays === 0) return 'On due date';
  return `${Math.abs(offsetDays)} days`;
}

// A single label + value row, matching the mobile layout
function InfoRow({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <Box sx={{ display: 'flex', gap: 2, py: 1 }}>
      <Typography variant="body2" color="text.secondary" sx={{ minWidth: 110, flexShrink: 0 }}>
        {label} :
      </Typography>
      <Typography variant="body2" fontWeight={500}>
        {value || '--'}
      </Typography>
    </Box>
  );
}

export default function ReminderRuleDetailsDrawer({
  open, onClose, rule, ruleIndex, onEdit, onDelete, deleting,
}: Props) {
  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{ sx: { width: { xs: '100%', sm: 480 }, borderRadius: 0 } }}
    >
      {/* HEADER */}
      <Box sx={{
        px: 3, pt: 2.5, pb: 2,
        borderBottom: '1px solid #F0F0F0',
        backgroundColor: '#fff',
        flexShrink: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <Box sx={{
            width: 36, height: 36, borderRadius: '10px',
            backgroundColor: '#EFF6FF',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <ReminderIcon sx={{ fontSize: 20, color: '#2563EB' }} />
          </Box>
          <Box>
            <Typography variant="h6" fontWeight={700} fontSize="1.05rem" color="#0F172A">
              Reminder Rules Details
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Rule {ruleIndex}
            </Typography>
          </Box>
        </Stack>
        <IconButton onClick={onClose} size="small" sx={{
          backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0',
          borderRadius: '8px', '&:hover': { backgroundColor: '#EEEEEE' },
        }}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </Box>

      {/* BODY */}
      <Box sx={{ p: 3, overflowY: 'auto', flex: 1, bgcolor: 'background.default' }}>
        {!rule ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Stack spacing={2}>

            {/* Main details card */}
            <Box sx={{
              bgcolor: 'background.paper', borderRadius: 2,
              border: '1px solid', borderColor: 'divider', p: 2.5,
            }}>
              <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
                {rule.name}
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <InfoRow label="Trigger"   value={formatTrigger(rule.offsetDays)} />
              <InfoRow label="Offset"    value={formatOffset(rule.offsetDays)} />
              <InfoRow label="Send Time" value={null} />

              {/* Channel row needs an icon so we build it manually */}
              <Box sx={{ display: 'flex', gap: 2, py: 1 }}>
                <Typography variant="body2" color="text.secondary" sx={{ minWidth: 110, flexShrink: 0 }}>
                  Channel :
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                  <ChannelIcon channel={rule.channel} />
                  <Typography variant="body2" fontWeight={500}>
                    {formatChannel(rule.channel)}
                  </Typography>
                </Box>
              </Box>
            </Box>

            {/* Message Template card */}
            <Box sx={{
              bgcolor: 'background.paper', borderRadius: 2,
              border: '1px solid', borderColor: 'divider', p: 2.5,
            }}>
              <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1.5 }}>
                Message Template
              </Typography>
              <Box sx={{
                bgcolor: 'background.default', borderRadius: 1.5,
                p: 2, border: '1px solid', borderColor: 'divider',
              }}>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                  Template ID
                </Typography>
                <Typography variant="body2" sx={{ fontFamily: 'monospace', wordBreak: 'break-all' }}>
                  {rule.messageTemplateId || '--'}
                </Typography>
              </Box>
            </Box>

          </Stack>
        )}
      </Box>

      {/* FOOTER — Edit + Delete buttons */}
      {rule && (
        <Box sx={{
          p: 2, bgcolor: 'background.paper',
          borderTop: '1px solid', borderColor: 'divider',
          flexShrink: 0, display: 'flex', gap: 1.5,
        }}>
          <Button
            fullWidth variant="outlined"
            startIcon={<EditIcon />}
            onClick={() => onEdit(rule.id)}
            sx={{ py: 1.2, fontWeight: 600, borderRadius: 2, textTransform: 'none' }}
          >
            Edit Rules
          </Button>
          <Button
            fullWidth variant="outlined" color="error"
            startIcon={deleting ? <CircularProgress size={16} color="inherit" /> : <DeleteIcon />}
            onClick={() => onDelete(rule.id, rule.name)}
            disabled={deleting}
            sx={{ py: 1.2, fontWeight: 600, borderRadius: 2, textTransform: 'none' }}
          >
            Delete
          </Button>
        </Box>
      )}
    </Drawer>
  );
}
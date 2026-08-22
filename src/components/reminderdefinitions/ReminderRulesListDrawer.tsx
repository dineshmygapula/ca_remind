'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Drawer, Box, Typography, IconButton,
  Stack, CircularProgress, Alert,
} from '@mui/material';
import {
  Close as CloseIcon,
  Email as EmailIcon,
  WhatsApp as WhatsAppIcon,
  Sms as SmsIcon,
  Notifications as NotifIcon,
  AccessTime as ClockIcon,
  NotificationsActive as ReminderIcon,
} from '@mui/icons-material';
import { V2ReminderDefinition } from '@/types/v2ReminderDefinition.types';
import {
  getV2ReminderDefinitions,
  deleteV2ReminderDefinition,
} from '@/services/reminderDefinitionService';
import ReminderRuleDetailsDrawer from './ReminderRuleDetailsDrawer';

interface Props {
  open: boolean;
  onClose: () => void;
  taskDefinitionId: string | null;   // ← must be exactly this name
  taskDefinitionName: string;
  businessId: string;
  preloadedRules?: V2ReminderDefinition[];
  onEditRule: (ruleId: string) => void;
}

function ChannelIcon({ channel }: { channel: string }) {
  if (channel === 'EMAIL') return <EmailIcon fontSize="small" sx={{ color: 'primary.main' }} />;
  if (channel === 'WHATSAPP') return <WhatsAppIcon fontSize="small" sx={{ color: '#25D366' }} />;
  if (channel === 'SMS') return <SmsIcon fontSize="small" color="action" />;
  return <ReminderIcon fontSize="small" color="action" />;
}

function formatOffsetLabel(offsetDays: number) {
  const abs = Math.abs(offsetDays);
  if (offsetDays > 0) return `Sent ${abs} day${abs !== 1 ? 's' : ''} before due date`;
  if (offsetDays === 0) return 'Sent on due date';
  return `Sent ${abs} day${abs !== 1 ? 's' : ''} after due date`;
}

export default function ReminderRulesListDrawer({
  open,
  onClose,
  taskDefinitionId,        // ← must match the Props interface
  taskDefinitionName,
  businessId,
  onEditRule,
}: Props)  {

  const [rules, setRules]       = useState<V2ReminderDefinition[]>([]);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const [deleting, setDeleting] = useState(false);

  // Which rule is open in the Details drawer
  const [selectedRule, setSelectedRule]   = useState<V2ReminderDefinition | null>(null);
  const [selectedIndex, setSelectedIndex] = useState(1);
  const [detailsOpen, setDetailsOpen]     = useState(false);

  // Fetch all reminder definitions then filter by taskDefinitionId
  // (The API has no filter param, so we filter client-side)
  const fetchRules = useCallback(async () => {
    if (!businessId || !taskDefinitionId) return;
    try {
      setLoading(true);
      setError('');
      const all = await getV2ReminderDefinitions(businessId);
      const mine = all.filter((r) => r.taskDefinitionId === taskDefinitionId);
      setRules(mine);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load rules');
    } finally {
      setLoading(false);
    }
  }, [businessId, taskDefinitionId]);

  // Fetch when drawer opens; clear when it closes
  useEffect(() => {
    if (open) {
      fetchRules();
    } else {
      setRules([]);
      setError('');
      setDetailsOpen(false);
      setSelectedRule(null);
    }
  }, [open, fetchRules]);

  const handleCardClick = (rule: V2ReminderDefinition, index: number) => {
    setSelectedRule(rule);
    setSelectedIndex(index + 1); // make it 1-based: "Rule 1", "Rule 2"
    setDetailsOpen(true);
  };

  const handleDelete = async (ruleId: string, name: string) => {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
    try {
      setDeleting(true);
      await deleteV2ReminderDefinition(businessId, ruleId);
      setDetailsOpen(false);
      setSelectedRule(null);
      await fetchRules(); // refresh the list after delete
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to delete');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
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
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
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
                Reminder Rules List
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {taskDefinitionName}
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

          {loading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
              <CircularProgress />
            </Box>
          )}

          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

          {!loading && rules.length === 0 && !error && (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <ReminderIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
              <Typography variant="body2" color="text.disabled">
                No reminder rules configured
              </Typography>
            </Box>
          )}

          {!loading && rules.length > 0 && (
            <Stack spacing={2}>
              {rules.map((rule, index) => (
                <Box
                  key={rule.id}
                  onClick={() => handleCardClick(rule, index)}
                  sx={{
                    bgcolor: 'background.paper',
                    borderRadius: 2,
                    border: '1px solid',
                    borderColor: 'divider',
                    p: 2.5,
                    cursor: 'pointer',
                    '&:hover': {
                      boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                      borderColor: 'primary.light',
                    },
                  }}
                >
                  {/* "Rule 1", "Rule 2" label */}
                  <Typography variant="overline" sx={{
                    fontWeight: 700, color: 'text.secondary',
                    letterSpacing: '0.08em', display: 'block', mb: 1,
                  }}>
                    Rule {index + 1}
                  </Typography>

                  {/* Channel icon + rule name */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.75 }}>
                    <ChannelIcon channel={rule.channel} />
                    <Typography variant="body2" fontWeight={600}>
                      {rule.name}
                    </Typography>
                  </Box>

                  {/* "Sent 7 days before due date" */}
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                    {formatOffsetLabel(rule.offsetDays)}
                  </Typography>

                  {/* Clock + send time (always "--" because API has no sendTime field) */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <ClockIcon sx={{ fontSize: 14, color: 'text.disabled' }} />
                    <Typography variant="caption" color="text.disabled">--</Typography>
                  </Box>
                </Box>
              ))}
            </Stack>
          )}
        </Box>
      </Drawer>

      {/* Details drawer — sits on top of this drawer when a card is clicked */}
      <ReminderRuleDetailsDrawer
        open={detailsOpen}
        onClose={() => setDetailsOpen(false)}
        rule={selectedRule}
        ruleIndex={selectedIndex}
        onEdit={(ruleId) => {
          setDetailsOpen(false);
          onEditRule(ruleId);
        }}
        onDelete={handleDelete}
        deleting={deleting}
      />
    </>
  );
}
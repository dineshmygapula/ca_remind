'use client';

import { useState, useEffect } from 'react';
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
  Switch,
  
} from '@mui/material';
import {
  Close as CloseIcon,
  Edit as EditIcon,
} from '@mui/icons-material';
import { getTaskDefinitionById, updateTaskDefinition } from '@/services/taskDefinitionService';
import {
  TaskDefinition,
  UpdateTaskDefinitionDto,
  ScheduleRule,
  TaskPriority,
  SchedulePattern,
} from '../../types/taskDefinition.types';
import {
  PRIORITY_OPTIONS,
  SCHEDULE_PATTERNS,
  SUBJECT_TYPE_OPTIONS,
  TASK_CATEGORIES,
  TASK_TYPES,
  MONTHS,
  DAYS,
} from '../../constants/taskDefinition.constants';

// ─────────────────────────────────────────────
// Props
// ─────────────────────────────────────────────
interface EditTaskDefinitionDialogProps {
  open: boolean;
  onClose: () => void;
  definitionId: string | null;
  businessId: string;
  onSuccess?: () => void;
}

// ─────────────────────────────────────────────
// Form State
// ─────────────────────────────────────────────
interface FormData {
  // Basic
  name: string;
  taskType: string;
  description: string;
  category: string;
  subjectType: string;
  priority: TaskPriority;

  // Schedule
  schedulePattern: SchedulePattern;
  monthlyDay: number;
  q1Month: number; q1Day: number;
  q2Month: number; q2Day: number;
  q3Month: number; q3Day: number;
  q4Month: number; q4Day: number;
  h1Month: number; h1Day: number;
  h2Month: number; h2Day: number;
  yearlyMonth: number;
  yearlyDay: number;
  oneTimeDueDate: string;

  // Settings
  targetOffsetDays: number;
  isActive: boolean;
  autoCreateTasks: boolean;      // ✅ NEW
  autoCreateReminders: boolean;  // ✅ NEW
}

const DEFAULT_FORM: FormData = {
  name: '',
  taskType: '',
  description: '',
  category: '',
  subjectType: 'CLIENT',
  priority: 'MEDIUM',
  schedulePattern: 'monthly',
  monthlyDay: 10,
  q1Month: 4,  q1Day: 30,
  q2Month: 7,  q2Day: 31,
  q3Month: 10, q3Day: 31,
  q4Month: 1,  q4Day: 31,
  h1Month: 4,  h1Day: 30,
  h2Month: 10, h2Day: 31,
  yearlyMonth: 3,
  yearlyDay: 31,
  oneTimeDueDate: '',
  targetOffsetDays: 0,
  isActive: true,
  autoCreateTasks: false,      // ✅ NEW
  autoCreateReminders: false,  // ✅ NEW
};

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────
const SectionLabel = ({ children }: { children: React.ReactNode }) => (
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
    {children}
  </Typography>
);

const SectionCard = ({ children }: { children: React.ReactNode }) => (
  <Box
    sx={{
      bgcolor: '#fff',
      borderRadius: 2,
      border: '1px solid',
      borderColor: 'divider',
      p: 2.5,
    }}
  >
    {children}
  </Box>
);

// ─────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────
export default function EditTaskDefinitionDialog({
  open,
  onClose,
  definitionId,
  businessId,
  onSuccess,
}: EditTaskDefinitionDialogProps) {
  const [form, setForm] = useState<FormData>(DEFAULT_FORM);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [error, setError] = useState('');

  // ─── Fetch & pre-fill ────────────────────────────────────────────────────
  // ✅ Moved inside useEffect to fix exhaustive-deps warning
  useEffect(() => {
    if (!open || !definitionId || !businessId) return;

    const fetchDefinition = async () => {
      try {
        setFetching(true);
        setError('');
        const def: TaskDefinition = await getTaskDefinitionById(businessId, definitionId);

        setForm({
          name:             def.name,
          taskType:         def.taskType,
          description:      def.description || '',
          category:         def.category || '',
          subjectType:      def.subjectType,
          priority:         def.priority,
          schedulePattern:  def.scheduleRule.pattern,

          // Monthly
          monthlyDay: def.scheduleRule.monthly?.day ?? 10,

          // Quarterly
          q1Month: def.scheduleRule.quarterly?.q1Month ?? 4,
          q1Day:   def.scheduleRule.quarterly?.q1Day   ?? 30,
          q2Month: def.scheduleRule.quarterly?.q2Month ?? 7,
          q2Day:   def.scheduleRule.quarterly?.q2Day   ?? 31,
          q3Month: def.scheduleRule.quarterly?.q3Month ?? 10,
          q3Day:   def.scheduleRule.quarterly?.q3Day   ?? 31,
          q4Month: def.scheduleRule.quarterly?.q4Month ?? 1,
          q4Day:   def.scheduleRule.quarterly?.q4Day   ?? 31,

          // Half-Yearly
          h1Month: def.scheduleRule.halfYearly?.firstHalf.month  ?? 4,
          h1Day:   def.scheduleRule.halfYearly?.firstHalf.day    ?? 30,
          h2Month: def.scheduleRule.halfYearly?.secondHalf.month ?? 10,
          h2Day:   def.scheduleRule.halfYearly?.secondHalf.day   ?? 31,

          // Yearly
          yearlyMonth: def.scheduleRule.yearly?.month ?? 3,
          yearlyDay:   def.scheduleRule.yearly?.day   ?? 31,

          // One-Time — convert ISO to date input value
          oneTimeDueDate: def.scheduleRule.oneTime?.dueDate
            ? new Date(def.scheduleRule.oneTime.dueDate).toISOString().split('T')[0]
            : '',

          // Settings
          targetOffsetDays:   def.targetOffsetDays   ?? 0,
          isActive:           def.isActive,
          autoCreateTasks:    def.autoCreateTasks    ?? false,  // ✅ NEW
          autoCreateReminders: def.autoCreateReminders ?? false, // ✅ NEW
        });
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Failed to load task definition');
      } finally {
        setFetching(false);
      }
    };

    fetchDefinition();
  }, [open, definitionId, businessId]);

  // ─── Generic setter ───────────────────────────────────────────────────────
  const set = <K extends keyof FormData>(field: K, value: FormData[K]) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  // ─── Validation ───────────────────────────────────────────────────────────
  const validate = (): string | null => {
    if (!form.name.trim())     return 'Task name is required';
    if (!form.taskType.trim()) return 'Task type is required';
    if (!form.subjectType)     return 'Subject type is required';
    if (form.schedulePattern === 'one_time' && !form.oneTimeDueDate)
      return 'Due date is required for one-time tasks';
    return null;
  };

  // ─── Build Schedule Rule ──────────────────────────────────────────────────
  const buildScheduleRule = (): ScheduleRule => {
    const rule: ScheduleRule = { pattern: form.schedulePattern };
    switch (form.schedulePattern) {
      case 'monthly':
        rule.monthly = { day: form.monthlyDay };
        break;
      case 'quarterly':
        rule.quarterly = {
          q1Month: form.q1Month, q1Day: form.q1Day,
          q2Month: form.q2Month, q2Day: form.q2Day,
          q3Month: form.q3Month, q3Day: form.q3Day,
          q4Month: form.q4Month, q4Day: form.q4Day,
        };
        break;
      case 'half_yearly':
        rule.halfYearly = {
          firstHalf:  { month: form.h1Month, day: form.h1Day },
          secondHalf: { month: form.h2Month, day: form.h2Day },
        };
        break;
      case 'yearly':
        rule.yearly = { month: form.yearlyMonth, day: form.yearlyDay };
        break;
      case 'one_time':
        rule.oneTime = { dueDate: form.oneTimeDueDate };
        break;
    }
    return rule;
  };

  // ─── Submit ───────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }
    if (!definitionId) return;

    setLoading(true);
    setError('');

    try {
      const dto: UpdateTaskDefinitionDto = {
        name:                form.name.trim(),
        taskType:            form.taskType,
        description:         form.description.trim() || undefined,  // ✅ don't fabricate
        category:            form.category || undefined,            // ✅ don't fabricate
        subjectType:         form.subjectType,
        priority:            form.priority,
        isActive:            form.isActive,
        autoCreateTasks:     form.autoCreateTasks,                  // ✅ NEW
        autoCreateReminders: form.autoCreateReminders,              // ✅ NEW
        titleTemplate:       form.name.trim(),
        descriptionTemplate: form.description.trim() || form.name.trim(),
        scheduleRule:        buildScheduleRule(),
        targetOffsetDays:    form.targetOffsetDays,
        generationRule:      { applyTo: 'all_subjects_of_type' },
        metadataTemplate:    {},
      };

      console.log('📤 Updating task definition:', JSON.stringify(dto, null, 2));
      await updateTaskDefinition(businessId, definitionId, dto);
      console.log('✅ Task definition updated successfully');

      onSuccess?.();
      onClose();
    } catch (err: unknown) {
      console.error('❌ Update error:', err);
      setError(err instanceof Error ? err.message : 'Failed to update task definition');
    } finally {
      setLoading(false);
    }
  };

  // ─── Close ────────────────────────────────────────────────────────────────
  const handleClose = () => {
    if (loading) return;
    setError('');
    onClose();
  };

  // ─────────────────────────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>

      {/* ── Header ─────────────────────────────────────────────────────────── */}
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
          <EditIcon sx={{ fontSize: 22 }} />
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
              Edit Task Definition
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.3 }}>
              Update Definition
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

      {/* ── Content ────────────────────────────────────────────────────────── */}
      <DialogContent sx={{ p: 3, bgcolor: '#f8fafc' }}>
        {fetching ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Stack spacing={3}>

            {/* Error */}
            {error && (
              <Alert severity="error" onClose={() => setError('')}>
                {error}
              </Alert>
            )}

            {/* ── Section 1: Basic Information ─────────────────────────── */}
            <SectionCard>
              <SectionLabel>Basic Information</SectionLabel>
              <Grid container spacing={2}>

                <Grid size={{ xs: 12 }}>
                  <TextField
                    label="Task Name"
                    required
                    fullWidth
                    size="small"
                    value={form.name}
                    onChange={(e) => set('name', e.target.value)}
                    placeholder="e.g., GST-3B Filing"
                  />
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    label="Task Type"
                    select
                    required
                    fullWidth
                    size="small"
                    value={form.taskType}
                    onChange={(e) => set('taskType', e.target.value)}
                  >
                    <MenuItem value=""><em>Select type…</em></MenuItem>
                    {TASK_TYPES.map((type) => (
                      <MenuItem key={type} value={type}>{type}</MenuItem>
                    ))}
                  </TextField>
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    label="Category"
                    select
                    fullWidth
                    size="small"
                    value={form.category}
                    onChange={(e) => set('category', e.target.value)}
                  >
                    <MenuItem value=""><em>Select category…</em></MenuItem>
                    {TASK_CATEGORIES.map((cat) => (
                      <MenuItem key={cat} value={cat}>{cat}</MenuItem>
                    ))}
                  </TextField>
                </Grid>

                <Grid size={{ xs: 12 }}>
                  <TextField
                    label="Description"
                    fullWidth
                    size="small"
                    multiline
                    rows={2}
                    value={form.description}
                    onChange={(e) => set('description', e.target.value)}
                    placeholder="Describe the task…"
                  />
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    label="Subject Type"
                    select
                    required
                    fullWidth
                    size="small"
                    value={form.subjectType}
                    onChange={(e) => set('subjectType', e.target.value)}
                  >
                    {SUBJECT_TYPE_OPTIONS.map((opt) => (
                      <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
                    ))}
                  </TextField>
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    label="Priority"
                    select
                    fullWidth
                    size="small"
                    value={form.priority}
                    onChange={(e) => set('priority', e.target.value as TaskPriority)}
                  >
                    {PRIORITY_OPTIONS.map((opt) => (
                      <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
                    ))}
                  </TextField>
                </Grid>

              </Grid>
            </SectionCard>

            {/* ── Section 2: Schedule ───────────────────────────────────── */}
            <SectionCard>
              <SectionLabel>Schedule</SectionLabel>
              <Grid container spacing={2}>

                <Grid size={{ xs: 12 }}>
                  <TextField
                    label="Schedule Pattern"
                    select
                    required
                    fullWidth
                    size="small"
                    value={form.schedulePattern}
                    onChange={(e) => set('schedulePattern', e.target.value as SchedulePattern)}
                  >
                    {SCHEDULE_PATTERNS.map((pat) => (
                      <MenuItem key={pat.value} value={pat.value}>{pat.label}</MenuItem>
                    ))}
                  </TextField>
                </Grid>

                {/* Monthly */}
                {form.schedulePattern === 'monthly' && (
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      label="Day of Month" select fullWidth size="small"
                      value={form.monthlyDay}
                      onChange={(e) => set('monthlyDay', Number(e.target.value))}
                    >
                      {DAYS.map((d) => (
                        <MenuItem key={d.value} value={d.value}>{d.label}</MenuItem>
                      ))}
                    </TextField>
                  </Grid>
                )}

                {/* Quarterly */}
                {form.schedulePattern === 'quarterly' && (
                  <>
                    {(
                      [
                        { label: 'Q1 (Apr – Jun)', monthField: 'q1Month', dayField: 'q1Day' },
                        { label: 'Q2 (Jul – Sep)', monthField: 'q2Month', dayField: 'q2Day' },
                        { label: 'Q3 (Oct – Dec)', monthField: 'q3Month', dayField: 'q3Day' },
                        { label: 'Q4 (Jan – Mar)', monthField: 'q4Month', dayField: 'q4Day' },
                      ] as const
                    ).map(({ label, monthField, dayField }) => (
                      <Grid size={{ xs: 12 }} key={label}>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                          {label}
                        </Typography>
                        <Grid container spacing={1}>
                          <Grid size={{ xs: 6 }}>
                            <TextField
                              label="Month" select fullWidth size="small"
                              value={form[monthField]}
                              onChange={(e) => set(monthField, Number(e.target.value))}
                            >
                              {MONTHS.map((m) => (
                                <MenuItem key={m.value} value={m.value}>{m.label}</MenuItem>
                              ))}
                            </TextField>
                          </Grid>
                          <Grid size={{ xs: 6 }}>
                            <TextField
                              label="Day" select fullWidth size="small"
                              value={form[dayField]}
                              onChange={(e) => set(dayField, Number(e.target.value))}
                            >
                              {DAYS.map((d) => (
                                <MenuItem key={d.value} value={d.value}>{d.label}</MenuItem>
                              ))}
                            </TextField>
                          </Grid>
                        </Grid>
                      </Grid>
                    ))}
                  </>
                )}

                {/* Half-Yearly */}
                {form.schedulePattern === 'half_yearly' && (
                  <>
                    {(
                      [
                        { label: 'First Half',  monthField: 'h1Month', dayField: 'h1Day' },
                        { label: 'Second Half', monthField: 'h2Month', dayField: 'h2Day' },
                      ] as const
                    ).map(({ label, monthField, dayField }) => (
                      <Grid size={{ xs: 12 }} key={label}>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                          {label}
                        </Typography>
                        <Grid container spacing={1}>
                          <Grid size={{ xs: 6 }}>
                            <TextField
                              label="Month" select fullWidth size="small"
                              value={form[monthField]}
                              onChange={(e) => set(monthField, Number(e.target.value))}
                            >
                              {MONTHS.map((m) => (
                                <MenuItem key={m.value} value={m.value}>{m.label}</MenuItem>
                              ))}
                            </TextField>
                          </Grid>
                          <Grid size={{ xs: 6 }}>
                            <TextField
                              label="Day" select fullWidth size="small"
                              value={form[dayField]}
                              onChange={(e) => set(dayField, Number(e.target.value))}
                            >
                              {DAYS.map((d) => (
                                <MenuItem key={d.value} value={d.value}>{d.label}</MenuItem>
                              ))}
                            </TextField>
                          </Grid>
                        </Grid>
                      </Grid>
                    ))}
                  </>
                )}

                {/* Yearly */}
                {form.schedulePattern === 'yearly' && (
                  <>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <TextField
                        label="Month" select fullWidth size="small"
                        value={form.yearlyMonth}
                        onChange={(e) => set('yearlyMonth', Number(e.target.value))}
                      >
                        {MONTHS.map((m) => (
                          <MenuItem key={m.value} value={m.value}>{m.label}</MenuItem>
                        ))}
                      </TextField>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <TextField
                        label="Day" select fullWidth size="small"
                        value={form.yearlyDay}
                        onChange={(e) => set('yearlyDay', Number(e.target.value))}
                      >
                        {DAYS.map((d) => (
                          <MenuItem key={d.value} value={d.value}>{d.label}</MenuItem>
                        ))}
                      </TextField>
                    </Grid>
                  </>
                )}

                {/* One-Time */}
                {form.schedulePattern === 'one_time' && (
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      label="Due Date"
                      type="date"
                      required
                      fullWidth
                      size="small"
                      value={form.oneTimeDueDate}
                      onChange={(e) => set('oneTimeDueDate', e.target.value)}
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                )}

                {/* Target Offset Days */}
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    label="Target Offset Days"
                    type="number"
                    fullWidth
                    size="small"
                    value={form.targetOffsetDays}
                    onChange={(e) => set('targetOffsetDays', Number(e.target.value))}
                    helperText="Days before (−) or after (+) due date"
                    inputProps={{ min: -365, max: 365 }}
                  />
                </Grid>

              </Grid>
            </SectionCard>

            {/* ── Section 3: Settings — matches mobile screenshot ───────── */}
            <SectionCard>
              <SectionLabel>Settings</SectionLabel>
              <Stack spacing={0}>

                {/* Active — Switch matching mobile */}
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    py: 1.5,
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                  }}
                >
                  <Typography variant="body1" fontWeight={500}>
                    Active
                  </Typography>
                  <Switch
                    checked={form.isActive}
                    onChange={(e) => set('isActive', e.target.checked)}
                    color="success"
                  />
                </Box>

                {/* Auto-create Tasks — Switch ✅ NEW */}
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    py: 1.5,
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                  }}
                >
                  <Typography variant="body1" fontWeight={500}>
                    Auto-create Tasks
                  </Typography>
                  <Switch
                    checked={form.autoCreateTasks}
                    onChange={(e) => set('autoCreateTasks', e.target.checked)}
                    color="success"
                  />
                </Box>

                {/* Auto-create Reminders — Switch ✅ NEW */}
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    py: 1.5,
                  }}
                >
                  <Typography variant="body1" fontWeight={500}>
                    Auto-create Reminders
                  </Typography>
                  <Switch
                    checked={form.autoCreateReminders}
                    onChange={(e) => set('autoCreateReminders', e.target.checked)}
                    color="success"
                  />
                </Box>

              </Stack>
            </SectionCard>

          </Stack>
        )}
      </DialogContent>

      {/* ── Footer ─────────────────────────────────────────────────────────── */}
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
          disabled={loading || fetching}
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
          disabled={loading || fetching}
          startIcon={loading ? <CircularProgress size={16} color="inherit" /> : <EditIcon />}
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
            '&:disabled': {
              background: '#93c5fd',
              color: '#fff',
            },
          }}
        >
          {loading ? 'Updating…' : 'Update Definition'}
        </Button>
      </DialogActions>

    </Dialog>
  );
}
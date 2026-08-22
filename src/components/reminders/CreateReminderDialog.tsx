"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  Stack,
  Alert,
  CircularProgress,
  IconButton,
  Typography,
  Box,
  Divider,
  RadioGroup,
  FormControlLabel,
  Radio,
  Paper,
} from "@mui/material";
import {
  Close as CloseIcon,
  CalendarToday as CalendarIcon,
  AccessTime as TimeIcon,
  NotificationsActive as ReminderIcon,
} from "@mui/icons-material";
import {
  CreateReminderPayload,
  CreateReminderFormState,
  DEFAULT_REMINDER_FORM,
} from "../../types/reminders.types";
import { createReminder } from "../../services/reminderService";
import { getSubjects } from "../../services/subjectService";
import { getTaskDefinitions } from "../../services/taskDefinitionService";
import { getTasks } from "../../services/taskService";
import { getV2ReminderDefinitions } from "../../services/reminderDefinitionService";
import { getMessageTemplates } from "../../services/messageTemplateService";
import { getBusinesses } from "../../services/businessService";
import {
  REMINDER_CHANNELS,
  REMINDER_CHANNEL_LABELS,
} from "../../constants/reminderConstants";
import { SubjectListItem } from "../../types/subject";
import { TaskDefinitionListItem } from "../../types/taskDefinition.types";
import { TaskListItem } from "../../types/task.types";
import { V2ReminderDefinition } from "../../types/v2ReminderDefinition.types";
import { MessageTemplateListItem } from "../../types/messageTemplate.types";
import { replaceTemplatePlaceholders } from "@/utils/templatePlaceholders";
import { createTask } from "../../services/taskService";
import { CreateTaskDto } from "../../types/task.types";

// ─── Props ────────────────────────────────────────────────────────────────────
interface CreateReminderDialogProps {
  open: boolean;
  onClose: () => void;
  businessId: string;
  organizationId: string;
  onSuccess: () => void;
}

// ─── Shared field styles ──────────────────────────────────────────────────────
const fieldSx = {
  "& .MuiOutlinedInput-root": {
    borderRadius: "12px",
    backgroundColor: "#FFFFFF",
    fontSize: "0.9rem",

    "& fieldset": {
      borderColor: "#E2E8F0",
    },

    "&:hover fieldset": {
      borderColor: "#CBD5E1",
    },

    "&.Mui-focused fieldset": {
      borderColor: "#3B82F6",
      borderWidth: 1.5,
    },
  },

  "& .MuiInputLabel-root.Mui-focused": {
    color: "#3B82F6",
  },

  "& .MuiFormHelperText-root": {
    fontSize: "0.75rem",
    marginLeft: "4px",
    color: "#94A3B8",
  },
};

// ─── Section Label ────────────────────────────────────────────────────────────
function SectionLabel({
  label,
  required,
}: {
  label: string;
  required?: boolean;
}) {
  return (
    <Typography
      variant="body2"
      fontWeight={600}
      sx={{ color: "#1A1A1A", mb: 0.75, fontSize: "0.875rem" }}
    >
      {label}
      {required && (
        <Box component="span" sx={{ color: "#E53935", ml: 0.5 }}>
          *
        </Box>
      )}
    </Typography>
  );
}

// ─── Placeholder Substitution ─────────────────────────────────────────────────
/* function replacePlaceholders(
  text: string,
  values: Record<string, string>,
): string {
  let result = text;
  Object.entries(values).forEach(([key, value]) => {
    result = result.replace(
      new RegExp(`\\[${key}\\]`, "gi"),
      value || `[${key}]`,
    );
  });
  return result;
} */

// ─── Component ────────────────────────────────────────────────────────────────
export default function CreateReminderDialog({
  open,
  onClose,
  businessId,
  organizationId,
  onSuccess,
}: CreateReminderDialogProps) {
  // ── Form State ──────────────────────────────────────────────────────────────
  const [form, setForm] = useState<CreateReminderFormState>(
    DEFAULT_REMINDER_FORM,
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // ── Dropdown Data ───────────────────────────────────────────────────────────
  const [clients, setClients] = useState<SubjectListItem[]>([]);
  const [selectedClient, setSelectedClient] = useState<SubjectListItem | null>(
    null,
  );
  const [taskDefinitions, setTaskDefinitions] = useState<
    TaskDefinitionListItem[]
  >([]);
  const [tasks, setTasks] = useState<TaskListItem[]>([]);
  const [reminderDefinitions, setReminderDefinitions] = useState<
    V2ReminderDefinition[]
  >([]);
  const [messageTemplates, setMessageTemplates] = useState<
    MessageTemplateListItem[]
  >([]);
  const [matchedTask, setMatchedTask] = useState<TaskListItem | null>(null);

  // ── Loading ─────────────────────────────────────────────────────────────────
  const [masterDataLoading, setMasterDataLoading] = useState(false);

  // ── Business Details ────────────────────────────────────────────────────────
  const [businessName, setBusinessName] = useState("");
  const [businessPhone, setBusinessPhone] = useState("");

  // ── 1. Fetch Master Data ────────────────────────────────────────────────────
  const fetchMasterData = useCallback(async () => {
    try {
      setMasterDataLoading(true);
      setError("");

      const [
        subjectsData,
        taskDefsData,
        tasksData,
        reminderDefsData,
        messageTemplatesData,
      ] = await Promise.all([
        getSubjects(businessId),
        getTaskDefinitions(businessId),
        getTasks(businessId),
        getV2ReminderDefinitions(businessId),
        getMessageTemplates(businessId),
      ]);

      const activeClients = subjectsData.filter(
        (s) => s.subjectType === "CLIENT" && s.isActive,
      );

      setClients(activeClients);
      setTaskDefinitions(taskDefsData || []);
      setTasks(tasksData || []);
      setReminderDefinitions(reminderDefsData || []);
      setMessageTemplates(messageTemplatesData || []);
    } catch (err) {
      setError(
        err instanceof Error
          ? `Failed to load form data: ${err.message}`
          : "Failed to load form data",
      );
    } finally {
      setMasterDataLoading(false);
    }
  }, [businessId]);

  // ── 2. Fetch Business Details ───────────────────────────────────────────────
  const fetchBusinessDetails = useCallback(async () => {
    try {
      const businesses = await getBusinesses(organizationId);
      const business = businesses.find((b) => b.id === businessId);
      if (business) {
        setBusinessName(business.name ?? "");
        setBusinessPhone(business.phone ?? "");
      }
    } catch (err) {
      console.error("❌ Failed to load business details:", err);
    }
  }, [organizationId, businessId]);

  // ── 3. Trigger on dialog open ───────────────────────────────────────────────
  useEffect(() => {
    if (open && businessId) {
      fetchMasterData();
      fetchBusinessDetails();
    }
  }, [open, businessId, fetchMasterData, fetchBusinessDetails]);

  // ── 4. Handle Client Change ─────────────────────────────────────────────────
  const handleClientChange = (clientId: string) => {
    const client = clients.find((c) => c.id === clientId) ?? null;
    setSelectedClient(client);
    setForm((prev) => ({
      ...prev,
      targetUserId: clientId,
      selectedTaskDefinitionId: "",
      taskId: "",
      taskName: "",
      reminderDefinitionId: "",
      channel: "",
      messageTemplateId: "",
    }));
  };

  // ── 5. Handle Task Type Change ──────────────────────────────────────────────
 // ── 5. Handle Task Type Change ──────────────────────────────────────────────
 const handleTaskTypeChange = (taskDefinitionId: string) => {
  const selectedTaskDef = taskDefinitions.find(
    (td) => td.id === taskDefinitionId,
  );

  const foundTask = tasks.find(
    (t) =>
      t.subject?.id === form.targetUserId &&
      t.taskType != null &&
      selectedTaskDef?.taskType != null &&
      t.taskType.startsWith(selectedTaskDef.taskType),
  );

  const matchedReminderDef = reminderDefinitions.find(
    (rd) => rd.taskDefinitionId === taskDefinitionId,
  );

  console.log("🎯 Cascade result:", {
    selectedTaskDef,
    foundTask,
    matchedReminderDef,
  });

  setMatchedTask(foundTask ?? null);

  setForm((prev) => ({
    ...prev,
    selectedTaskDefinitionId: taskDefinitionId,
    taskId: foundTask?.id ?? "",
    taskName: foundTask?.title ?? prev.taskName,
    reminderDefinitionId: matchedReminderDef?.id ?? "",
    channel: matchedReminderDef?.channel || prev.channel, // keep existing channel if no reminder def
    // ✅ messageTemplateId no longer set here — handled by the dedicated useEffect below,
    // matching CreateTaskDialog's pattern exactly.
  }));
};

// ─── ✅ Auto-match Message Template by Task Type name — same pattern as CreateTaskDialog ───
useEffect(() => {
  if (!form.selectedTaskDefinitionId || messageTemplates.length === 0) return;

  const selectedTaskDef = taskDefinitions.find(
    (td) => td.id === form.selectedTaskDefinitionId,
  );
  if (!selectedTaskDef?.taskType) return;

  const matchedTemplate = messageTemplates.find((template) =>
    template.name
      ?.toLowerCase()
      .includes(selectedTaskDef.taskType.split("_")[0].toLowerCase()),
  );

  console.log("✅ Matched Template (by name):", matchedTemplate);

  if (matchedTemplate) {
    setForm((prev) => ({
      ...prev,
      messageTemplateId: matchedTemplate.id,
    }));
  }
}, [form.selectedTaskDefinitionId, messageTemplates, taskDefinitions]);

  // ── 6. Generic Field Change ─────────────────────────────────────────────────
  const handleChange = (
      field: keyof CreateReminderFormState,
      value: string | boolean,
    ) => {
      setForm((prev) => ({ ...prev, [field]: value }));
    };

    // ── 7. Close ────────────────────────────────────────────────────────────────
    const handleClose = () => {
      if (saving) return;
      setForm(DEFAULT_REMINDER_FORM);
      setSelectedClient(null);
      setMatchedTask(null);
      setError("");
      onClose();
    };

    // ── 8. Validate ─────────────────────────────────────────────────────────────
   const validate = (f: CreateReminderFormState): string | null => {
  if (!f.targetUserId) return "Please select a client.";
  if (!f.selectedTaskDefinitionId) return "Please select a task type.";
  if (!f.taskName.trim()) return "Please enter a task name.";
  // ✅ taskId no longer required upfront — auto-created in handleSubmit if missing
  if (!f.channel) return "Delivery channel is required.";
  if (!f.messageTemplateId) return "No message template found.";
  if (!f.sendNow && !f.scheduledAt)
    return "Please select a scheduled date and time.";
  return null;
};

    // ── 9. Submit ───────────────────────────────────────────────────────────────
    const handleSubmit = async () => {
  const validationError = validate(form);
  if (validationError) {
    setError(validationError);
    return;
  }
  try {
    setSaving(true);
    setError("");

    let resolvedTaskId = form.taskId;

    // ✅ If no existing Task matches, silently create one first —
    // backend requires taskId for every Reminder, but the user
    // shouldn't need to manage Tasks manually for urgent reminders.
    if (!resolvedTaskId) {
      const dueDateIso = form.scheduledAt
        ? new Date(form.scheduledAt).toISOString().split("T")[0]
        : new Date().toISOString().split("T")[0];

      const taskDto: CreateTaskDto = {
        title: form.taskName,
        taskName: form.taskName,
        subjectId: form.targetUserId,
        taskDefinitionId: form.selectedTaskDefinitionId || undefined,
        taskType: selectedTaskDef?.taskType || "",
        dueDate: dueDateIso,
        category: "COMPLIANCE",
        status: "OPEN",
        priority: "MEDIUM",
        frequency: "ONETIME",
        remindersScheduled: [],
      };

      console.log("📤 Auto-creating Task for reminder:", JSON.stringify(taskDto, null, 2));
      const newTask = await createTask(businessId, taskDto);
      resolvedTaskId = newTask.id;
      console.log("✅ Auto-created Task:", resolvedTaskId);
    }

    const payload: CreateReminderPayload = {
      taskId: resolvedTaskId,
      reminderDefinitionId: form.reminderDefinitionId,
      reminderSource: form.reminderSource,
      channel: form.channel as CreateReminderPayload["channel"],
      targetUserId: form.targetUserId,
      messageTemplateId: form.messageTemplateId,
      sendNow: form.sendNow,
      ...(!form.sendNow &&
        form.scheduledAt && {
          scheduledAt: new Date(form.scheduledAt).toISOString(),
        }),
    };

    console.log("📤 Submitting reminder payload:", JSON.stringify(payload, null, 2));

    await createReminder(businessId, payload);
    onSuccess();
    handleClose();
  } catch (err: unknown) {
    setError(
      err instanceof Error
        ? err.message
        : "Failed to create reminder. Please try again.",
    );
  } finally {
    setSaving(false);
  }
};

    // ── Derived Values ──────────────────────────────────────────────────────────
    const selectedTaskDef = taskDefinitions.find(
      (td) => td.id === form.selectedTaskDefinitionId,
    );

    const dueDateFormatted = matchedTask?.dueDate
      ? new Date(matchedTask.dueDate).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
      : "";

    const placeholderValues: Record<string, string> = {
      CLIENTNAME: selectedClient?.displayName ?? "",
      BUSINESSNAME: selectedClient?.businessName ?? "",
      DUEDATE: dueDateFormatted,
      SERVICETYPE: selectedTaskDef?.name ?? "",
      YOURFIRMNAME: businessName,
      YOURCONTACTNUMBER: businessPhone,
    };

    const previewDate = form.scheduledAt
      ? new Date(form.scheduledAt).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
      : new Date().toLocaleDateString("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });

    const previewTime = form.scheduledAt
      ? new Date(form.scheduledAt).toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      })
      : "10:00 AM";

    // ── JSX ─────────────────────────────────────────────────────────────────────
    return (
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="sm"
        fullWidth
        disableEscapeKeyDown={saving}
        PaperProps={{
          sx: {
            borderRadius: "20px",
            boxShadow: "0 10px 30px rgba(15,23,42,0.08)",
            border: "1px solid #E2E8F0",
            overflow: "hidden",
          },
        }}
      >
        {/* ── Header ── */}
        <DialogTitle
          sx={{
            px: 3,
            pt: 2.5,
            pb: 2,
            borderBottom: "1px solid #F0F0F0",
            backgroundColor: "#fff",
            color: "#0F172A",
          }}
        >
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
          >
            <Stack direction="row" alignItems="center" spacing={1.5}>
              <Box
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: "10px",
                  backgroundColor: "#EFF6FF",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <ReminderIcon sx={{ fontSize: 20, color: "#2563EB" }} />
              </Box>
              <Box>
                <Typography
                  variant="h6"
                  fontWeight={700}
                  fontSize="1.05rem"
                  lineHeight={1.2}
                >
                  Send Reminder
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Schedule or send immediately
                </Typography>
              </Box>
            </Stack>
            <IconButton
              onClick={handleClose}
              size="small"
              disabled={saving}
              sx={{
                backgroundColor: "#F8FAFC",
                border: "1px solid #E2E8F0",
                borderRadius: "8px",
                "&:hover": { backgroundColor: "#EEEEEE" },
              }}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </Stack>
        </DialogTitle>

        {/* ── Body ── */}
        <DialogContent sx={{ px: 3, py: 2.5, backgroundColor: "#F8FAFC" }}>
          {masterDataLoading && (
            <Stack alignItems="center" py={4} spacing={1.5}>
              <CircularProgress size={28} sx={{ color: "#2E7D32" }} />
              <Typography variant="body2" color="text.secondary">
                Loading form data...
              </Typography>
            </Stack>
          )}

          {!masterDataLoading && (
            <Stack spacing={2.5}>
              {error && (
                <Alert
                  severity="error"
                  onClose={() => setError("")}
                  sx={{ borderRadius: "12px", fontSize: "0.85rem" }}
                >
                  {error}
                </Alert>
              )}

              {/* ══ Card 1: Client + Task Type + Task Name ══ */}
              <Paper
                elevation={0}
                sx={{
                  borderRadius: "16px",
                  border: "1px solid #E2E8F0",
                  boxShadow: "0 1px 2px rgba(15,23,42,0.04)",
                  p: 2.5,
                  backgroundColor: "#fff",
                }}
              >
                <Box mb={2}>
                  <SectionLabel label="Select Client" required />
                  <TextField
                    select
                    fullWidth
                    size="small"
                    value={form.targetUserId}
                    onChange={(e) => handleClientChange(e.target.value)}
                    SelectProps={{ displayEmpty: true }}
                    sx={fieldSx}
                  >
                  
                    <MenuItem value="" disabled>
                      <Typography color="text.disabled">Client Name</Typography>
                    </MenuItem>
                    {clients.map((client) => (
                      <MenuItem key={client.id} value={client.id}>
                        {client.displayName}
                      </MenuItem>
                    ))}
                  </TextField>
                </Box>

                <Box mb={2}>
                  <SectionLabel label="Task Type" required />
                  <TextField
                    select
                    fullWidth
                    size="small"
                    value={form.selectedTaskDefinitionId}
                    onChange={(e) => handleTaskTypeChange(e.target.value)}
                    disabled={!form.targetUserId}
                    SelectProps={{ displayEmpty: true }}
                    sx={fieldSx}
                  >
                    <MenuItem value="" disabled>
                      <Typography color="text.disabled">
                        {!form.targetUserId
                          ? "Select a client first"
                          : "Select Task Type"}
                      </Typography>
                    </MenuItem>
                    {taskDefinitions.map((td) => (
                      <MenuItem key={td.id} value={td.id}>
                        {td.name}
                      </MenuItem>
                    ))}
                  </TextField>
                </Box>

                {/* ✅ NEW — Frequency (display-only, matches mobile — not sent to API) */}
               {/* ✅ Frequency (display-only, matches mobile — not sent to API) */}
<Box mb={2}>
  <SectionLabel label="Frequency" required />
  <TextField
    select
    fullWidth
    size="small"
    value={form.frequency}
    onChange={(e) => handleChange("frequency", e.target.value)}
    sx={fieldSx}
  >
    <MenuItem value="ONETIME">One-time</MenuItem>
  </TextField>
</Box>

                <Box>
                  <SectionLabel label="Task Name" required />
                  <TextField
                    fullWidth
                    size="small"
                    value={form.taskName}
                    onChange={(e) => handleChange("taskName", e.target.value)}
                    placeholder="Enter task name"
                    sx={fieldSx}
                  />
                </Box>
              </Paper>

              {/* ══ Card 2: Send When ══ */}
              <Paper
                elevation={0}
                sx={{
                  borderRadius: "16px",
                  border: "1px solid #EEEEEE",
                  p: 2.5,
                  backgroundColor: "#fff",
                }}
              >
                <Typography
                  variant="body2"
                  fontWeight={600}
                  sx={{
                    color: "#64748B",
                    mb: 1.5,
                    fontSize: "0.8rem",
                    letterSpacing: "0.05em",
                    textTransform: "uppercase",
                  }}
                >
                  Send When
                </Typography>

                <RadioGroup
                  row
                  value={form.sendNow ? "now" : "schedule"}
                  onChange={(e) =>
                    handleChange("sendNow", e.target.value === "now")
                  }
                  sx={{ mb: 2, gap: 3 }}
                >
                  <FormControlLabel
                    value="now"
                    control={
                      <Radio
                        size="small"
                        sx={{
                          color: "#BDBDBD",
                          "&.Mui-checked": { color: "#2563EB" },
                        }}
                      />
                    }
                    label={
                      <Typography fontWeight={600} fontSize="0.9rem">
                        Now
                      </Typography>
                    }
                  />
                  <FormControlLabel
                    value="schedule"
                    control={
                      <Radio
                        size="small"
                        sx={{
                          color: "#BDBDBD",
                          "&.Mui-checked": { color: "#2E7D32" },
                        }}
                      />
                    }
                    label={
                      <Typography fontWeight={600} fontSize="0.9rem">
                        Schedule
                      </Typography>
                    }
                  />
                </RadioGroup>

                {form.sendNow ? (
                  <Box
                    sx={{
                      borderRadius: "12px",
                      backgroundColor: "#F5F5F5",
                      p: 2,
                      opacity: 0.6,
                      pointerEvents: "none",
                    }}
                  >
                    <Stack
                      direction="row"
                      alignItems="center"
                      spacing={1.5}
                      mb={1}
                    >
                      <CalendarIcon sx={{ fontSize: 18, color: "#9E9E9E" }} />
                      <Typography fontSize="0.875rem" color="text.secondary">
                        Date: {previewDate}
                      </Typography>
                    </Stack>
                    <Stack direction="row" alignItems="center" spacing={1.5}>
                      <TimeIcon sx={{ fontSize: 18, color: "#9E9E9E" }} />
                      <Typography fontSize="0.875rem" color="text.secondary">
                        Time: {previewTime}
                      </Typography>
                    </Stack>
                  </Box>
                ) : (
                  <TextField
                    type="datetime-local"
                    fullWidth
                    size="small"
                    value={form.scheduledAt}
                    onChange={(e) => handleChange("scheduledAt", e.target.value)}
                    InputLabelProps={{ shrink: true }}
                    inputProps={{ min: new Date().toISOString().slice(0, 16) }}
                    helperText="When should this reminder be delivered?"
                    sx={fieldSx}
                  />
                )}
              </Paper>

              {/* ══ Card 3: Channel + Message Template ══ */}
              <Paper
                elevation={0}
                sx={{
                  borderRadius: "16px",
                  border: "1px solid #EEEEEE",
                  p: 2.5,
                  backgroundColor: "#fff",
                }}
              >
                <Box mb={2}>
                  <SectionLabel label="Delivery Channels" required />
                  <TextField
                    select
                    fullWidth
                    size="small"
                    value={form.channel}
                    onChange={(e) => handleChange("channel", e.target.value)}
                    SelectProps={{ displayEmpty: true }}
                    sx={fieldSx}
                  >
                    <MenuItem value="" disabled>
                      <Typography color="text.disabled">
                        Select Channel
                      </Typography>
                    </MenuItem>
                    {REMINDER_CHANNELS.map((ch) => (
                      <MenuItem key={ch} value={ch}>
                        {REMINDER_CHANNEL_LABELS[ch]}
                      </MenuItem>
                    ))}
                  </TextField>
                </Box>

                <Divider sx={{ my: 2 }} />

                {/* Message Template Preview */}
                <Box>
                  <SectionLabel label="Message Template" />
                  {form.messageTemplateId ? (
                    (() => {
                      const template = messageTemplates.find(
                        (mt) => mt.id === form.messageTemplateId,
                      );
                      const isEmail = form.channel === "EMAIL";
                      const isWhatsapp = form.channel === "WHATSAPP";
                      const isSms = form.channel === "SMS";
                      const emailContent = template?.templates?.email;
                      const whatsappContent = template?.templates?.whatsapp;

                      return (
                        <Box
                          sx={{
                            borderRadius: "12px",
                            border: "1px solid #DBEAFE",
                            backgroundColor: "#fff",
                            overflow: "hidden",
                          }}
                        >
                          {/* Channel Header */}
                          <Stack
                            direction="row"
                            alignItems="center"
                            sx={{
                              px: 2,
                              py: 1.2,
                              borderBottom: "1px solid #E8F5E9",
                              backgroundColor: "#F8FAFC",
                            }}
                          >
                            <Stack
                              direction="row"
                              alignItems="center"
                              spacing={1}
                            >
                              <Typography fontSize="1rem">
                                {form.channel === "EMAIL"
                                  ? "✉️"
                                  : form.channel === "WHATSAPP"
                                    ? "💬"
                                    : form.channel === "SMS"
                                      ? "📱"
                                      : "🔔"}
                              </Typography>
                              <Typography
                                fontWeight={600}
                                fontSize="0.875rem"
                                color="#2563EB"
                              >
                                {form.channel === "EMAIL"
                                  ? "Email"
                                  : form.channel === "WHATSAPP"
                                    ? "WhatsApp"
                                    : form.channel === "SMS"
                                      ? "SMS"
                                    
                                      : form.channel}
                              </Typography>
                            </Stack>
                          </Stack>

                          {/* Template Body */}
                          <Box sx={{ p: 2 }}>
                            {isEmail && emailContent ? (
                              <>
                                <Typography
                                  fontSize="0.8rem"
                                  fontWeight={700}
                                  color="text.secondary"
                                  mb={0.5}
                                >
                                  Subject:
                                </Typography>
                                <Typography
                                  fontSize="0.85rem"
                                  fontWeight={600}
                                  color="#1A1A1A"
                                  mb={1.5}
                                >
                                  {replaceTemplatePlaceholders(
                                    emailContent.subject,
                                    placeholderValues,
                                  )}
                                </Typography>
                                <Typography
                                  fontSize="0.8rem"
                                  fontWeight={700}
                                  color="text.secondary"
                                  mb={0.5}
                                >
                                  Body:
                                </Typography>
                                <Typography
                                  fontSize="0.85rem"
                                  color="#374151"
                                  sx={{ whiteSpace: "pre-line", lineHeight: 1.6 }}
                                >
                                  {replaceTemplatePlaceholders(
                                    emailContent.body,
                                    placeholderValues,
                                  )}
                                </Typography>
                              </>
                            ) : (isWhatsapp || isSms) && whatsappContent ? (
                              <>
                                <Typography
                                  fontSize="0.8rem"
                                  fontWeight={700}
                                  color="text.secondary"
                                  mb={0.5}
                                >
                                  Message:
                                </Typography>
                                <Typography
                                  fontSize="0.85rem"
                                  color="#374151"
                                  sx={{ whiteSpace: "pre-line", lineHeight: 1.6 }}
                                >
                                  {replaceTemplatePlaceholders(
                                    whatsappContent.body,
                                    placeholderValues,
                                  )}
                                </Typography>
                              </>
                            ) : (
                              <Typography
                                fontSize="0.85rem"
                                color="text.secondary"
                              >
                                {template?.name ?? "Template loaded"}
                              </Typography>
                            )}
                          </Box>
                        </Box>
                      );
                    })()
                  ) : (
                    <Box
                      sx={{
                        borderRadius: "12px",
                        backgroundColor: "#F8F9FA",
                        border: "1px solid #E8EAED",
                        p: 2,
                      }}
                    >
                      <Typography fontSize="0.85rem" color="text.disabled">
                        Please select task type and delivery channel first
                      </Typography>
                    </Box>
                  )}
                </Box>
              </Paper>

              {/* ══ Debug Panel — dev only ══ */}
              {process.env.NODE_ENV === "development" && (
                <Paper
                  elevation={0}
                  sx={{
                    borderRadius: "12px",
                    border: "1px dashed #E0E0E0",
                    p: 2,
                    backgroundColor: "#FAFAFA",
                  }}
                >
                  <Typography
                  fontSize="0.75rem"
                  color="text.disabled"
                  mb={1}
                  fontWeight={600}
                >
                  DEBUG (dev only)
                </Typography>
                <Typography
                  fontSize="0.7rem"
                  color="text.disabled"
                  component="pre"
                >
                 {JSON.stringify(
                    {
                      targetUserId: form.targetUserId || "—",
                      taskId: form.taskId || "—",
                      reminderDefinitionId: form.reminderDefinitionId || "—",
                      channel: form.channel || "—",
                      messageTemplateId: form.messageTemplateId || "—",
                      sendNow: form.sendNow,
                      matchedTaskId: matchedTask?.id || "—",
                      clientName: selectedClient?.displayName || "—",
                      firmName: businessName || "—",
                      dueDate: dueDateFormatted || "—",
                    },
                    null,
                    2,
                  )} 
                </Typography> 
                </Paper>
              )}
            </Stack>
          )}
          {/* Warning when no matching task found */}
          {/* {form.selectedTaskDefinitionId && !form.taskId && (
            <Alert
              severity="warning"
              sx={{
                mt: 1,
                borderRadius: "10px",
                fontSize: "0.8rem",
                py: 0.5,
              }}
            >
              No active task found for{" "}
              <strong>{selectedClient?.displayName}</strong> with this task type.
              Please create the task first.
            </Alert>
          )} */}
        </DialogContent>

        {/* ── Actions ── */}
        <DialogActions
          sx={{
            px: 3,
            py: 2.5,
            backgroundColor: "#fff",
            borderTop: "1px solid #F0F0F0",
            gap: 1.5,
          }}
        >
          <Button
            onClick={handleClose}
            disabled={saving}
            fullWidth
            variant="contained"
            sx={{
              textTransform: "none",
              fontWeight: 600,
              fontSize: "0.95rem",
              borderRadius: "12px",
              py: 1.4,

              backgroundColor: "#FFFFFF",
              color: "#475569",

              border: "1px solid #E2E8F0",

              boxShadow: "none",

              "&:hover": {
                backgroundColor: "#F8FAFC",
                boxShadow: "none",
              },
            }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={saving || masterDataLoading}
            fullWidth
            startIcon={
              saving ? <CircularProgress size={16} color="inherit" /> : null
            }
            sx={{
              textTransform: "none",
              fontWeight: 700,
              fontSize: "0.95rem",
              borderRadius: "12px",
              py: 1.4,

              backgroundColor: "#2563EB",

              boxShadow: "none",

              "&:hover": {
                backgroundColor: "#1D4ED8",
                boxShadow: "0 4px 12px rgba(37,99,235,0.25)",
              },
            }}
          >
            {saving ? "Sending..." : "Send Reminder"}
          </Button>
        </DialogActions>
      </Dialog>
    );
  } // ← component closes here

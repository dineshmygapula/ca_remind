"use client";

import {
  Drawer, Box, Typography, IconButton, Divider,
  Chip, Stack, Button, Skeleton, Alert,
} from "@mui/material";
import {
  Close as CloseIcon,
  Edit as EditIcon,
} from "@mui/icons-material";
import { useEffect, useState } from "react";
import { ReminderDetail } from "../../types/reminders.types";
import { getReminderById } from "../../services/reminderService";
import {
  REMINDER_STATUS_LABELS,
  REMINDER_CHANNEL_LABELS,
} from "../../constants/reminderConstants";


interface ReminderDetailsDrawerProps {
  open: boolean;
  onClose: () => void;
  reminderId: string | null;
  businessId: string;
  onEdit: (id: string) => void;
}

const statusColorMap: Record<string, "warning" | "success" | "error" | "default"> = {
  SCHEDULED: "warning",
  SENT:      "success",
  FAILED:    "error",
  CANCELLED: "default",
};

// ─── Small helper to render a label + value row ───────────────────────────────
function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <Box>
      <Typography variant="caption" color="text.secondary" fontWeight={600}>
        {label}
      </Typography>
      <Typography variant="body2" mt={0.25}>
        {value || "—"}
      </Typography>
    </Box>
  );
}

export default function ReminderDetailsDrawer({
  open,
  onClose,
  reminderId,
  businessId,
  onEdit,
}: ReminderDetailsDrawerProps) {

  const [reminder, setReminder]   = useState<ReminderDetail | null>(null);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState("");

  // ─── Fetch detail whenever reminderId changes and drawer is open ──────────
  useEffect(() => {
    if (!open || !reminderId || !businessId) return;

    const fetchDetail = async () => {
      try {
        setLoading(true);
        setError("");
        setReminder(null);
        const data = await getReminderById(businessId, reminderId);
        setReminder(data);
      } catch (err: unknown) {
        setError(
          err instanceof Error ? err.message : "Failed to load reminder details"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();
  }, [open, reminderId, businessId]);

  // ─── Reset on close ───────────────────────────────────────────────────────
  const handleClose = () => {
    setReminder(null);
    setError("");
    onClose();
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={handleClose}
      PaperProps={{ sx: { width: { xs: "100%", sm: 440 }, p: 3 } }}
    >
      {/* ── Header ── */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6" fontWeight={600}>
          Reminder Details
        </Typography>
        <IconButton onClick={handleClose} size="small">
          <CloseIcon />
        </IconButton>
      </Stack>

      <Divider sx={{ mb: 3 }} />

      {/* ── Error ── */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* ── Loading Skeleton ── */}
      {loading && (
        <Stack spacing={2}>
          {Array.from({ length: 6 }).map((_, i) => (
            <Box key={i}>
              <Skeleton variant="text" width={80} height={16} />
              <Skeleton variant="text" width="60%" height={20} />
            </Box>
          ))}
        </Stack>
      )}

      {/* ── Content ── */}
      {!loading && reminder && (
        <Stack spacing={2.5}>

          {/* Status + Channel */}
          <Stack direction="row" spacing={1}>
            <Chip
              label={REMINDER_STATUS_LABELS[reminder.status] ?? reminder.status}
              color={statusColorMap[reminder.status] ?? "default"}
              size="small"
            />
            <Chip
              label={REMINDER_CHANNEL_LABELS[reminder.channel] ?? reminder.channel}
              size="small"
              variant="outlined"
            />
          </Stack>

          <Divider />

          {/* Task */}
          <Box>
            <Typography variant="subtitle2" fontWeight={600} mb={1}>
              Task
            </Typography>
            <Stack spacing={1}>
              <DetailRow label="Title"    value={reminder.task?.title} />
              <DetailRow
                label="Due Date"
                value={
                  reminder.task?.dueDate
                    ? new Date(reminder.task.dueDate).toLocaleDateString()
                    : "—"
                }
              />
            </Stack>
          </Box>

          <Divider />

          {/* Recipient */}
          <Box>
            <Typography variant="subtitle2" fontWeight={600} mb={1}>
              Recipient
            </Typography>
            <Stack spacing={1}>
              <DetailRow label="Type"  value={reminder.recipient?.type} />
              <DetailRow label="Value" value={reminder.recipient?.value} />
            </Stack>
          </Box>

          <Divider />

          {/* Message */}
          <Box>
            <Typography variant="subtitle2" fontWeight={600} mb={1}>
              Message
            </Typography>
            <Stack spacing={1}>
              <DetailRow label="Title"    value={reminder.message?.title} />
              <DetailRow label="Body"     value={reminder.message?.body} />
            </Stack>
          </Box>

          <Divider />

          {/* Timestamps */}
          <Box>
            <Typography variant="subtitle2" fontWeight={600} mb={1}>
              Timestamps
            </Typography>
            <Stack spacing={1}>
              <DetailRow
                label="Scheduled At"
                value={
                  reminder.scheduledAt
                    ? new Date(reminder.scheduledAt).toLocaleString()
                    : "—"
                }
              />
              <DetailRow
                label="Created At"
                value={
                  reminder.createdAt
                    ? new Date(reminder.createdAt).toLocaleString()
                    : "—"
                }
              />
              {reminder.lastError && (
                <DetailRow label="Last Error" value={
                  <Typography variant="body2" color="error.main">
                    {reminder.lastError}
                  </Typography>
                } />
              )}
            </Stack>
          </Box>

          <Divider />

          {/* Actions */}
          <Stack direction="row" spacing={1.5} pt={1}>
            <Button
              variant="contained"
              startIcon={<EditIcon />}
              onClick={() => onEdit(reminder.id)}
              sx={{ textTransform: "none", fontWeight: 600 }}
            >
              Edit Reminder
            </Button>
            <Button
              variant="outlined"
              onClick={handleClose}
              sx={{ textTransform: "none" }}
            >
              Close
            </Button>
          </Stack>

        </Stack>
      )}
    </Drawer>
  );
}
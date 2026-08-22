"use client";

import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, TextField, MenuItem, Stack, Alert,
  CircularProgress, IconButton, Typography, Skeleton,
} from "@mui/material";
import { Close as CloseIcon } from "@mui/icons-material";
import { useEffect, useState } from "react";
import { ReminderDetail, UpdateReminderPayload } from "../../types/reminders.types";
import { getReminderById, updateReminder } from "../../services/reminderService";
import { REMINDER_STATUSES, REMINDER_STATUS_LABELS } from "../../constants/reminderConstants";

interface EditReminderDialogProps {
  open: boolean;
  onClose: () => void;
  reminderId: string | null;
  businessId: string;
  onSuccess: () => void;
}

// ─── Form State Shape ─────────────────────────────────────────────────────────
interface EditFormState {
  scheduledAt: string;
  status: string;
}

const DEFAULT_FORM: EditFormState = {
  scheduledAt: "",
  status: "",
};

export default function EditReminderDialog({
  open,
  onClose,
  reminderId,
  businessId,
  onSuccess,
}: EditReminderDialogProps) {

  const [form, setForm]           = useState<EditFormState>(DEFAULT_FORM);
  const [reminder, setReminder]   = useState<ReminderDetail | null>(null);
  const [fetching, setFetching]   = useState(false);  // loading existing data
  const [saving, setSaving]       = useState(false);  // submitting form
  const [error, setError]         = useState("");

  // ─── Fetch current reminder data to pre-fill form ─────────────────────────
  useEffect(() => {
    if (!open || !reminderId || !businessId) return;

    const fetchReminder = async () => {
      try {
        setFetching(true);
        setError("");
        const data = await getReminderById(businessId, reminderId);
        setReminder(data);

        // Pre-fill form with existing values
        setForm({
          // Convert ISO string to datetime-local format (slice removes ms+Z)
          scheduledAt: data.scheduledAt
            ? data.scheduledAt.slice(0, 16)
            : "",
          status: data.status ?? "",
        });
      } catch (err: unknown) {
        setError(
          err instanceof Error ? err.message : "Failed to load reminder"
        );
      } finally {
        setFetching(false);
      }
    };

    fetchReminder();
  }, [open, reminderId, businessId]);

  // ─── Reset on close ───────────────────────────────────────────────────────
  const handleClose = () => {
    setForm(DEFAULT_FORM);
    setReminder(null);
    setError("");
    onClose();
  };

  // ─── Field change handler ─────────────────────────────────────────────────
  const handleChange = (field: keyof EditFormState, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  // ─── Submit ───────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!reminderId || !businessId) return;

    // Basic validation
    if (!form.scheduledAt) {
      setError("Scheduled date and time is required.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      const payload: UpdateReminderPayload = {
        scheduledAt: new Date(form.scheduledAt).toISOString(),
        status: form.status as UpdateReminderPayload["status"],
      };

      await updateReminder(businessId, reminderId, payload);
      onSuccess();
      handleClose();
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Failed to update reminder"
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      // Prevent closing while saving
      disableEscapeKeyDown={saving}
    >
      {/* ── Header ── */}
      <DialogTitle>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="h6" fontWeight={600}>
            Edit Reminder
          </Typography>
          <IconButton onClick={handleClose} size="small" disabled={saving}>
            <CloseIcon />
          </IconButton>
        </Stack>

        {/* Show which task this reminder belongs to */}
        {reminder && (
          <Typography variant="body2" color="text.secondary" mt={0.5}>
            {reminder.task?.title ?? ""}
          </Typography>
        )}
      </DialogTitle>

      <DialogContent dividers>
        <Stack spacing={3} pt={1}>

          {/* ── Error ── */}
          {error && (
            <Alert severity="error" onClose={() => setError("")}>
              {error}
            </Alert>
          )}

          {/* ── Loading skeleton while fetching current data ── */}
          {fetching ? (
            <Stack spacing={2}>
              <Skeleton variant="rounded" height={56} />
              <Skeleton variant="rounded" height={56} />
            </Stack>
          ) : (
            <>
              {/* ── Scheduled At ── */}
              <TextField
                label="Scheduled Date & Time"
                type="datetime-local"
                fullWidth
                size="small"
                value={form.scheduledAt}
                onChange={(e) => handleChange("scheduledAt", e.target.value)}
                InputLabelProps={{ shrink: true }}
                // Prevent scheduling in the past
                inputProps={{
                  min: new Date().toISOString().slice(0, 16),
                }}
                helperText="When should this reminder be sent?"
              />

              {/* ── Status ── */}
              <TextField
                select
                label="Status"
                fullWidth
                size="small"
                value={form.status}
                onChange={(e) => handleChange("status", e.target.value)}
                helperText="Only SCHEDULED reminders can be sent. Set to CANCELLED to stop."
              >
                {REMINDER_STATUSES.map((status) => (
                  <MenuItem key={status} value={status}>
                    {REMINDER_STATUS_LABELS[status]}
                  </MenuItem>
                ))}
              </TextField>
            </>
          )}

        </Stack>
      </DialogContent>

      {/* ── Actions ── */}
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button
          onClick={handleClose}
          disabled={saving}
          sx={{ textTransform: "none" }}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={saving || fetching}
          startIcon={saving ? <CircularProgress size={16} color="inherit" /> : null}
          sx={{ textTransform: "none", fontWeight: 600 }}
        >
          {saving ? "Saving..." : "Save Changes"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
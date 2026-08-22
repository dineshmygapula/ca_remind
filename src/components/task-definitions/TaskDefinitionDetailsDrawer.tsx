"use client";

import { useEffect, useState } from "react";

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
  Button,
} from "@mui/material";
import {
  Close as CloseIcon,
  Edit as EditIcon,
  CalendarToday as CalendarIcon,
  Assignment as AssignmentIcon,
  Category as CategoryIcon,
  Repeat as FrequencyIcon,
  ChecklistRtl as AutoTaskIcon,
  NotificationAdd as AutoReminderIcon,
} from "@mui/icons-material";
import {
  getTaskDefinitionById,
  updateTaskDefinition,
} from "@/services/taskDefinitionService";
//import { TaskDefinition } from '../../types/taskDefinition.types';
import { MONTHS } from "../../constants/taskDefinition.constants";

import { TaskDefinition } from "../../types/taskDefinition.types";
import ReminderRulesListDrawer from "../reminderdefinitions/ReminderRulesListDrawer";
import { getV2ReminderDefinitions } from "../../services/reminderDefinitionService";
import { V2ReminderDefinition } from "@/types/v2ReminderDefinition.types";

interface TaskDefinitionDetailsDrawerProps {
  open: boolean;
  onClose: () => void;
  definitionId: string | null;
  businessId: string;
  onEdit: (definitionId: string) => void;
  onRefresh?: () => void;
  refreshKey?: number; // ✅ NEW
}

export default function TaskDefinitionDetailsDrawer({
  open,
  onClose,
  definitionId,
  businessId,
  onEdit,
  onRefresh,
  refreshKey, // ✅ NEW
}: TaskDefinitionDetailsDrawerProps) {
  const [definition, setDefinition] = useState<TaskDefinition | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [toggling, setToggling] = useState(false); // ✅ for enable/disable button

  const [reminderRulesOpen, setReminderRulesOpen] = useState(false);

  const [reminderRules, setReminderRules] = useState<V2ReminderDefinition[]>(
    [],
  );
  const [loadingReminders, setLoadingReminders] = useState(false);

  // ─── Fetch Definition Details ─────────────────────────────────────────────
  useEffect(() => {
    if (!open || !definitionId || !businessId) return;

    const fetchReminderRules = async () => {
      try {
        setLoadingReminders(true);

        const allRules = await getV2ReminderDefinitions(businessId);

        const taskRules = allRules.filter(
          (rule) => rule.taskDefinitionId === definitionId,
        );

        setReminderRules(taskRules);

        console.log(
          "📦 Reminder rules for task definition:",
          definitionId,
          taskRules,
        );
      } catch (error) {
        console.error("Failed to load reminder rules", error);
        setReminderRules([]);
      } finally {
        setLoadingReminders(false);
      }
    };

    fetchReminderRules();
  }, [open, businessId, definitionId]); // ✅ refreshKey added

  // ─── Fetch Definition Details ─────────────────────────────────────────────
  useEffect(() => {
    if (!open || !definitionId || !businessId) return;

    const fetchDefinitionDetails = async () => {
      try {
        setLoading(true);
        setError("");
        const data = await getTaskDefinitionById(businessId, definitionId);
        setDefinition(data);
      } catch (err: unknown) {
        setError(
          err instanceof Error ? err.message : "Failed to load task definition",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchDefinitionDetails();
  }, [open, definitionId, businessId, refreshKey]);

  // ─── Clear state when drawer closes ──────────────────────────────────────
  useEffect(() => {
    if (!open) {
      setDefinition(null);
      setError("");
    }
  }, [open]);

  // ─── Enable / Disable Handler ─────────────────────────────────────────────
  const handleToggleActive = async () => {
    if (!definition || !definitionId || !businessId) return;
    setToggling(true);
    try {
      const updated = await updateTaskDefinition(businessId, definitionId, {
        isActive: !definition.isActive,
      });
      setDefinition(updated); // reflect change instantly in drawer
      onRefresh?.(); // refresh parent list if provided
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to update status");
    } finally {
      setToggling(false);
    }
  };

  // ─── Helpers ─────────────────────────────────────────────────────────────

  /* const Section = ({
    title,
    icon,
    children,
  }: {
    title: string;
    icon: React.ReactNode;
    children: React.ReactNode;
  }) => (
    <Box sx={{ mb: 3 }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
        {icon}
        <Typography
          variant="overline"
          sx={{
            fontWeight: 700,
            letterSpacing: "0.08em",
            color: "text.secondary",
          }}
        >
          {title}
        </Typography>
      </Box>
      {children}
    </Box>
  ); */

  const InfoRow = ({
    label,
    value,
    icon,
  }: {
    label: string;
    value: string | number | null | undefined;
    icon?: React.ReactNode;
  }) => (
    <Box sx={{ mb: 2, display: "flex", gap: 1.5, alignItems: "flex-start" }}>
      {/* ✅ optional icon per row — matches mobile app icon-per-field style */}
      {icon && (
        <Box sx={{ mt: 0.3, color: "#94a3b8", flexShrink: 0 }}>{icon}</Box>
      )}
      <Box>
        <Typography
          variant="caption"
          sx={{
            display: "block",
            mb: 0.3,
            color: "#64748b",
            fontWeight: 600,
          }}
        >
          {label}
        </Typography>
        <Typography
          variant="body2"
          sx={{
            fontWeight: 500,
            color: "#1e293b",
            fontSize: "0.9rem",
          }}
        >
          {value ?? "—"}
        </Typography>
      </Box>
    </Box>
  );

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "URGENT":
        return "#ef4444";
      case "HIGH":
        return "#f59e0b";
      case "MEDIUM":
        return "#3b82f6";
      case "LOW":
        return "#64748b";
      default:
        return "#64748b";
    }
  };

  // ─── Format schedule into human-readable string ───────────────────────────
  // Returns plain string only (no JSX) — used in InfoRow value
  const formatFrequencyLabel = (pattern: string): string => {
    switch (pattern) {
      case "monthly":
        return "Monthly";
      case "quarterly":
        return "Quarterly";
      case "half_yearly":
        return "Half-Yearly";
      case "yearly":
        return "Yearly";
      case "one_time":
        return "One Time";
      default:
        return pattern;
    }
  };

  const getMonthName = (monthNum: number): string => {
    const month = MONTHS.find((m) => m.value === monthNum);
    return month?.label || monthNum.toString();
  };

  // Returns a readable schedule detail string — e.g. "November 30th each year"
  const formatScheduleDetail = (def: TaskDefinition): string => {
    const { scheduleRule } = def;
    if (!scheduleRule) return "Not configured";

    const ordinal = (n: number) => {
      const s = ["th", "st", "nd", "rd"];
      const v = n % 100;
      return n + (s[(v - 20) % 10] || s[v] || s[0]);
    };

    switch (scheduleRule.pattern) {
      case "monthly":
        return `${ordinal(scheduleRule.monthly?.day ?? 0)} of each month`;

      case "quarterly": {
        const q = scheduleRule.quarterly;
        if (!q) return "Quarterly";
        return [
          `Q1: ${getMonthName(q.q1Month)} ${ordinal(q.q1Day)}`,
          `Q2: ${getMonthName(q.q2Month)} ${ordinal(q.q2Day)}`,
          `Q3: ${getMonthName(q.q3Month)} ${ordinal(q.q3Day)}`,
          `Q4: ${getMonthName(q.q4Month)} ${ordinal(q.q4Day)}`,
        ].join("  •  ");
      }

      case "half_yearly": {
        const h = scheduleRule.halfYearly;
        if (!h) return "Half-Yearly";
        return [
          `H1: ${getMonthName(h.firstHalf.month)} ${ordinal(h.firstHalf.day)}`,
          `H2: ${getMonthName(h.secondHalf.month)} ${ordinal(h.secondHalf.day)}`,
        ].join("  •  ");
      }

      case "yearly": {
        const y = scheduleRule.yearly;
        if (!y) return "Yearly";
        return `${getMonthName(y.month)} ${ordinal(y.day)} each year`;
      }

      case "one_time":
        if (scheduleRule.oneTime?.dueDate) {
          return new Date(scheduleRule.oneTime.dueDate).toLocaleDateString();
        }
        return "One Time";

      default:
        return scheduleRule.pattern;
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
          width: { xs: "100%", sm: 480 },
          borderRadius: 0,
          display: "flex",
          flexDirection: "column",
        },
      }}
    >
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <Box
        sx={{
          background: "linear-gradient(135deg, #1e3a5f 0%, #2563eb 100%)",
          color: "#fff",
          p: 3,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexShrink: 0,
        }}
      >
        <Box>
          <Typography
            variant="caption"
            sx={{
              color: "rgba(255,255,255,0.7)",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
            }}
          >
            Automatic Task & Reminder Setup
          </Typography>
          <Box
            sx={{ display: "flex", alignItems: "center", gap: 1.5, mt: 0.5 }}
          >
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              {definition?.name || "Loading..."}
            </Typography>
            {/* Status badge in header — matches mobile */}
            {definition && (
              <Chip
                label={definition.isActive ? "Active" : "Inactive"}
                size="small"
                sx={{
                  bgcolor: definition.isActive
                    ? "rgba(34,197,94,0.2)"
                    : "rgba(255,255,255,0.15)",
                  color: "#fff",
                  fontWeight: 600,
                  border: "1px solid rgba(255,255,255,0.3)",
                }}
              />
            )}
          </Box>
        </Box>

        <Box sx={{ display: "flex", gap: 1 }}>
          {definitionId && (
            <IconButton
              onClick={() => onEdit(definitionId)}
              sx={{
                color: "#fff",
                bgcolor: "rgba(255,255,255,0.15)",
                "&:hover": { bgcolor: "rgba(255,255,255,0.25)" },
              }}
            >
              <EditIcon fontSize="small" />
            </IconButton>
          )}
          <IconButton
            onClick={onClose}
            sx={{
              color: "#fff",
              bgcolor: "rgba(255,255,255,0.15)",
              "&:hover": { bgcolor: "rgba(255,255,255,0.25)" },
            }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>
      </Box>

      {/* ── Scrollable Content ─────────────────────────────────────────────── */}
      <Box sx={{ p: 3, overflowY: "auto", flex: 1, bgcolor: "#f8fafc" }}>
        {loading && (
          <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
            <CircularProgress />
          </Box>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {definition && !loading && (
          <Stack spacing={2.5}>
            {/* ── Main Info Card — matches mobile's top white card ────────── */}
            <Box
              sx={{
                bgcolor: "#fff",
                borderRadius: 2,
                border: "1px solid",
                borderColor: "divider",
                p: 2.5,
              }}
            >
              {/* Priority chip row */}
              <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mb: 2.5 }}>
                <Chip
                  label={definition.priority}
                  size="small"
                  sx={{
                    bgcolor: getPriorityColor(definition.priority),
                    color: "#fff",
                    fontWeight: 600,
                  }}
                />
                <Chip
                  label={definition.subjectType}
                  variant="outlined"
                  size="small"
                />
              </Box>

              <Divider sx={{ mb: 2.5 }} />

              {/* Category */}
              <InfoRow
                label="Category"
                value={definition.taskType}
                icon={<CategoryIcon fontSize="small" />}
              />

              {/* Task title pattern — ✅ was missing */}
              <InfoRow
                label="Task title pattern"
                value={definition.titleTemplate}
                icon={<AssignmentIcon fontSize="small" />}
              />

              {/* Frequency — ✅ was missing, shown separately from schedule */}
              <InfoRow
                label="Frequency"
                value={formatFrequencyLabel(definition.scheduleRule.pattern)}
                icon={<FrequencyIcon fontSize="small" />}
              />

              {/* Schedule detail — ✅ now human-readable like mobile */}
              <InfoRow
                label="Schedule"
                value={formatScheduleDetail(definition)}
                icon={<CalendarIcon fontSize="small" />}
              />

              {/* Auto-create Tasks — ✅ was missing as InfoRow */}
              <InfoRow
                label="Auto-create Tasks"
                value={definition.autoCreateTasks ? "Enabled" : "Disabled"}
                icon={<AutoTaskIcon fontSize="small" />}
              />

              {/* Auto-create Reminders — ✅ was missing as InfoRow */}
              <InfoRow
                label="Auto-create Reminders"
                value={definition.autoCreateReminders ? "Enabled" : "Disabled"}
                icon={<AutoReminderIcon fontSize="small" />}
              />

              {definition.description && (
                <InfoRow
                  label="Description"
                  value={definition.description}
                  icon={<AssignmentIcon fontSize="small" />}
                />
              )}

              {definition.targetOffsetDays !== undefined &&
                definition.targetOffsetDays !== 0 && (
                  <InfoRow
                    label="Target Offset Days"
                    value={`${definition.targetOffsetDays} days`}
                    icon={<CalendarIcon fontSize="small" />}
                  />
                )}
            </Box>

            {/* ── Reminders Summary Card — matches mobile exactly ─────────── */}

            <Box
              sx={{
                bgcolor: "#fff",
                borderRadius: 2,
                border: "1px solid",
                borderColor: "divider",
                p: 2.5,
              }}
            >
              <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 0.5 }}>
                Reminders
              </Typography>

              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                {loadingReminders
                  ? "Loading reminder rules..."
                  : `${reminderRules.length} reminder rule${
                      reminderRules.length !== 1 ? "s" : ""
                    } configured`}
              </Typography>

              {/* Only show link when rules exist */}
              {!loadingReminders && reminderRules.length > 0 && (
                <Typography
                  variant="body2"
                  onClick={() => setReminderRulesOpen(true)}
                  sx={{
                    color: "primary.main",
                    fontWeight: 600,
                    cursor: "pointer",
                    textDecoration: "underline",
                    textUnderlineOffset: 3,
                    "&:hover": { opacity: 0.8 },
                    display: "inline-block",
                    mt: 0.5,
                  }}
                >
                  View Reminder Rules
                </Typography>
              )}
            </Box>

            {/* ── Assign Employee Card — matches mobile "Coming soon" ────── */}
            <Box
              sx={{
                bgcolor: "background.paper",
                borderRadius: 2,
                border: "1px solid",
                borderColor: "divider",
                p: 2.5,
              }}
            >
              <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1 }}>
                Assign Employee
              </Typography>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  color: "text.disabled",
                }}
              >
                <Box
                  sx={{
                    width: 20,
                    height: 20,
                    borderRadius: "50%",
                    border: "1.5px solid",
                    borderColor: "text.disabled",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "1rem",
                    lineHeight: 1,
                    flexShrink: 0,
                  }}
                >
                  +
                </Box>
                <Typography variant="body2" color="text.disabled">
                  Assign Employee (Coming soon)
                </Typography>
              </Box>
            </Box>
          </Stack>
        )}
      </Box>
     <ReminderRulesListDrawer
  open={reminderRulesOpen}
  onClose={() => setReminderRulesOpen(false)}
  taskDefinitionId={definitionId}
  taskDefinitionName={definition?.name || ""}
  businessId={businessId}
  preloadedRules={reminderRules}   
  onEditRule={(ruleId: string) => {
    setReminderRulesOpen(false);
    console.log("Edit rule:", ruleId);
  }}
/>

      {/* ── Enable / Disable Button ── */}
      {definition && (
        <Box
          sx={{
            p: 2,
            bgcolor: "#fff",
            borderTop: "1px solid",
            borderColor: "divider",
            flexShrink: 0,
          }}
        >
          <Button
            fullWidth
            variant={definition.isActive ? "outlined" : "contained"}
            onClick={handleToggleActive}
            disabled={toggling}
            startIcon={
              toggling ? <CircularProgress size={16} color="inherit" /> : null
            }
            sx={{
              py: 1.5,
              borderRadius: 3,
              fontWeight: 700,
              fontSize: "1rem",
              textTransform: "none",
              ...(definition.isActive
                ? {
                    borderColor: "#ef4444",
                    color: "#ef4444",
                    "&:hover": { bgcolor: "#fef2f2", borderColor: "#dc2626" },
                  }
                : {
                    bgcolor: "#16a34a",
                    "&:hover": { bgcolor: "#15803d" },
                    "&:disabled": { bgcolor: "#86efac", color: "#fff" },
                  }),
            }}
          >
            {toggling
              ? definition.isActive
                ? "Disabling…"
                : "Enabling…"
              : definition.isActive
                ? "Disable"
                : "Enable"}
          </Button>
        </Box>
      )}
    </Drawer>
  );
}

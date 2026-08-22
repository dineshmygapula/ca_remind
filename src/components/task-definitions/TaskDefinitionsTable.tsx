"use client";

import { useState } from "react";
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
  Tooltip,
  Typography,
  Box,
  CircularProgress,
  Switch,
  FormControlLabel,
} from "@mui/material";
import {
  Visibility as ViewIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material";
import { TaskDefinitionListItem } from "../../types/taskDefinition.types";
import { updateTaskDefinition } from "@/services/taskDefinitionService";

interface TaskDefinitionsTableProps {
  definitions: TaskDefinitionListItem[];
  loading: boolean;
  businessId: string; // ✅ needed for API call
  onView: (definitionId: string) => void;
  onEdit: (definitionId: string) => void;
  onDelete: (definitionId: string, name: string) => void;
  onRefresh: () => void; // ✅ refresh list after toggle
}

export default function TaskDefinitionsTable({
  definitions,
  loading,
  businessId,
  onView,
  onEdit,
  onDelete,
  onRefresh,
}: TaskDefinitionsTableProps) {
  // ─── Toggle Loading State ─────────────────────────────────────────────────
  // Tracks which definition ID + field is currently being toggled
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [togglingField, setTogglingField] = useState<
    "autoCreateTasks" | "autoCreateReminders" | null
  >(null);

  // ─── Toggle Handler ───────────────────────────────────────────────────────
  const handleToggle = async (
    e: React.MouseEvent,
    def: TaskDefinitionListItem,
    field: "autoCreateTasks" | "autoCreateReminders",
  ) => {
    e.stopPropagation(); // prevent row click (view drawer)

    setTogglingId(def.id);
    setTogglingField(field);

    try {
      await updateTaskDefinition(businessId, def.id, {
        [field]: !def[field], // flip current value
      });
      onRefresh(); // re-fetch list to reflect updated value
    } catch (err) {
      console.error(`❌ Failed to toggle ${field}:`, err);
    } finally {
      setTogglingId(null);
      setTogglingField(null);
    }
  };

  const isToggling = (
    id: string,
    field: "autoCreateTasks" | "autoCreateReminders",
  ) => togglingId === id && togglingField === field;

  // ─── Loading State ────────────────────────────────────────────────────────
  if (loading) {
    return (
      <Paper sx={{ p: 8, textAlign: "center" }}>
        <CircularProgress />
        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          Loading task definitions...
        </Typography>
      </Paper>
    );
  }

  // ─── Empty State ──────────────────────────────────────────────────────────
  if (definitions.length === 0) {
    return (
      <Paper sx={{ p: 8, textAlign: "center" }}>
        <Typography variant="h6" color="text.secondary">
          No task definitions found
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Create your first task definition to get started
        </Typography>
      </Paper>
    );
  }

  // ─── Helpers ──────────────────────────────────────────────────────────────
  /* const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "URGENT":
        return "error";
      case "HIGH":
        return "warning";
      case "MEDIUM":
        return "info";
      case "LOW":
        return "default";
      default:
        return "default";
    } 
  };*/

  const formatSchedulePattern = (pattern: string) => {
    switch (pattern) {
      case "monthly":
        return "Monthly";
      case "quarterly":
        return "Quarterly";
      case "half_yearly":
      case "halfYearly":
        return "Half-Yearly";
      case "yearly":
        return "Yearly";
      case "one_time":
        return "One Time";
      default:
        return pattern;
    }
  };

  const getDaysUntilDue = (dueDate: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(dueDate);
    due.setHours(0, 0, 0, 0);
    const diffDays = Math.ceil(
      (due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
    );
    if (diffDays < 0) return `${Math.abs(diffDays)} days overdue`;
    if (diffDays === 0) return "Due today";
    if (diffDays === 1) return "Due tomorrow";
    return `in ${diffDays} days`;
  };

  // ─── Table ────────────────────────────────────────────────────────────────
  return (
    <TableContainer component={Paper} sx={{ overflowX: "auto" }}>
      <Table sx={{ minWidth: 750 }}>
        <TableHead>
          <TableRow
            sx={{
              backgroundColor: "#F8FAFC",
            }}
          >
            <TableCell
              sx={{
                fontWeight: 700,
                color: "#0b1f3a",
                fontSize: "0.8rem",
                textTransform: "uppercase",
                letterSpacing: "0.04em",
              }}
            >
              Task Name
            </TableCell>
            <TableCell sx={{ fontWeight: 600 }}>Task Type</TableCell>
            <TableCell sx={{ fontWeight: 600 }}>Schedule</TableCell>
            {/* <TableCell sx={{ fontWeight: 600 }}>Priority</TableCell> */}
            {/* ✅ Replaced Chip column with Switch column */}
            <TableCell sx={{ fontWeight: 600 }}>Auto Tasks</TableCell>
            <TableCell sx={{ fontWeight: 600 }}>Auto Reminders</TableCell>
            <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
            <TableCell sx={{ fontWeight: 600 }}>Next Due Date</TableCell>
            <TableCell align="right" sx={{ fontWeight: 600 }}>
              Actions
            </TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {definitions.map((def) => (
            <TableRow
              key={def.id}
              hover
              sx={{ cursor: "pointer", "&:hover": { bgcolor: "action.hover" } }}
              onClick={() => onView(def.id)}
            >
              {/* Task Name */}
              <TableCell>
                <Typography variant="body2" fontWeight={600}>
                  {def.name}
                </Typography>
              </TableCell>

              {/* Task Type */}
              <TableCell>
                <Typography variant="body2">{def.taskType}</Typography>
              </TableCell>

              {/* Schedule */}
              <TableCell>
                <Chip
                  label={formatSchedulePattern(def.schedulePattern)}
                  size="small"
                  sx={{
                    bgcolor: "#EFF6FF",
                    color: "#2563EB",
                    border: "1px solid #DBEAFE",

                    fontWeight: 600,
                    fontSize: "0.72rem",
                  }}
                />
              </TableCell>

              {/* Priority */}
              {/* <TableCell>
                <Chip
                  label={def.priority}
                  size="small"
                  sx={{
                    bgcolor:
                      def.priority === "URGENT"
                        ? "#FEF2F2"
                        : def.priority === "HIGH"
                          ? "#FFF7ED"
                          : def.priority === "MEDIUM"
                            ? "#EFF6FF"
                            : "#F8FAFC",

                    color:
                      def.priority === "URGENT"
                        ? "#DC2626"
                        : def.priority === "HIGH"
                          ? "#EA580C"
                          : def.priority === "MEDIUM"
                            ? "#2563EB"
                            : "#64748B",

                    border: "1px solid",
                    borderColor: "divider",

                    fontWeight: 600,
                    fontSize: "0.72rem",
                  }}
                />
              </TableCell>
 */}
              {/* ✅ Auto Create Tasks — Switch */}
              <TableCell onClick={(e) => e.stopPropagation()}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                  {isToggling(def.id, "autoCreateTasks") ? (
                    <CircularProgress size={18} />
                  ) : (
                    <FormControlLabel
                      control={
                        <Switch
                          size="small"
                          checked={!!def.autoCreateTasks}
                          onChange={(e) =>
                            handleToggle(
                              e as unknown as React.MouseEvent,
                              def,
                              "autoCreateTasks",
                            )
                          }
                          color="success"
                        />
                      }
                      label={
                        <Typography
                          variant="caption"
                          sx={{
                            color: def.autoCreateTasks
                              ? "success.main"
                              : "text.disabled",
                            fontWeight: 600,
                          }}
                        >
                          {def.autoCreateTasks ? "ON" : "OFF"}
                        </Typography>
                      }
                      sx={{ m: 0 }}
                    />
                  )}
                </Box>
              </TableCell>

              {/* ✅ Auto Create Reminders — Switch */}
              <TableCell onClick={(e) => e.stopPropagation()}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                  {isToggling(def.id, "autoCreateReminders") ? (
                    <CircularProgress size={18} />
                  ) : (
                    <FormControlLabel
                      control={
                        <Switch
                          size="small"
                          checked={!!def.autoCreateReminders}
                          onChange={(e) =>
                            handleToggle(
                              e as unknown as React.MouseEvent,
                              def,
                              "autoCreateReminders",
                            )
                          }
                          color="success"
                        />
                      }
                      label={
                        <Typography
                          variant="caption"
                          sx={{
                            color: def.autoCreateReminders
                              ? "success.main"
                              : "text.disabled",
                            fontWeight: 600,
                          }}
                        >
                          {def.autoCreateReminders ? "ON" : "OFF"}
                        </Typography>
                      }
                      sx={{ m: 0 }}
                    />
                  )}
                </Box>
              </TableCell>

              {/* Status */}
              <TableCell>
                <Chip
                  label={def.isActive ? "Active" : "Inactive"}
                  size="small"
                  sx={{
                    bgcolor: def.isActive ? "#E8F5E9" : "#F1F5F9",

                    color: def.isActive ? "#2E7D32" : "#64748B",

                    border: "1px solid",
                    borderColor: "divider",

                    fontWeight: 600,
                    fontSize: "0.72rem",
                  }}
                />
              </TableCell>

              {/* Next Due Date */}
              <TableCell>
                {def.dueDate ? (
                  <Box>
                    <Typography
                      variant="body2"
                      sx={{ fontFamily: "monospace", fontWeight: 600 }}
                    >
                      {new Date(def.dueDate).toLocaleDateString()}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {getDaysUntilDue(def.dueDate)}
                    </Typography>
                  </Box>
                ) : (
                  <Typography variant="body2" color="text.disabled">
                    Not scheduled
                  </Typography>
                )}
              </TableCell>

              {/* Actions */}
              <TableCell align="right" onClick={(e) => e.stopPropagation()}>
                <Tooltip title="View Details">
                  <IconButton
                    size="small"
                    onClick={() => onView(def.id)}
                    sx={{
                      color: "#5A6380",
                      "&:hover": {
                        color: "#1A1F36",
                        backgroundColor: "rgba(90,99,128,0.08)",
                      },
                    }}
                  >
                    <ViewIcon fontSize="small" />
                  </IconButton>
                </Tooltip>

                <Tooltip title="Edit Definition">
                  <IconButton
                    size="small"
                    onClick={() => onEdit(def.id)}
                    sx={{
                      color: "#5A6380",
                      "&:hover": {
                        color: "#1A1F36",
                        backgroundColor: "rgba(90,99,128,0.08)",
                      },
                    }}
                  >
                    <EditIcon fontSize="small" />
                  </IconButton>
                </Tooltip>

                <Tooltip title="Delete Definition">
                  <IconButton
                    size="small"
                    onClick={() => onDelete(def.id, def.name)}
                    sx={{
                      color: "#5A6380",
                      "&:hover": {
                        color: "#C0392B",
                        backgroundColor: "rgba(192,57,43,0.08)",
                      },
                    }}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

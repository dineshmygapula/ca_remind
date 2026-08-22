"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Stack,
  Switch,
  FormControlLabel,
  Divider,
  TextField,
  MenuItem,
  Radio,
  RadioGroup,
  FormControl,
  IconButton,
  Chip,
} from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  InfoOutlined as InfoOutlinedIcon,
} from "@mui/icons-material";
import { ComplianceService } from "@/types/subject";
import { COMPLIANCE_FREQUENCIES } from "@/constants/clientConstants";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ComplianceSettingsDialogProps {
  open: boolean;
  onClose: () => void;
  /** e.g. "GST Compliance", "TDS Compliance" */
  label: string;
  /** e.g. "GST", "TDS" */
  serviceKey: string;
  /** client / subject display name — shown in title like mobile "GST – Sumathi Real Esta..." */
  clientName: string;
  /** current value from parent form */
  value: ComplianceService;
  /** called with the full updated ComplianceService when user taps Save */
  onSave: (updated: ComplianceService) => void;
  /** per-service metadata: standard due date description shown in the system-default radio label */
  systemDueDateDescription?: string;
}

// ─── Shared field sx ─────────────────────────────────────────────────────────

const fieldSx = {
  "& .MuiOutlinedInput-root": { borderRadius: "8px" },
  "& .MuiOutlinedInput-notchedOutline legend": { display: "none" },
  "& .MuiOutlinedInput-notchedOutline": { top: 0 },
} as const;

// ─── StaticLabel ─────────────────────────────────────────────────────────────

function StaticLabel({ label, required }: { label: string; required?: boolean }) {
  return (
    <Typography
      variant="body2"
      sx={{ fontWeight: 600, color: "text.primary", mb: 0.5, display: "block" }}
    >
      {label}
      {required && (
        <Typography component="span" sx={{ color: "error.main", ml: 0.4 }}>
          *
        </Typography>
      )}
    </Typography>
  );
}

// ─── Section Card ─────────────────────────────────────────────────────────────

function SectionCard({ children }: { children: React.ReactNode }) {
  return (
    <Box
      sx={{
        bgcolor: "background.paper",
        borderRadius: 2,
        border: "1px solid",
        borderColor: "divider",
        p: 2,
        mb: 2,
      }}
    >
      {children}
    </Box>
  );
}

// ─── Frequency toggle buttons (matches mobile pill-button style) ──────────────

const FREQ_OPTIONS: { label: string; value: string }[] = [
  { label: "Monthly",   value: "MONTHLY"   },
  { label: "Quarterly", value: "QUARTERLY" },
  { label: "Annually",  value: "ANNUALLY"  },
  { label: "Half-yearly", value: "HALF_YEARLY" },
];

// ─── Main Component ───────────────────────────────────────────────────────────

export default function ComplianceSettingsDialog({
  open,
  onClose,
  label,
  serviceKey,
  clientName,
  value,
  onSave,
  systemDueDateDescription,
}: ComplianceSettingsDialogProps) {
  // ── Local draft state — only committed to parent on "Save" ──────────────────
  const [draft, setDraft] = useState<ComplianceService>({ ...value });

  // "useOverride" tracks the radio selection:
  //   false = "Use system default due dates"
  //   true  = "Override due dates for this client"
  const [useOverride, setUseOverride] = useState<boolean>(
    !!value.customDueDay,
  );

  // Reset draft every time dialog opens with fresh value
  useEffect(() => {
    if (open) {
      setDraft({ ...value });
      setUseOverride(!!value.customDueDay);
    }
  }, [open, value]);

  // ── Local helpers ───────────────────────────────────────────────────────────

  const setField = <K extends keyof ComplianceService>(
    field: K,
    val: ComplianceService[K],
  ) => setDraft((d) => ({ ...d, [field]: val }));

  const handleFrequencySelect = (freq: string) => setField("frequency", freq);

  const handleDueDateModeChange = (override: boolean) => {
    setUseOverride(override);
    if (!override) {
      // Clear custom overrides when switching back to system default
      setDraft((d) => ({
        ...d,
        customDueDay: undefined,
        customDueMonth: undefined,
      }));
    }
  };

  const handleSave = () => {
    const toSave: ComplianceService = {
      ...draft,
      // If user chose system default, ensure customDueDay is cleared
      customDueDay:   useOverride ? draft.customDueDay   : undefined,
      customDueMonth: useOverride ? draft.customDueMonth : undefined,
    };
    onSave(toSave);
    onClose();
  };

  const handleCancel = () => {
    // Discard draft — reset on next open via useEffect
    onClose();
  };

  // ── Derived ─────────────────────────────────────────────────────────────────

  // Truncate client name to match mobile "GST – Sumathi Real Esta..."
  const truncatedName =
    clientName.length > 18 ? clientName.slice(0, 18) + "…" : clientName;

  const defaultDueDateDesc =
    systemDueDateDescription ??
    `Standard ${serviceKey} due date: 20th of every month`;

  // Which frequency buttons to show — some services are annual only
  const freqOptions =
    serviceKey === "ITR" || serviceKey === "ROC"
      ? FREQ_OPTIONS.filter((f) =>
          ["ANNUALLY", "HALF_YEARLY"].includes(f.value),
        )
      : serviceKey === "TDS"
      ? FREQ_OPTIONS.filter((f) =>
          ["MONTHLY", "QUARTERLY"].includes(f.value),
        )
      : FREQ_OPTIONS.filter((f) =>
          ["MONTHLY", "QUARTERLY"].includes(f.value),
        );

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <Dialog
      open={open}
      onClose={handleCancel}
      maxWidth="sm"
      fullWidth
      // Render on top of the parent Edit Client dialog
      sx={{ zIndex: (theme) => theme.zIndex.modal + 10 }}
      PaperProps={{ sx: { maxHeight: "90vh", m: { xs: 1, sm: 2 } } }}
    >
      {/* ── Header — matches mobile back-arrow + title style ── */}
      <DialogTitle
        sx={{
          px: 2,
          py: 1.5,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: "1px solid",
          borderColor: "divider",
          bgcolor: "background.paper",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <IconButton
            size="small"
            onClick={handleCancel}
            sx={{ color: "text.primary" }}
          >
            <ArrowBackIcon fontSize="small" />
          </IconButton>
          <Typography variant="subtitle1" fontWeight={700} noWrap>
            {serviceKey} – {truncatedName}
          </Typography>
        </Box>
        <IconButton size="small" sx={{ color: "text.secondary" }}>
          <InfoOutlinedIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      {/* ── Content ── */}
      <DialogContent sx={{ p: 2, bgcolor: "background.default" }}>
        <Stack spacing={0}>

          {/* ── Section 1: Enable toggle ── */}
          <SectionCard>
            <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1.5 }}>
              {label}
            </Typography>
            <FormControlLabel
              control={
                <Switch
                  checked={draft.enabled}
                  onChange={(e) => setField("enabled", e.target.checked)}
                  sx={{
                    "& .MuiSwitch-switchBase.Mui-checked": {
                      color: "#0d9488",
                    },
                    "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
                      bgcolor: "#0d9488",
                    },
                  }}
                />
              }
              label={
                <Typography variant="body1" fontWeight={500}>
                  Enable {label}
                </Typography>
              }
              labelPlacement="start"
              sx={{
                mx: 0,
                width: "100%",
                justifyContent: "space-between",
              }}
            />

            {/* Filing Frequency — only shown when enabled, matches mobile pill style */}
            {draft.enabled && (
              <>
                <Divider sx={{ my: 2 }} />
                <Typography variant="body1" fontWeight={600} sx={{ mb: 1.5 }}>
                  Filing Frequency
                </Typography>
                {/* Pill-style toggle buttons matching mobile screenshot */}
                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                  {freqOptions.map((opt) => {
                    const selected = draft.frequency === opt.value;
                    return (
                      <Box
                        key={opt.value}
                        onClick={() => handleFrequencySelect(opt.value)}
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 0.75,
                          px: 2,
                          py: 0.875,
                          border: "1.5px solid",
                          borderColor: selected ? "primary.main" : "divider",
                          borderRadius: "999px",
                          cursor: "pointer",
                          bgcolor: selected ? "primary.50" : "background.paper",
                          transition: "all 0.15s",
                          "&:hover": {
                            borderColor: "primary.main",
                            bgcolor: "primary.50",
                          },
                        }}
                      >
                        {selected && (
                          <Box
                            component="span"
                            sx={{
                              color: "primary.main",
                              fontSize: 14,
                              fontWeight: 700,
                              lineHeight: 1,
                            }}
                          >
                            ✓
                          </Box>
                        )}
                        <Typography
                          variant="body2"
                          fontWeight={selected ? 700 : 400}
                          sx={{
                            color: selected ? "primary.main" : "text.primary",
                          }}
                        >
                          {opt.label}
                        </Typography>
                      </Box>
                    );
                  })}
                </Stack>

                {/* Helper text below frequency pills */}
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ display: "block", mt: 1.5 }}
                >
                  {serviceKey === "GST"
                    ? "GST can be filed monthly or quarterly based on turnover."
                    : serviceKey === "TDS"
                    ? "TDS returns are filed monthly or quarterly."
                    : serviceKey === "ITR"
                    ? "Income Tax Returns are filed annually."
                    : serviceKey === "ROC"
                    ? "ROC filings are typically annual or half-yearly."
                    : `${serviceKey} filing frequency.`}
                </Typography>
              </>
            )}
          </SectionCard>

          {/* ── Section 2: Due Date Settings — only shown when enabled ── */}
          {draft.enabled && (
            <SectionCard>
              <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 0.5 }}>
                Due Date Settings
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Override system due dates only if this client follows a
                different cycle.
              </Typography>

              <FormControl component="div" fullWidth>
                <RadioGroup
                  value={useOverride ? "override" : "system"}
                  onChange={(e) =>
                    handleDueDateModeChange(e.target.value === "override")
                  }
                >
                  {/* Option A — System default */}
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 1,
                      py: 1.5,
                      borderBottom: "1px solid",
                      borderColor: "divider",
                    }}
                  >
                    <Radio
                      value="system"
                      size="small"
                      sx={{
                        mt: 0.25,
                        color: "primary.main",
                        "&.Mui-checked": { color: "primary.main" },
                      }}
                    />
                    <Box>
                      <Typography variant="body1" fontWeight={500}>
                        Use system default due dates
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {defaultDueDateDesc}
                      </Typography>
                    </Box>
                  </Box>

                  {/* Option B — Override */}
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 1,
                      pt: 1.5,
                    }}
                  >
                    <Radio
                      value="override"
                      size="small"
                      sx={{
                        mt: 0.25,
                        color: "primary.main",
                        "&.Mui-checked": { color: "primary.main" },
                      }}
                    />
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="body1" fontWeight={500}>
                        Override due dates for this client
                      </Typography>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mb: useOverride ? 1.5 : 0 }}
                      >
                        Set a custom due day specific to this client.
                      </Typography>

                      {/* Override fields — only shown when override is selected */}
                      {useOverride && (
                        <Stack spacing={1.5} sx={{ mt: 1 }}>
                          <Box>
                            <StaticLabel label="Custom Due Day (1–31)" required />
                            <TextField
                              fullWidth
                              size="small"
                              type="number"
                              value={draft.customDueDay ?? ""}
                              onChange={(e) => {
                                const v = parseInt(e.target.value, 10);
                                setField(
                                  "customDueDay",
                                  isNaN(v) ? undefined : Math.min(31, Math.max(1, v)),
                                );
                              }}
                              placeholder="e.g. 15"
                              inputProps={{ min: 1, max: 31 }}
                              sx={fieldSx}
                              helperText="Day of the month when this client's filing is due"
                            />
                          </Box>

                          {/* customDueMonth — relevant for annual filings like ITR/ROC */}
                          {(serviceKey === "ITR" || serviceKey === "ROC") && (
                            <Box>
                              <StaticLabel label="Custom Due Month" />
                              <TextField
                                select
                                fullWidth
                                size="small"
                                value={draft.customDueMonth ?? ""}
                                onChange={(e) =>
                                  setField("customDueMonth", e.target.value)
                                }
                                sx={fieldSx}
                                helperText="Month when this client's annual filing is due"
                              >
                                {[
                                  "JANUARY","FEBRUARY","MARCH","APRIL","MAY","JUNE",
                                  "JULY","AUGUST","SEPTEMBER","OCTOBER","NOVEMBER","DECEMBER",
                                ].map((m) => (
                                  <MenuItem key={m} value={m}>
                                    {m.charAt(0) + m.slice(1).toLowerCase()}
                                  </MenuItem>
                                ))}
                              </TextField>
                            </Box>
                          )}
                        </Stack>
                      )}
                    </Box>
                  </Box>
                </RadioGroup>
              </FormControl>
            </SectionCard>
          )}

          {/* ── Section 3: Internal Target Date — only shown when enabled ── */}
          {draft.enabled && (
            <SectionCard>
              <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 0.5 }}>
                Internal Target Date
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Set how many days before the due date your team should
                complete this filing internally.
              </Typography>

              <StaticLabel label="Internal target offset (days)" required />
              <TextField
                fullWidth
                size="small"
                type="number"
                value={draft.internalTargetOffsetDays ?? ""}
                onChange={(e) => {
                  const v = parseInt(e.target.value, 10);
                  setField(
                    "internalTargetOffsetDays",
                    isNaN(v) ? undefined : Math.max(0, v),
                  );
                }}
                placeholder="e.g. 5"
                inputProps={{ min: 0 }}
                sx={fieldSx}
                helperText={
                  draft.internalTargetOffsetDays
                    ? `Tasks will be targeted ${draft.internalTargetOffsetDays} day${
                        draft.internalTargetOffsetDays === 1 ? "" : "s"
                      } before the due date`
                    : "0 means same day as due date"
                }
              />

              {/* Live preview chip */}
              {draft.internalTargetOffsetDays !== undefined &&
                draft.internalTargetOffsetDays > 0 && (
                  <Box sx={{ mt: 1.5 }}>
                    <Chip
                      label={`Internal target: ${draft.internalTargetOffsetDays} day${
                        draft.internalTargetOffsetDays === 1 ? "" : "s"
                      } before due date`}
                      size="small"
                      color="info"
                      variant="outlined"
                      sx={{ fontSize: 11 }}
                    />
                  </Box>
                )}
            </SectionCard>
          )}

        </Stack>
      </DialogContent>

      {/* ── Footer — matches mobile Cancel / Save buttons ── */}
      <DialogActions
        sx={{
          px: 2,
          py: 1.5,
          gap: 1.5,
          bgcolor: "background.paper",
          borderTop: "1px solid",
          borderColor: "divider",
        }}
      >
        <Button
          variant="outlined"
          onClick={handleCancel}
          sx={{
            flex: 1,
            fontWeight: 600,
            borderRadius: 2,
            py: 1.2,
            textTransform: "none",
            color: "text.secondary",
            borderColor: "divider",
          }}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleSave}
          sx={{
            flex: 2,
            fontWeight: 700,
            borderRadius: 2,
            py: 1.2,
            textTransform: "none",
            bgcolor: "#16a34a",
            "&:hover": { bgcolor: "#15803d" },
          }}
        >
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
}

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
  Grid,
  Typography,
  Box,
  Chip,
  Stack,
  CircularProgress,
  IconButton,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Alert,
  FormControlLabel,
  Switch,
  Divider,
} from "@mui/material";
import {
  Close as CloseIcon,
  Edit as EditIcon,
  ExpandMore as ExpandMoreIcon,
  Add as AddIcon,
  DeleteOutline as DeleteOutlineIcon,
  ChevronRight as ChevronRightIcon,
} from "@mui/icons-material";
import { getSubjectById, updateSubject } from "@/services/subjectService";
import {
  INDIAN_STATES,
  CONSTITUTIONS,
  INDUSTRIES,
  BUSINESS_NATURES,
  CONTACT_ROLES,
  ADDRESS_TYPES,
  NOTIFICATION_CHANNELS,
  TIMEZONES,
  LANGUAGES,
  DEFAULT_GSTIN,
  DEFAULT_CONTACT,
  DEFAULT_ADDRESS,
} from "@/constants/clientConstants";
import {
  Subject,
  UpdateSubjectDto,
  FormData,
  GstinEntry,
  ContactEntry,
  AddressEntry,
  ComplianceService,
} from "@/types/subject";
import ComplianceDialog from "./ComplianceDialog";

// ─── Types ────────────────────────────────────────────────────────────────────

interface EditClientDialogProps {
  open: boolean;
  onClose: () => void;
  clientId: string | null;
  businessId: string;
  onSuccess?: () => void;
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

// ─── SectionBox ──────────────────────────────────────────────────────────────

function SectionBox({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Box
      sx={{
        bgcolor: "background.paper",
        borderRadius: 2,
        border: "1px solid",
        borderColor: "divider",
        p: 2.5,
      }}
    >
      <Typography
        variant="overline"
        sx={{
          fontWeight: 700,
          color: "text.secondary",
          letterSpacing: "0.08em",
          display: "block",
          mb: 2,
        }}
      >
        {title}
      </Typography>
      {children}
    </Box>
  );
}

// ─── OptionalAccordion ───────────────────────────────────────────────────────

function OptionalAccordion({
  title,
  children,
  onChange,
}: {
  title: string;
  children: React.ReactNode;
  onChange?: (_: React.SyntheticEvent, expanded: boolean) => void;
}) {
  return (
    <Accordion
      onChange={onChange}
      sx={{
        borderRadius: "12px !important",
        border: "1px solid",
        borderColor: "divider",
        "&:before": { display: "none" },
      }}
    >
      <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ px: 2.5, py: 1 }}>
        <Typography
          variant="overline"
          sx={{ fontWeight: 700, color: "text.secondary", letterSpacing: "0.08em" }}
        >
          {title}
        </Typography>
      </AccordionSummary>
      <AccordionDetails sx={{ px: 2.5, pt: 0, pb: 2.5 }}>
        {children}
      </AccordionDetails>
    </Accordion>
  );
}

// ─── EntryBox ────────────────────────────────────────────────────────────────

function EntryBox({
  label,
  children,
  onRemove,
  showRemove = true,
}: {
  label: string;
  children: React.ReactNode;
  onRemove?: () => void;
  showRemove?: boolean;
}) {
  return (
    <Box
      sx={{
        p: 1.5,
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 2,
        bgcolor: "background.default",
      }}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 1,
        }}
      >
        <Typography variant="caption" fontWeight={600} color="text.secondary">
          {label}
        </Typography>
        {showRemove && onRemove && (
          <IconButton size="small" color="error" onClick={onRemove}>
            <DeleteOutlineIcon fontSize="small" />
          </IconButton>
        )}
      </Box>
      {children}
    </Box>
  );
}

// ─── ComplianceNavRow ─────────────────────────────────────────────────────────
// Matches mobile: tappable list row with › chevron that opens ComplianceSettingsDialog

function ComplianceNavRow({
  label,
  subtitle,
  value,
  onOpen,
}: {
  label: string;
  subtitle: string;
  value: ComplianceService;
  onOpen: () => void;
}) {
  return (
    <Box
      onClick={onOpen}
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        px: 2,
        py: 1.75,
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 2,
        cursor: "pointer",
        bgcolor: "background.paper",
        transition: "background 0.15s",
        "&:hover": { bgcolor: "action.hover" },
      }}
    >
      {/* Left: title + subtitle */}
      <Box>
        <Typography variant="body2" fontWeight={700}>
          {label}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {subtitle}
        </Typography>
      </Box>

      {/* Right: enabled/disabled chip + frequency chip + chevron */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        {value.enabled ? (
          <Chip
            label="Enabled"
            size="small"
            color="success"
            variant="outlined"
            sx={{ height: 20, fontSize: 10, fontWeight: 700 }}
          />
        ) : (
          <Chip
            label="Disabled"
            size="small"
            variant="outlined"
            sx={{
              height: 20,
              fontSize: 10,
              fontWeight: 700,
              color: "text.disabled",
              borderColor: "divider",
            }}
          />
        )}
        {value.enabled && value.frequency && (
          <Chip
            label={value.frequency}
            size="small"
            color="primary"
            variant="outlined"
            sx={{ height: 20, fontSize: 10, fontWeight: 700 }}
          />
        )}
        <ChevronRightIcon fontSize="small" sx={{ color: "text.secondary" }} />
      </Box>
    </Box>
  );
}

// ─── DEFAULT FORM ────────────────────────────────────────────────────────────

const DEFAULT_EDIT_FORM: FormData = {
  fullName: "",
  phone: "",
  email: "",
  companyName: "",
  constitution: "",
  industry: "",
  businessNature: [],
  pan: "",
  tan: "",
  cin: "",
  udyam: "",
  iec: "",
  gstins: [],
  contacts: [],
  addresses: [],
  notifChannels: [],
  notifLanguage: "en",
  notifTimezone: "Asia/Kolkata",
  quietHoursEnabled: false,
  quietHoursStart: "",
  quietHoursEnd: "",
  complianceGst: { enabled: false },
  complianceTds: { enabled: false },
  complianceItr: { enabled: false },
  complianceRoc: { enabled: false },
  complianceMsme: { enabled: false },
  tags: [],
  tagInput: "",
  notes: "",
  assignedTeam: {
    primaryAssigneeId: "",
    primaryAssigneeName: "",
  },
  isActive: true,
};

// ─── Main Component ───────────────────────────────────────────────────────────

export default function EditClientDialog({
  open,
  onClose,
  clientId,
  businessId,
  onSuccess,
}: EditClientDialogProps) {
  const [form, setForm] = useState<FormData>(DEFAULT_EDIT_FORM);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [error, setError] = useState("");

  // ─── Compliance drill-down dialog state ────────────────────────────────────
  type ComplianceKey = "complianceGst" | "complianceTds" | "complianceItr" | "complianceRoc" | "complianceMsme";
  const [complianceDialog, setComplianceDialog] = useState<{
    open: boolean;
    key: ComplianceKey;
    label: string;
    serviceKey: string;
    systemDueDateDescription: string;
  } | null>(null);

  const COMPLIANCE_ROWS: {
    key: ComplianceKey;
    label: string;
    serviceKey: string;
    subtitle: string;
    systemDueDateDescription: string;
  }[] = [
    {
      key: "complianceGst",
      label: "GST Compliance",
      serviceKey: "GST",
      subtitle: "Enable GST and set filing frequency",
      systemDueDateDescription: "Standard GST due date: 20th of every month",
    },
    {
      key: "complianceTds",
      label: "TDS Compliance",
      serviceKey: "TDS",
      subtitle: "Enable TDS and set filing frequency",
      systemDueDateDescription: "Standard TDS due date: 7th of every month",
    },
    {
      key: "complianceItr",
      label: "ITR Compliance",
      serviceKey: "ITR",
      subtitle: "Enable ITR and set filing frequency",
      systemDueDateDescription: "Standard ITR due date: 31st July every year",
    },
    {
      key: "complianceRoc",
      label: "ROC Compliance",
      serviceKey: "ROC",
      subtitle: "Enable ROC and set filing frequency",
      systemDueDateDescription: "Standard ROC due date: 30th October every year",
    },
    {
      key: "complianceMsme",
      label: "MSME Compliance",
      serviceKey: "MSME",
      subtitle: "Enable MSME and set filing frequency",
      systemDueDateDescription: "Standard MSME return: half-yearly",
    },
  ];

  // ─── Helpers ───────────────────────────────────────────────────────────────

  const set = <K extends keyof FormData>(field: K, value: FormData[K]) =>
    setForm((f) => ({ ...f, [field]: value }));

  const toggleBusinessNature = (nature: string) =>
    setForm((f) => ({
      ...f,
      businessNature: f.businessNature.includes(nature)
        ? f.businessNature.filter((n) => n !== nature)
        : [...f.businessNature, nature],
    }));

  const toggleNotifChannel = (channel: string) =>
    setForm((f) => ({
      ...f,
      notifChannels: f.notifChannels.includes(channel)
        ? f.notifChannels.filter((c) => c !== channel)
        : [...f.notifChannels, channel],
    }));

  const setCompliance = (
    service: "complianceGst" | "complianceTds" | "complianceItr" | "complianceRoc" | "complianceMsme",
    field: keyof ComplianceService,
    value: boolean | string,
  ) => setForm((f) => ({ ...f, [service]: { ...f[service], [field]: value } }));

  // GSTIN
  const addGstin = () =>
    setForm((f) => ({ ...f, gstins: [...f.gstins, { ...DEFAULT_GSTIN }] }));
  const removeGstin = (i: number) =>
    setForm((f) => ({ ...f, gstins: f.gstins.filter((_, idx) => idx !== i) }));
  const updateGstin = (i: number, field: keyof GstinEntry, value: string) =>
    setForm((f) => ({
      ...f,
      gstins: f.gstins.map((g, idx) => (idx === i ? { ...g, [field]: value } : g)),
    }));

  // Contacts
  const addContact = () =>
    setForm((f) => ({ ...f, contacts: [...f.contacts, { ...DEFAULT_CONTACT }] }));
  const removeContact = (i: number) =>
    setForm((f) => ({ ...f, contacts: f.contacts.filter((_, idx) => idx !== i) }));
  const updateContact = (i: number, field: keyof ContactEntry, value: string | boolean) =>
    setForm((f) => ({
      ...f,
      contacts: f.contacts.map((c, idx) => (idx === i ? { ...c, [field]: value } : c)),
    }));

  // Addresses
  const addAddress = () =>
    setForm((f) => ({ ...f, addresses: [...f.addresses, { ...DEFAULT_ADDRESS }] }));
  const removeAddress = (i: number) =>
    setForm((f) => ({ ...f, addresses: f.addresses.filter((_, idx) => idx !== i) }));
  const updateAddress = (i: number, field: keyof AddressEntry | "locality", value: string) =>
    setForm((f) => ({
      ...f,
      addresses: f.addresses.map((a, idx) =>
        idx === i ? { ...a, [field]: value } : a,
      ),
    }));

  // Tags
  const addTag = () => {
    const tag = form.tagInput.trim();
    if (tag && !form.tags.includes(tag))
      setForm((f) => ({ ...f, tags: [...f.tags, tag], tagInput: "" }));
  };
  const removeTag = (tag: string) =>
    setForm((f) => ({ ...f, tags: f.tags.filter((t) => t !== tag) }));

  // ─── Fetch ─────────────────────────────────────────────────────────────────

  const fetchClientData = useCallback(async () => {
    if (!clientId || !businessId) return;
    try {
      setFetching(true);
      setError("");
      const client: Subject = await getSubjectById(businessId, clientId);

      setForm({
        fullName: client.profile?.displayName || "",
        phone: client.primaryContact?.phone || "",
        email: client.primaryContact?.email || "",
        companyName: client.profile?.businessName || "",
        constitution: client.profile?.constitution || "",
        industry: client.profile?.industry || "",
        businessNature: client.profile?.businessNature || [],

        pan: client.identifiers?.pan || "",
        tan: client.identifiers?.tan || "",
        cin: client.identifiers?.cin || "",
        udyam: client.identifiers?.udyam || "",
        iec: client.identifiers?.iec || "",

        gstins: (client.gst?.gstins || []).map((g) => ({
          gstin: g.gstin,
          state: g.state,
          registrationType: g.registrationType,
          status: g.status === "CANCELLED" ? "INACTIVE" : g.status,
        })),

        contacts: client.contacts || [],
        addresses: client.addresses || [],

        notifChannels: client.notificationPreferences?.defaultChannels || [],
        notifLanguage: client.notificationPreferences?.language || "en",
        notifTimezone: client.notificationPreferences?.timezone || "Asia/Kolkata",
        quietHoursEnabled: client.notificationPreferences?.quietHours?.enabled || false,
        quietHoursStart: client.notificationPreferences?.quietHours?.start || "",
        quietHoursEnd: client.notificationPreferences?.quietHours?.end || "",

        complianceGst:  client.metadata?.complianceProfile?.gst  || { enabled: false },
        complianceTds:  client.metadata?.complianceProfile?.tds  || { enabled: false },
        complianceItr:  client.metadata?.complianceProfile?.itr  || { enabled: false },
        complianceRoc:  client.metadata?.complianceProfile?.roc  || { enabled: false },
        complianceMsme: client.metadata?.complianceProfile?.msme || { enabled: false },

        tags: client.metadata?.tags || [],
        tagInput: "",
        notes: client.notes?.[0]?.text || "",

        assignedTeam: {
          primaryAssigneeId: client.assignedTeam?.primaryAssignee?.userId || "",
          primaryAssigneeName: client.assignedTeam?.primaryAssignee?.name || "",
        },
        isActive: client.isActive,
      });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load client");
    } finally {
      setFetching(false);
    }
  }, [clientId, businessId]);

  useEffect(() => {
    if (open) fetchClientData();
  }, [open, fetchClientData]);

  // ─── Submit ────────────────────────────────────────────────────────────────

  const handleSubmit = async () => {
    if (!clientId) return;
    try {
      setLoading(true);
      setError("");

      const payload: UpdateSubjectDto = {
        profile: {
          displayName: form.fullName,
          legalName: form.companyName || form.fullName,
          businessName: form.companyName,
          constitution: form.constitution,
          industry: form.industry,
          businessNature: form.businessNature,
        },
        identifiers: {
          pan: form.pan || undefined,
          tan: form.tan || undefined,
          cin: form.cin || undefined,
          udyam: form.udyam || undefined,
          iec: form.iec || undefined,
        },
        gst: {
          gstins: form.gstins.map((g) => ({
            gstin: g.gstin,
            state: g.state,
            registrationType: g.registrationType,
            status: g.status,
          })),
        },
        primaryContact: {
          name: form.fullName,
          phone: form.phone,
          email: form.email,
        },
        contacts: form.contacts,
        addresses: form.addresses,
        notificationPreferences: {
          defaultChannels: form.notifChannels,
          language: form.notifLanguage,
          timezone: form.notifTimezone,
          quietHours: {
            enabled: form.quietHoursEnabled,
            start: form.quietHoursStart,
            end: form.quietHoursEnd,
          },
        },
        assignedTeam: form.assignedTeam?.primaryAssigneeId
          ? {
              primaryAssignee: {
                userId: form.assignedTeam.primaryAssigneeId,
                name: form.assignedTeam.primaryAssigneeName ?? "",
              },
            }
          : undefined,
        metadata: {
          complianceProfile: {
            gst:  form.complianceGst,
            tds:  form.complianceTds,
            itr:  form.complianceItr,
            roc:  form.complianceRoc,
            msme: form.complianceMsme,
          },
          dueDateOverrides: [],
          tags: form.tags,
        },
        notes: form.notes.trim() ? [{ text: form.notes.trim() }] : [],
        isActive: form.isActive,
      };

      await updateSubject(businessId, clientId, payload);
      onSuccess?.();
      handleClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Update failed");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setError("");
      onClose();
    }
  };

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{ sx: { maxHeight: "90vh" } }}
    >
      {/* ── Header ── */}
      <DialogTitle
        sx={{
          background: "linear-gradient(135deg, #1e3a5f 0%, #2563eb 100%)",
          color: "#fff",
          px: 3,
          py: 2.5,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <EditIcon sx={{ fontSize: 22 }} />
          <Box>
            <Typography
              variant="caption"
              sx={{
                color: "rgba(255,255,255,0.65)",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                display: "block",
                lineHeight: 1,
              }}
            >
              Edit Client
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.3 }}>
              Update Details
            </Typography>
          </Box>
        </Box>
        <IconButton
          onClick={handleClose}
          disabled={loading}
          size="small"
          sx={{
            color: "#fff",
            bgcolor: "rgba(255,255,255,0.15)",
            "&:hover": { bgcolor: "rgba(255,255,255,0.25)" },
          }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      {/* ── Content ── */}
      <DialogContent sx={{ p: 2.5, bgcolor: "background.default" }}>
        {fetching ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Stack spacing={2}>
            {error && (
              <Alert severity="error" onClose={() => setError("")}>
                {error}
              </Alert>
            )}

            {/* ── 1. Basic Info ── */}
            <SectionBox title="Basic Info">
              <Grid container spacing={2}>
                <Grid size={{ xs: 12 }}>
                  <StaticLabel label="Display Name" required />
                  <TextField
                    fullWidth
                    size="small"
                    value={form.fullName}
                    onChange={(e) => set("fullName", e.target.value)}
                    placeholder="Rama Rao"
                    sx={fieldSx}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <StaticLabel label="Phone" required />
                  <TextField
                    fullWidth
                    size="small"
                    value={form.phone}
                    onChange={(e) => set("phone", e.target.value.replace(/\D/g, ""))}
                    placeholder="9876543210"
                    inputProps={{ inputMode: "numeric" }}
                    sx={fieldSx}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <StaticLabel label="Email" required />
                  <TextField
                    fullWidth
                    size="small"
                    type="email"
                    value={form.email}
                    onChange={(e) => set("email", e.target.value)}
                    placeholder="client@example.com"
                    sx={fieldSx}
                  />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <StaticLabel label="Business Name" />
                  <TextField
                    fullWidth
                    size="small"
                    value={form.companyName}
                    onChange={(e) => set("companyName", e.target.value)}
                    placeholder="Rama Traders"
                    sx={fieldSx}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <StaticLabel label="Constitution" />
                  <TextField
                    select
                    fullWidth
                    size="small"
                    value={form.constitution}
                    onChange={(e) => set("constitution", e.target.value)}
                    sx={fieldSx}
                  >
                    <MenuItem value="">
                      <Typography color="text.disabled">Select…</Typography>
                    </MenuItem>
                    {CONSTITUTIONS.map((c) => (
                      <MenuItem key={c.value} value={c.value}>
                        {c.label}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <StaticLabel label="Industry" />
                  <TextField
                    select
                    fullWidth
                    size="small"
                    value={form.industry}
                    onChange={(e) => set("industry", e.target.value)}
                    sx={fieldSx}
                  >
                    <MenuItem value="">
                      <Typography color="text.disabled">Select…</Typography>
                    </MenuItem>
                    {INDUSTRIES.map((ind) => (
                      <MenuItem key={ind} value={ind}>
                        {ind}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
              </Grid>
            </SectionBox>

            {/* ── 2. Business Nature ── */}
            <SectionBox title="Business Nature">
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                {BUSINESS_NATURES.map((nature) => {
                  const selected = form.businessNature.includes(nature);
                  return (
                    <Chip
                      key={nature}
                      label={nature}
                      onClick={() => toggleBusinessNature(nature)}
                      variant={selected ? "filled" : "outlined"}
                      color={selected ? "primary" : "default"}
                      sx={{ fontWeight: 600, cursor: "pointer" }}
                    />
                  );
                })}
              </Stack>
            </SectionBox>

            {/* ── 3. Business Identifiers (GSTIN, TAN, PAN, CIN, Udyam, IEC) ── */}
            <OptionalAccordion title="Business Identifiers">
              <Grid container spacing={2}>
                {/* PAN */}
                <Grid size={{ xs: 12, sm: 6 }}>
                  <StaticLabel label="PAN" />
                  <TextField
                    fullWidth
                    size="small"
                    value={form.pan}
                    onChange={(e) => set("pan", e.target.value.toUpperCase())}
                    placeholder="ABCDE1234F"
                    inputProps={{ maxLength: 10, style: { textTransform: "uppercase" } }}
                    sx={fieldSx}
                  />
                </Grid>
                {/* TAN */}
                <Grid size={{ xs: 12, sm: 6 }}>
                  <StaticLabel label="TAN" />
                  <TextField
                    fullWidth
                    size="small"
                    value={form.tan}
                    onChange={(e) => set("tan", e.target.value.toUpperCase())}
                    placeholder="HYDA12345B"
                    inputProps={{ maxLength: 10, style: { textTransform: "uppercase" } }}
                    sx={fieldSx}
                  />
                </Grid>
                {/* CIN */}
                <Grid size={{ xs: 12, sm: 6 }}>
                  <StaticLabel label="CIN" />
                  <TextField
                    fullWidth
                    size="small"
                    value={form.cin}
                    onChange={(e) => set("cin", e.target.value.toUpperCase())}
                    placeholder="U12345MH2020PTC123456"
                    inputProps={{ maxLength: 21, style: { textTransform: "uppercase" } }}
                    sx={fieldSx}
                  />
                </Grid>
                {/* Udyam */}
                <Grid size={{ xs: 12, sm: 6 }}>
                  <StaticLabel label="Udyam Registration No." />
                  <TextField
                    fullWidth
                    size="small"
                    value={form.udyam}
                    onChange={(e) => set("udyam", e.target.value.toUpperCase())}
                    placeholder="UDYAM-AP-00-0000001"
                    inputProps={{ style: { textTransform: "uppercase" } }}
                    sx={fieldSx}
                  />
                </Grid>
                {/* IEC */}
                <Grid size={{ xs: 12, sm: 6 }}>
                  <StaticLabel label="IEC (Import Export Code)" />
                  <TextField
                    fullWidth
                    size="small"
                    value={form.iec}
                    onChange={(e) => set("iec", e.target.value.toUpperCase())}
                    placeholder="AABCT1234C"
                    inputProps={{ maxLength: 10, style: { textTransform: "uppercase" } }}
                    sx={fieldSx}
                  />
                </Grid>

                {/* GSTINs */}
                <Grid size={{ xs: 12 }}>
                  <Divider sx={{ my: 1 }} />
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      mb: 1,
                    }}
                  >
                    <Typography variant="caption" color="text.secondary" fontWeight={600}>
                      GSTIN Registrations
                    </Typography>
                    <Button size="small" startIcon={<AddIcon />} onClick={addGstin}>
                      Add GSTIN
                    </Button>
                  </Box>
                  {form.gstins.length === 0 && (
                    <Typography
                      variant="caption"
                      color="text.disabled"
                      sx={{ display: "block", textAlign: "center", py: 1 }}
                    >
                      No GSTINs added
                    </Typography>
                  )}
                  <Stack spacing={1.5}>
                    {form.gstins.map((g, index) => (
                      <EntryBox
                        key={index}
                        label={`GSTIN #${index + 1}`}
                        onRemove={() => removeGstin(index)}
                      >
                        <Grid container spacing={1.5}>
                          <Grid size={{ xs: 12, sm: 6 }}>
                            <StaticLabel label="GSTIN" />
                            <TextField
                              fullWidth
                              size="small"
                              value={g.gstin}
                              onChange={(e) =>
                                updateGstin(index, "gstin", e.target.value.toUpperCase())
                              }
                              placeholder="37ABCDE1234F1Z5"
                              inputProps={{
                                maxLength: 15,
                                style: { textTransform: "uppercase" },
                              }}
                              sx={fieldSx}
                            />
                          </Grid>
                          <Grid size={{ xs: 12, sm: 6 }}>
                            <StaticLabel label="State" />
                            <TextField
                              select
                              fullWidth
                              size="small"
                              value={g.state}
                              onChange={(e) => updateGstin(index, "state", e.target.value)}
                              sx={fieldSx}
                            >
                              <MenuItem value="">
                                <Typography color="text.disabled">Select state…</Typography>
                              </MenuItem>
                              {INDIAN_STATES.map((s) => (
                                <MenuItem key={s} value={s}>
                                  {s}
                                </MenuItem>
                              ))}
                            </TextField>
                          </Grid>
                          <Grid size={{ xs: 12, sm: 6 }}>
                            <StaticLabel label="Registration Type" />
                            <TextField
                              select
                              fullWidth
                              size="small"
                              value={g.registrationType}
                              onChange={(e) =>
                                updateGstin(index, "registrationType", e.target.value)
                              }
                              sx={fieldSx}
                            >
                              <MenuItem value="REGULAR">Regular</MenuItem>
                              <MenuItem value="COMPOSITION">Composition</MenuItem>
                              <MenuItem value="EXEMPTED">Exempted</MenuItem>
                            </TextField>
                          </Grid>
                          <Grid size={{ xs: 12, sm: 6 }}>
                            <StaticLabel label="Status" />
                            <TextField
                              select
                              fullWidth
                              size="small"
                              value={g.status}
                              onChange={(e) => updateGstin(index, "status", e.target.value)}
                              sx={fieldSx}
                            >
                              <MenuItem value="ACTIVE">Active</MenuItem>
                              <MenuItem value="INACTIVE">Inactive</MenuItem>
                            </TextField>
                          </Grid>
                        </Grid>
                      </EntryBox>
                    ))}
                  </Stack>
                </Grid>
              </Grid>
            </OptionalAccordion>

            {/* ── 4. Compliance & Services (matches mobile nav-row → drill-down dialog) ── */}
            <SectionBox title="Compliance & Services">
              <Stack spacing={1.5}>
                {COMPLIANCE_ROWS.map((row) => (
                  <ComplianceNavRow
                    key={row.key}
                    label={row.label}
                    subtitle={row.subtitle}
                    value={form[row.key]}
                    onOpen={() =>
                      setComplianceDialog({
                        open: true,
                        key: row.key,
                        label: row.label,
                        serviceKey: row.serviceKey,
                        systemDueDateDescription: row.systemDueDateDescription,
                      })
                    }
                  />
                ))}
              </Stack>
            </SectionBox>

            {/* ── 5. Addresses (matches mobile: line1, locality, city, state, pincode, country) ── */}
            <OptionalAccordion title="Addresses">
              <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 1 }}>
                <Button size="small" startIcon={<AddIcon />} onClick={addAddress}>
                  Add Address
                </Button>
              </Box>
              {form.addresses.length === 0 && (
                <Typography
                  variant="caption"
                  color="text.disabled"
                  sx={{ display: "block", textAlign: "center", py: 1 }}
                >
                  No addresses added
                </Typography>
              )}
              <Stack spacing={1.5}>
                {form.addresses.map((a, index) => (
                  <EntryBox
                    key={index}
                    label={`Address #${index + 1}`}
                    onRemove={() => removeAddress(index)}
                  >
                    <Grid container spacing={1.5}>
                      {/* Address Type */}
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <StaticLabel label="Address Type" />
                        <TextField
                          select
                          fullWidth
                          size="small"
                          value={a.type}
                          onChange={(e) => updateAddress(index, "type", e.target.value)}
                          sx={fieldSx}
                        >
                          {ADDRESS_TYPES.map((t) => (
                            <MenuItem key={t} value={t}>
                              {t}
                            </MenuItem>
                          ))}
                        </TextField>
                      </Grid>
                      {/* Address Line 1 — matches mobile "Street / building / flat" */}
                      <Grid size={{ xs: 12 }}>
                        <StaticLabel label="Address Line 1" />
                        <TextField
                          fullWidth
                          size="small"
                          value={a.line1}
                          onChange={(e) => updateAddress(index, "line1", e.target.value)}
                          placeholder="Street / building / flat (optional)"
                          sx={fieldSx}
                        />
                      </Grid>
                      {/* Area / Locality — matches mobile screen 2 */}
                      <Grid size={{ xs: 12 }}>
                        <StaticLabel label="Area / Locality" />
                        <TextField
                          fullWidth
                          size="small"
                          // stored as a custom field on the address object; extend SubjectAddress if needed
                          value={(a as Record<string, string>).locality ?? ""}
                          onChange={(e) => updateAddress(index, "locality", e.target.value)}
                          placeholder="Area / locality (optional)"
                          sx={fieldSx}
                        />
                      </Grid>
                      {/* City */}
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <StaticLabel label="City" />
                        <TextField
                          fullWidth
                          size="small"
                          value={a.city}
                          onChange={(e) => updateAddress(index, "city", e.target.value)}
                          placeholder="City (optional)"
                          sx={fieldSx}
                        />
                      </Grid>
                      {/* State */}
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <StaticLabel label="State" />
                        <TextField
                          select
                          fullWidth
                          size="small"
                          value={a.state}
                          onChange={(e) => updateAddress(index, "state", e.target.value)}
                          sx={fieldSx}
                        >
                          <MenuItem value="">
                            <Typography color="text.disabled">State (optional)</Typography>
                          </MenuItem>
                          {INDIAN_STATES.map((s) => (
                            <MenuItem key={s} value={s}>
                              {s}
                            </MenuItem>
                          ))}
                        </TextField>
                      </Grid>
                      {/* Pincode */}
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <StaticLabel label="Pincode" />
                        <TextField
                          fullWidth
                          size="small"
                          value={a.pincode}
                          onChange={(e) =>
                            updateAddress(index, "pincode", e.target.value.replace(/\D/g, ""))
                          }
                          placeholder="Pincode (optional)"
                          inputProps={{ maxLength: 6, inputMode: "numeric" }}
                          sx={fieldSx}
                        />
                      </Grid>
                      {/* Country — matches mobile screen 2 */}
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <StaticLabel label="Country" />
                        <TextField
                          fullWidth
                          size="small"
                          value={(a as Record<string, string>).country ?? ""}
                          onChange={(e) => updateAddress(index, "country", e.target.value)}
                          placeholder="India"
                          sx={fieldSx}
                        />
                      </Grid>
                    </Grid>
                  </EntryBox>
                ))}
              </Stack>
            </OptionalAccordion>

            {/* ── 6. Additional Contacts / Team Members ── */}
            <OptionalAccordion title="Team Members">
              <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 1.5 }}>
                <Button size="small" startIcon={<AddIcon />} onClick={addContact}>
                  Add Team Member
                </Button>
              </Box>
              {form.contacts.length === 0 && (
                <Typography
                  variant="caption"
                  color="text.disabled"
                  sx={{ display: "block", textAlign: "center", py: 1 }}
                >
                  No team members added
                </Typography>
              )}
              <Stack spacing={1.5}>
                {form.contacts.map((c, index) => (
                  <EntryBox
                    key={index}
                    label={`Team Member #${index + 1}`}
                    onRemove={() => removeContact(index)}
                  >
                    <Grid container spacing={1.5}>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <StaticLabel label="Name" required />
                        <TextField
                          fullWidth
                          size="small"
                          value={c.name}
                          onChange={(e) => updateContact(index, "name", e.target.value)}
                          placeholder="Contact person name"
                          sx={fieldSx}
                        />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <StaticLabel label="Role" />
                        <TextField
                          select
                          fullWidth
                          size="small"
                          value={c.role}
                          onChange={(e) => updateContact(index, "role", e.target.value)}
                          sx={fieldSx}
                        >
                          {CONTACT_ROLES.map((r) => (
                            <MenuItem key={r} value={r}>
                              {r}
                            </MenuItem>
                          ))}
                        </TextField>
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <StaticLabel label="Phone" />
                        <TextField
                          fullWidth
                          size="small"
                          value={c.phone}
                          onChange={(e) => updateContact(index, "phone", e.target.value)}
                          placeholder="9876543210"
                          inputProps={{ inputMode: "tel" }}
                          sx={fieldSx}
                        />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <StaticLabel label="Email" />
                        <TextField
                          fullWidth
                          size="small"
                          type="email"
                          value={c.email}
                          onChange={(e) => updateContact(index, "email", e.target.value)}
                          placeholder="contact@example.com"
                          sx={fieldSx}
                        />
                      </Grid>
                      <Grid size={{ xs: 12 }}>
                        <FormControlLabel
                          control={
                            <Switch
                              size="small"
                              checked={c.isPrimary}
                              onChange={(e) =>
                                updateContact(index, "isPrimary", e.target.checked)
                              }
                            />
                          }
                          label={
                            <Typography variant="caption">Set as primary contact</Typography>
                          }
                        />
                      </Grid>
                    </Grid>
                  </EntryBox>
                ))}
              </Stack>
            </OptionalAccordion>

            {/* ── 7. Notification Preferences ── */}
            <OptionalAccordion title="Notification Preferences">
              <Stack spacing={2}>
                <Box>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    fontWeight={600}
                    sx={{ display: "block", mb: 1 }}
                  >
                    Default Channels
                  </Typography>
                  <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                    {NOTIFICATION_CHANNELS.map((ch) => {
                      const selected = form.notifChannels.includes(ch);
                      return (
                        <Chip
                          key={ch}
                          label={ch}
                          size="small"
                          onClick={() => toggleNotifChannel(ch)}
                          variant={selected ? "filled" : "outlined"}
                          color={selected ? "primary" : "default"}
                          sx={{ fontWeight: 600, cursor: "pointer" }}
                        />
                      );
                    })}
                  </Stack>
                </Box>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <StaticLabel label="Language" />
                    <TextField
                      select
                      fullWidth
                      size="small"
                      value={form.notifLanguage}
                      onChange={(e) => set("notifLanguage", e.target.value)}
                      sx={fieldSx}
                    >
                      {LANGUAGES.map((l) => (
                        <MenuItem key={l} value={l}>
                          {l}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <StaticLabel label="Timezone" />
                    <TextField
                      select
                      fullWidth
                      size="small"
                      value={form.notifTimezone}
                      onChange={(e) => set("notifTimezone", e.target.value)}
                      sx={fieldSx}
                    >
                      {TIMEZONES.map((tz) => (
                        <MenuItem key={tz} value={tz}>
                          {tz}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>
                </Grid>
                <Box>
                  <FormControlLabel
                    control={
                      <Switch
                        size="small"
                        checked={form.quietHoursEnabled}
                        onChange={(e) => set("quietHoursEnabled", e.target.checked)}
                      />
                    }
                    label={
                      <Typography variant="caption" fontWeight={600}>
                        Enable Quiet Hours
                      </Typography>
                    }
                  />
                  {form.quietHoursEnabled && (
                    <Grid container spacing={2} sx={{ mt: 0.5 }}>
                      <Grid size={{ xs: 6 }}>
                        <StaticLabel label="Start" />
                        <TextField
                          fullWidth
                          size="small"
                          type="time"
                          value={form.quietHoursStart}
                          onChange={(e) => set("quietHoursStart", e.target.value)}
                          InputLabelProps={{ shrink: true }}
                          sx={fieldSx}
                        />
                      </Grid>
                      <Grid size={{ xs: 6 }}>
                        <StaticLabel label="End" />
                        <TextField
                          fullWidth
                          size="small"
                          type="time"
                          value={form.quietHoursEnd}
                          onChange={(e) => set("quietHoursEnd", e.target.value)}
                          InputLabelProps={{ shrink: true }}
                          sx={fieldSx}
                        />
                      </Grid>
                    </Grid>
                  )}
                </Box>
              </Stack>
            </OptionalAccordion>

            {/* ── 8. Tags ── */}
            <OptionalAccordion title="Tags">
              <Stack spacing={1.5}>
                <Box sx={{ display: "flex", gap: 1 }}>
                  <Box sx={{ flex: 1 }}>
                    <StaticLabel label="Add Tag" />
                    <TextField
                      fullWidth
                      size="small"
                      value={form.tagInput}
                      onChange={(e) => set("tagInput", e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addTag();
                        }
                      }}
                      placeholder="e.g. vip, gst-client"
                      sx={fieldSx}
                    />
                  </Box>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={addTag}
                    sx={{ whiteSpace: "nowrap", alignSelf: "flex-end" }}
                  >
                    Add
                  </Button>
                </Box>
                {form.tags.length > 0 && (
                  <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                    {form.tags.map((tag) => (
                      <Chip
                        key={tag}
                        label={tag}
                        size="small"
                        color="primary"
                        variant="outlined"
                        onDelete={() => removeTag(tag)}
                      />
                    ))}
                  </Stack>
                )}
              </Stack>
            </OptionalAccordion>

            {/* ── 9. Notes ── */}
            <OptionalAccordion title="Notes">
              <StaticLabel label="Internal notes about this client" />
              <TextField
                fullWidth
                multiline
                rows={3}
                size="small"
                value={form.notes}
                onChange={(e) => set("notes", e.target.value)}
                placeholder="Any relevant notes, special instructions, or context…"
                sx={fieldSx}
              />
            </OptionalAccordion>

            {/* ── 10. Status ── */}
            <SectionBox title="Status">
              <TextField
                select
                fullWidth
                size="small"
                value={form.isActive ? "ACTIVE" : "INACTIVE"}
                onChange={(e) => set("isActive", e.target.value === "ACTIVE")}
                sx={fieldSx}
              >
                <MenuItem value="ACTIVE">Active</MenuItem>
                <MenuItem value="INACTIVE">Inactive</MenuItem>
              </TextField>
            </SectionBox>
          </Stack>
        )}
      </DialogContent>

      {/* ── Footer ── */}
      <DialogActions
        sx={{
          px: 2.5,
          py: 2,
          bgcolor: "background.paper",
          borderTop: "1px solid",
          borderColor: "divider",
          gap: 1,
        }}
      >
        <Button
          variant="outlined"
          onClick={handleClose}
          disabled={loading}
          sx={{ flex: 1, fontWeight: 600, borderRadius: 2, py: 1.2, textTransform: "none" }}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={loading || fetching}
          startIcon={
            loading ? <CircularProgress size={16} color="inherit" /> : <EditIcon />
          }
          sx={{
            flex: 2,
            fontWeight: 700,
            borderRadius: 2,
            py: 1.2,
            textTransform: "none",
            background: "linear-gradient(135deg, #1e3a5f 0%, #2563eb 100%)",
            "&:hover": {
              background: "linear-gradient(135deg, #1e3a5f 0%, #1d4ed8 100%)",
            },
            "&:disabled": { background: "#93c5fd", color: "#fff" },
          }}
        >
          {loading ? "Updating…" : "Save Changes"}
        </Button>
      </DialogActions>
      {/* ── Compliance drill-down dialog (opens on top of this dialog) ── */}
      {complianceDialog && (
        <ComplianceSettingsDialog
          open={complianceDialog.open}
          onClose={() => setComplianceDialog(null)}
          label={complianceDialog.label}
          serviceKey={complianceDialog.serviceKey}
          clientName={form.fullName || form.companyName || "Client"}
          value={form[complianceDialog.key]}
          systemDueDateDescription={complianceDialog.systemDueDateDescription}
          onSave={(updated) => {
            setForm((f) => ({ ...f, [complianceDialog.key]: updated }));
          }}
        />
      )}
    </Dialog>
  );
}

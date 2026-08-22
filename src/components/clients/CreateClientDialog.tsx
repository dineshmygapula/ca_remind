"use client";

import { useState } from "react";
import {
  Alert,
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
  FormControlLabel,
  Switch,
  Divider,
  Select,
  FormControl,
  FormHelperText,
  
} from "@mui/material";
import {
  Close as CloseIcon,
  PersonAdd as PersonAddIcon,
  ExpandMore as ExpandMoreIcon,
  Add as AddIcon,
  DeleteOutline as DeleteOutlineIcon,
} from "@mui/icons-material";
import { createSubject } from "@/services/subjectService";
import {
  INDIAN_STATES,
  CONSTITUTIONS,
  INDUSTRIES,
  BUSINESS_NATURES,
} from "@/constants/clientConstants";
import NameField from "@/components/common/NameField";
import EmailField from "@/components/common/EmailField";
import PersonIcon from "@mui/icons-material/Person";
import type { SelectChangeEvent } from "@mui/material/Select";
import {
  COUNTRY_CODES,
  DEFAULT_COUNTRY_CODE,
  type CountryCode,
} from "@/constants/phoneCodes";
import { validatePhone } from "../common/topbar/phoneValidation";
import type { CreateSubjectDto, ContactRole } from "@/types/subject";
import { getStaff } from "../../services/staffService";
import type { StaffMember } from "@/types/staff.types";
import AddStaffDialog from "@/components/staff/AddStaffDialog";
import { Autocomplete, Skeleton } from "@mui/material";
import {
  FormData,
  GstinEntry,
  ContactEntry,
  AddressEntry,
  ComplianceService,
  FormErrors,
} from "../../types/subject";
import {
  CONTACT_ROLES,
  ADDRESS_TYPES,
  NOTIFICATION_CHANNELS,
  COMPLIANCE_FREQUENCIES,
  TIMEZONES,
  LANGUAGES,
  DEFAULT_GSTIN,
  DEFAULT_CONTACT,
  DEFAULT_ADDRESS,
  DEFAULT_FORM,
} from "@/constants/clientConstants";

// ─── Shared static label sx — removes notch gap ──────────────────────────────
const fieldSx = {
  "& .MuiOutlinedInput-root": { borderRadius: "8px" },
  "& .MuiOutlinedInput-notchedOutline legend": { display: "none" },
  "& .MuiOutlinedInput-notchedOutline": { top: 0 },
} as const;

// ─── StaticLabel — renders bold label above any input ────────────────────────
function StaticLabel({
  label,
  required,
}: {
  label: string;
  required?: boolean;
}) {
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

interface AddClientDialogProps {
  businessId: string;
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function CreateClientDialog({
  businessId,
  open,
  onClose,
  onSuccess,
}: AddClientDialogProps) {
  const [form, setForm] = useState<FormData>(DEFAULT_FORM);
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [selectedCountry, setSelectedCountry] =
    useState<CountryCode>(DEFAULT_COUNTRY_CODE);
  const [phoneTouched, setPhoneTouched] = useState(false);
  const [forceError, setForceError] = useState(false);
  const [staffList, setStaffList] = useState<StaffMember[]>([]);
  const [staffLoading, setStaffLoading] = useState(false);
  const [staffFetched, setStaffFetched] = useState(false);
  const [addStaffOpen, setAddStaffOpen] = useState(false);
  const [addingContactIndex, setAddingContactIndex] = useState<number | null>(null);
  const [apiError, setApiError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const set = <K extends keyof FormData>(field: K, value: FormData[K]) => {
    setForm((f) => ({ ...f, [field]: value }));
    if (errors[field as keyof FormErrors]) {
      setErrors((e) => ({ ...e, [field]: undefined }));
    }
  };

  const toggleBusinessNature = (nature: string) => {
    setForm((f) => ({
      ...f,
      businessNature: f.businessNature.includes(nature)
        ? f.businessNature.filter((n) => n !== nature)
        : [...f.businessNature, nature],
    }));
  };

  const toggleNotifChannel = (channel: string) => {
    setForm((f) => ({
      ...f,
      notifChannels: f.notifChannels.includes(channel)
        ? f.notifChannels.filter((c) => c !== channel)
        : [...f.notifChannels, channel],
    }));
  };

  const setCompliance = (
    service:
      | "complianceGst"
      | "complianceTds"
      | "complianceItr"
      | "complianceRoc"
      | "complianceMsme",
    field: keyof ComplianceService,
    value: boolean | string,
  ) => {
    setForm((f) => ({ ...f, [service]: { ...f[service], [field]: value } }));
  };

  const addGstin = () =>
    setForm((f) => ({ ...f, gstins: [...f.gstins, { ...DEFAULT_GSTIN }] }));
  const removeGstin = (i: number) =>
    setForm((f) => ({ ...f, gstins: f.gstins.filter((_, idx) => idx !== i) }));
  const updateGstin = (i: number, field: keyof GstinEntry, value: string) =>
    setForm((f) => ({
      ...f,
      gstins: f.gstins.map((g, idx) =>
        idx === i ? { ...g, [field]: value } : g,
      ),
    }));

  const addContact = () =>
    setForm((f) => ({ ...f, contacts: [...f.contacts, { ...DEFAULT_CONTACT }] }));
  const removeContact = (i: number) =>
    setForm((f) => ({ ...f, contacts: f.contacts.filter((_, idx) => idx !== i) }));
  const updateContact = (
    i: number,
    field: keyof ContactEntry,
    value: string | boolean,
  ) =>
    setForm((f) => ({
      ...f,
      contacts: f.contacts.map((c, idx) =>
        idx === i ? { ...c, [field]: value } : c,
      ),
    }));

  const addAddress = () =>
    setForm((f) => ({ ...f, addresses: [...f.addresses, { ...DEFAULT_ADDRESS }] }));
  const removeAddress = (i: number) =>
    setForm((f) => ({ ...f, addresses: f.addresses.filter((_, idx) => idx !== i) }));
  const updateAddress = (i: number, field: keyof AddressEntry, value: string) =>
    setForm((f) => ({
      ...f,
      addresses: f.addresses.map((a, idx) =>
        idx === i ? { ...a, [field]: value } : a,
      ),
    }));

  const addTag = () => {
    const tag = form.tagInput.trim();
    if (tag && !form.tags.includes(tag)) {
      setForm((f) => ({ ...f, tags: [...f.tags, tag], tagInput: "" }));
    }
  };

  const removeTag = (tag: string) =>
    setForm((f) => ({ ...f, tags: f.tags.filter((t) => t !== tag) }));

  const validate = (): boolean => {
    const e: FormErrors = {};
    if (!form.fullName.trim()) e.fullName = "Full name is required";
    const phoneResult = validatePhone(
      form.phone.replace(selectedCountry.code, "").trim(),
      selectedCountry,
    );
    if (!phoneResult.isValid) e.phone = phoneResult.errorMessage;
    if (!form.email.trim()) e.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = "Enter a valid email";
    if (form.pan && !/^[A-Z]{5}[0-9]{4}[A-Z]$/.test(form.pan))
      e.pan = "Invalid PAN format (e.g. ABCDE1234F)";
    const gstinErrors: string[] = [];
    form.gstins.forEach((g, i) => {
      gstinErrors[i] =
        g.gstin && g.gstin.length !== 15 ? "GSTIN must be 15 characters" : "";
    });
    if (gstinErrors.some((err) => err)) e.gstins = gstinErrors;
    const contactErrors: string[] = [];
    form.contacts.forEach((c, i) => {
      contactErrors[i] = !c.name.trim() ? "Contact name is required" : "";
    });
    if (contactErrors.some((err) => err)) e.contacts = contactErrors;
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    setForceError(true);
    setPhoneTouched(true);
    if (!validate()) return;
    setLoading(true);
    const fullPhone = form.phone.trim();
    try {
      const dto: CreateSubjectDto = {
        subjectType: "CLIENT",
        profile: {
          displayName: form.fullName,
          legalName: form.companyName || form.fullName,
          businessName: form.companyName || form.fullName,
          constitution: form.constitution || "INDIVIDUAL",
          industry: form.industry || "General",
          businessNature:
            form.businessNature.length > 0 ? form.businessNature : ["General"],
        },
        primaryContact: { name: form.fullName, phone: fullPhone, email: form.email },
        contacts: [
          {
            name: form.fullName,
            role: "OWNER" as const,
            phone: fullPhone,
            email: form.email,
            isPrimary: true,
          },
          ...form.contacts.map((c) => ({ ...c, role: c.role as ContactRole })),
        ],
        isActive: true,
      };

      const hasIdentifier = form.pan || form.tan || form.cin || form.udyam || form.iec;
      if (hasIdentifier) {
        dto.identifiers = {};
        if (form.pan) dto.identifiers.pan = form.pan;
        if (form.tan) dto.identifiers.tan = form.tan;
        if (form.cin) dto.identifiers.cin = form.cin;
        if (form.udyam) dto.identifiers.udyam = form.udyam;
        if (form.iec) dto.identifiers.iec = form.iec;
      }

      const validGstins = form.gstins.filter((g) => g.gstin.trim());
      if (validGstins.length > 0) {
        dto.gst = {
          gstins: validGstins.map((g) => ({ ...g, gstin: g.gstin.toUpperCase() })),
        };
      }

      const validAddresses = form.addresses.filter((a) => a.line1.trim());
      if (validAddresses.length > 0) dto.addresses = validAddresses;

      if (form.notifChannels.length > 0 || form.notifLanguage || form.notifTimezone) {
        dto.notificationPreferences = {
          defaultChannels: form.notifChannels,
          language: form.notifLanguage,
          timezone: form.notifTimezone,
          quietHours: {
            enabled: form.quietHoursEnabled,
            start: form.quietHoursStart,
            end: form.quietHoursEnd,
          },
        };
      }

      const hasCompliance =
        form.complianceGst.enabled ||
        form.complianceTds.enabled ||
        form.complianceItr.enabled ||
        form.complianceRoc.enabled ||
        form.complianceMsme.enabled;

      if (hasCompliance || form.tags.length > 0) {
        dto.metadata = {
          complianceProfile: {
            gst: form.complianceGst,
            tds: form.complianceTds,
            itr: form.complianceItr,
            roc: form.complianceRoc,
            msme: form.complianceMsme,
          },
          dueDateOverrides: [],
          tags: form.tags,
        };
        if (!hasCompliance) {
          dto.metadata.complianceProfile = {
            gst: { enabled: false, frequency: "QUARTERLY" },
            tds: { enabled: false, frequency: "QUARTERLY" },
            itr: { enabled: false, frequency: "QUARTERLY" },
            roc: { enabled: false, frequency: "QUARTERLY" },
            msme: { enabled: false, frequency: "QUARTERLY" },
          };
        }
      }

      if (form.notes.trim()) dto.notes = [{ text: form.notes.trim() }];

      await createSubject(businessId, dto);
      setSuccessMessage("Client created successfully! 🎉");
      setTimeout(() => {
        setForm(DEFAULT_FORM);
        setForceError(false);
        setPhoneTouched(false);
        setSelectedCountry(DEFAULT_COUNTRY_CODE);
        setSuccessMessage("");
        onSuccess?.();
        onClose();
      }, 1500);
    } catch (err: unknown) {
      console.error("Create client error:", err);
      setApiError(
        err instanceof Error ? err.message : "Failed to save client. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleContactsAccordionChange = async (
    _: React.SyntheticEvent,
    expanded: boolean,
  ) => {
    if (expanded && !staffFetched) {
      setStaffLoading(true);
      try {
        const list = await getStaff(businessId);
        setStaffList(list);
      } catch {
        // non-critical
      } finally {
        setStaffLoading(false);
        setStaffFetched(true);
      }
    }
  };

  const handleStaffCreated = async () => {
    try {
      const list = await getStaff(businessId);
      setStaffList(list);
      const newest = list[list.length - 1];
      if (newest && addingContactIndex !== null) {
        updateContact(addingContactIndex, "name", newest.userName ?? "");
        updateContact(addingContactIndex, "phone", newest.phone ?? "");
        updateContact(addingContactIndex, "email", newest.email ?? "");
        updateContact(addingContactIndex, "role", "OTHER");
      }
    } catch {
      // silently ignore
    } finally {
      setAddStaffOpen(false);
      setAddingContactIndex(null);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setForm(DEFAULT_FORM);
      setErrors({});
      setForceError(false);
      setPhoneTouched(false);
      setSelectedCountry(DEFAULT_COUNTRY_CODE);
      onClose();
    }
  };

  return (
 <Dialog
  open={open}
  onClose={handleClose}
  maxWidth="sm"
  fullWidth
  PaperProps={{
    sx: {
      maxHeight: "90vh",
      borderRadius: "20px !important",
      boxShadow: "0 10px 30px rgba(15,23,42,0.08)",
      border: "1px solid #E2E8F0",
      overflow: "hidden !important",
      padding: "0 !important",
      background: "#fff !important",
    },
  }}
>
      {/* ── Header ── */}
     {/* ── Header — same pattern as Send Reminder dialog ── */}
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
  <Stack direction="row" alignItems="center" justifyContent="space-between">
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
        <PersonAddIcon sx={{ fontSize: 20, color: "#2563EB" }} />
      </Box>
      <Typography
        variant="h6"
        fontWeight={700}
        fontSize="1.05rem"
        lineHeight={1.2}
        color="#0F172A"
      >
        Add Client
      </Typography>
    </Stack>

    <IconButton
      onClick={handleClose}
      disabled={loading}
      size="small"
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
      {/* ── Content ── */}
     <DialogContent sx={{ p: 2.5, bgcolor: "#F8FAFC" }}>
        {successMessage && (
          <Alert severity="success" variant="filled" sx={{ mb: 2 }}>
            {successMessage}
          </Alert>
        )}
        {apiError && (
          <Alert severity="error" onClose={() => setApiError("")} sx={{ mb: 2 }}>
            {apiError}
          </Alert>
        )}

        <Stack spacing={2}>
          {/* 1. Basic Info */}
          <SectionBox title="Basic Info Required">
            <Grid container spacing={2}>
              {/* Full Name */}
              <Grid size={{ xs: 12 }}>
                <NameField
                  label="Full Name"
                  value={form.fullName}
                  onChange={(value) => set("fullName", value)}
                  required
                  placeholder="Rama Rao"
                  forceError={forceError}
                  externalError={errors.fullName}
                  onBlur={() => {
                    if (form.fullName.trim())
                      setErrors((e) => ({ ...e, fullName: undefined }));
                  }}
                  icon={<PersonIcon fontSize="small" sx={{ color: "primary.main" }} />}
                />
              </Grid>

              {/* Phone */}
              <Grid size={{ xs: 12, sm: 6 }}>
                <Box>
                  <StaticLabel label="Phone Number" required />
                  <FormControl fullWidth error={phoneTouched && !!errors.phone}>
                    <Box
                      sx={{
                        display: "flex",
                        gap: 1,
                        border: "1px solid",
                        borderColor:
                          phoneTouched && errors.phone
                            ? "error.main"
                            : "rgba(0,0,0,0.23)",
                        borderRadius: "8px",
                        px: 1,
                        py: 0.5,
                        "&:hover": {
                          borderColor:
                            phoneTouched && errors.phone
                              ? "error.main"
                              : "text.primary",
                        },
                        "&:focus-within": {
                          borderColor:
                            phoneTouched && errors.phone
                              ? "error.main"
                              : "primary.main",
                          borderWidth: "2px",
                        },
                      }}
                    >
                      <Select
                        value={selectedCountry.code}
                        onChange={(e: SelectChangeEvent) => {
                          const found = COUNTRY_CODES.find(
                            (c) => c.code === e.target.value,
                          );
                          if (found) {
                            setSelectedCountry(found);
                            set("phone", "");
                          }
                        }}
                        variant="standard"
                        disableUnderline
                        sx={{
                          minWidth: { xs: 70, sm: 85 },
                          fontSize: "0.8rem",
                          "& .MuiSelect-select": { py: 0.5, pr: 3 },
                        }}
                      >
                        {COUNTRY_CODES.map((c) => (
                          <MenuItem key={c.iso} value={c.code}>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                              <Box
                                sx={{
                                  display: { xs: "none", sm: "block" },
                                  fontSize: "0.75rem",
                                  color: "text.secondary",
                                }}
                              >
                                {c.iso}
                              </Box>
                              <Box sx={{ fontWeight: 600, fontSize: "0.8rem" }}>
                                {c.code}
                              </Box>
                            </Box>
                          </MenuItem>
                        ))}
                      </Select>
                      <Box sx={{ width: "1px", bgcolor: "divider", my: 0.5 }} />
                      <TextField
                        variant="standard"
                        value={form.phone}
                        onChange={(e) => {
                          const digits = e.target.value.replace(/\D/g, "");
                          set("phone", digits);
                          if (errors.phone)
                            setErrors((ev) => ({ ...ev, phone: undefined }));
                        }}
                        onBlur={() => {
                          setPhoneTouched(true);
                          const result = validatePhone(form.phone, selectedCountry);
                          if (!result.isValid)
                            setErrors((e) => ({ ...e, phone: result.errorMessage }));
                        }}
                        fullWidth
                        placeholder={`${selectedCountry.digitCount} digits`}
                        inputProps={{
                          inputMode: "numeric",
                          maxLength: selectedCountry.digitCount,
                        }}
                        InputProps={{ disableUnderline: true }}
                        sx={{ "& .MuiInputBase-root": { py: 0.5, fontSize: "0.875rem" } }}
                      />
                    </Box>
                    <FormHelperText sx={{ mx: 0, mt: 0.5 }}>
                      {phoneTouched && errors.phone
                        ? errors.phone
                        : `Enter ${selectedCountry.digitCount} digit number for ${selectedCountry.country}`}
                    </FormHelperText>
                  </FormControl>
                </Box>
              </Grid>

              {/* Email */}
              <Grid size={{ xs: 12, sm: 6 }}>
                <EmailField
                  value={form.email}
                  onChange={(value) => set("email", value)}
                  forceError={forceError}
                  label="Email"
                  required
                />
              </Grid>

              {/* Business Name */}
              <Grid size={{ xs: 12 }}>
                <Box>
                  <StaticLabel label="Business Name" />
                  <TextField
                    fullWidth
                    size="small"
                    value={form.companyName}
                    onChange={(e) => set("companyName", e.target.value)}
                    placeholder="Rama Traders"
                    sx={fieldSx}
                  />
                </Box>
              </Grid>

              {/* Constitution */}
              <Grid size={{ xs: 12, sm: 6 }}>
                <Box>
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
                </Box>
              </Grid>

              {/* Industry */}
              <Grid size={{ xs: 12, sm: 6 }}>
                <Box>
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
                </Box>
              </Grid>
            </Grid>
          </SectionBox>

          {/* 2. Business Nature */}
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

          {/* 3. Business Identifiers */}
          <OptionalAccordion title="Business Identifiers">
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Box>
                  <StaticLabel label="PAN" />
                  <TextField
                    fullWidth
                    size="small"
                    value={form.pan}
                    onChange={(e) => set("pan", e.target.value.toUpperCase())}
                    error={!!errors.pan}
                    helperText={errors.pan}
                    placeholder="ABCDE1234F"
                    inputProps={{ maxLength: 10, style: { textTransform: "uppercase" } }}
                    sx={fieldSx}
                  />
                </Box>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Box>
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
                </Box>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Box>
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
                </Box>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Box>
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
                </Box>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Box>
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
                </Box>
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
                          <Box>
                            <StaticLabel label="GSTIN" />
                            <TextField
                              fullWidth
                              size="small"
                              value={g.gstin}
                              onChange={(e) =>
                                updateGstin(index, "gstin", e.target.value.toUpperCase())
                              }
                              error={!!errors.gstins?.[index]}
                              helperText={errors.gstins?.[index]}
                              placeholder="37ABCDE1234F1Z5"
                              inputProps={{
                                maxLength: 15,
                                style: { textTransform: "uppercase" },
                              }}
                              sx={fieldSx}
                            />
                          </Box>
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                          <Box>
                            <StaticLabel label="State" />
                            <TextField
                              select
                              fullWidth
                              size="small"
                              value={g.state}
                              onChange={(e) =>
                                updateGstin(index, "state", e.target.value)
                              }
                              sx={fieldSx}
                            >
                              <MenuItem value="">
                                <Typography color="text.disabled">Select state…</Typography>
                              </MenuItem>
                              {INDIAN_STATES.map((s) => (
                                <MenuItem key={s} value={s}>{s}</MenuItem>
                              ))}
                            </TextField>
                          </Box>
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                          <Box>
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
                          </Box>
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                          <Box>
                            <StaticLabel label="Status" />
                            <TextField
                              select
                              fullWidth
                              size="small"
                              value={g.status}
                              onChange={(e) =>
                                updateGstin(index, "status", e.target.value)
                              }
                              sx={fieldSx}
                            >
                              <MenuItem value="ACTIVE">Active</MenuItem>
                              <MenuItem value="INACTIVE">Inactive</MenuItem>
                            </TextField>
                          </Box>
                        </Grid>
                      </Grid>
                    </EntryBox>
                  ))}
                </Stack>
              </Grid>
            </Grid>
          </OptionalAccordion>

          {/* 4. Additional Contacts */}
          <Accordion
            onChange={handleContactsAccordionChange}
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
                Add Team Member
              </Typography>
            </AccordionSummary>
            <AccordionDetails sx={{ px: 2.5, pt: 0, pb: 2.5 }}>
              <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 1.5 }}>
                <Button size="small" startIcon={<AddIcon />} onClick={addContact}>
                  Add Team Member
                </Button>
              </Box>
              {staffLoading && (
                <Stack spacing={1} sx={{ mb: 2 }}>
                  <Skeleton variant="rounded" height={36} />
                  <Skeleton variant="rounded" height={36} width="60%" />
                </Stack>
              )}
              {form.contacts.length === 0 && !staffLoading && (
                <Typography
                  variant="caption"
                  color="text.disabled"
                  sx={{ display: "block", textAlign: "center", py: 1 }}
                >
                  No team members added. Click &quot;Add Team Member&quot; to assign a staff member.
                </Typography>
              )}
              <Stack spacing={1.5}>
                {form.contacts.map((c, index) => (
                  <EntryBox
                    key={index}
                    label={`Team Member #${index + 1}`}
                    onRemove={() => removeContact(index)}
                  >
                    <Stack spacing={1.5}>
                      <Autocomplete
                        options={staffList}
                        loading={staffLoading}
                        getOptionLabel={(s: StaffMember) =>
                          `${s.userName ?? ""} — ${s.email ?? ""}`
                        }
                        onChange={(_, selected: StaffMember | null) => {
                          if (!selected) return;
                          updateContact(index, "name", selected.userName ?? "");
                          updateContact(index, "phone", selected.phone ?? "");
                          updateContact(index, "email", selected.email ?? "");
                          updateContact(
                            index,
                            "role",
                            (selected.role?.toUpperCase() ?? "OTHER") as ContactEntry["role"],
                          );
                        }}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            size="small"
                            placeholder="Search by name or email…"
                            sx={fieldSx}
                            InputProps={{
                              ...params.InputProps,
                              endAdornment: (
                                <>
                                  {staffLoading ? <CircularProgress size={16} /> : null}
                                  {params.InputProps.endAdornment}
                                </>
                              ),
                            }}
                          />
                        )}
                        noOptionsText={
                          <Box>
                            <Typography variant="caption" color="text.secondary">
                              No matching staff found.
                            </Typography>
                            <Button
                              size="small"
                              fullWidth
                              sx={{ mt: 0.5, justifyContent: "flex-start" }}
                              onClick={() => {
                                setAddingContactIndex(index);
                                setAddStaffOpen(true);
                              }}
                            >
                              + Add New Staff Member
                            </Button>
                          </Box>
                        }
                      />
                      <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                        <Button
                          size="small"
                          variant="text"
                          sx={{ fontSize: "0.75rem", color: "primary.main" }}
                          onClick={() => {
                            setAddingContactIndex(index);
                            setAddStaffOpen(true);
                          }}
                        >
                          + Add New Staff Member
                        </Button>
                      </Box>
                      <Grid container spacing={1.5}>
                        <Grid size={{ xs: 12, sm: 6 }}>
                          <Box>
                            <StaticLabel label="Name" required />
                            <TextField
                              fullWidth
                              size="small"
                              value={c.name}
                              onChange={(e) =>
                                updateContact(index, "name", e.target.value)
                              }
                              error={!!errors.contacts?.[index]}
                              helperText={errors.contacts?.[index]}
                              placeholder="Contact person name"
                              sx={fieldSx}
                            />
                          </Box>
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                          <Box>
                            <StaticLabel label="Role" />
                            <TextField
                              select
                              fullWidth
                              size="small"
                              value={c.role}
                              onChange={(e) =>
                                updateContact(index, "role", e.target.value)
                              }
                              sx={fieldSx}
                            >
                              {CONTACT_ROLES.map((r) => (
                                <MenuItem key={r} value={r}>{r}</MenuItem>
                              ))}
                            </TextField>
                          </Box>
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                          <Box>
                            <StaticLabel label="Phone" />
                            <TextField
                              fullWidth
                              size="small"
                              value={c.phone}
                              onChange={(e) =>
                                updateContact(index, "phone", e.target.value)
                              }
                              placeholder="9876543210"
                              inputProps={{ inputMode: "tel" }}
                              sx={fieldSx}
                            />
                          </Box>
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                          <Box>
                            <StaticLabel label="Email" />
                            <TextField
                              fullWidth
                              size="small"
                              type="email"
                              value={c.email}
                              onChange={(e) =>
                                updateContact(index, "email", e.target.value)
                              }
                              placeholder="contact@example.com"
                              sx={fieldSx}
                            />
                          </Box>
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
                              <Typography variant="caption">
                                Set as primary contact
                              </Typography>
                            }
                          />
                        </Grid>
                      </Grid>
                    </Stack>
                  </EntryBox>
                ))}
              </Stack>
            </AccordionDetails>
          </Accordion>

          {/* 5. Addresses */}
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
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Box>
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
                            <MenuItem key={t} value={t}>{t}</MenuItem>
                          ))}
                        </TextField>
                      </Box>
                    </Grid>
                    <Grid size={{ xs: 12 }}>
                      <Box>
                        <StaticLabel label="Address Line 1" />
                        <TextField
                          fullWidth
                          size="small"
                          value={a.line1}
                          onChange={(e) => updateAddress(index, "line1", e.target.value)}
                          placeholder="Door No 10-22, Main Bazaar"
                          sx={fieldSx}
                        />
                      </Box>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Box>
                        <StaticLabel label="City" />
                        <TextField
                          fullWidth
                          size="small"
                          value={a.city}
                          onChange={(e) => updateAddress(index, "city", e.target.value)}
                          placeholder="Vijayawada"
                          sx={fieldSx}
                        />
                      </Box>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Box>
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
                            <Typography color="text.disabled">Select state…</Typography>
                          </MenuItem>
                          {INDIAN_STATES.map((s) => (
                            <MenuItem key={s} value={s}>{s}</MenuItem>
                          ))}
                        </TextField>
                      </Box>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Box>
                        <StaticLabel label="Pincode" />
                        <TextField
                          fullWidth
                          size="small"
                          value={a.pincode}
                          onChange={(e) =>
                            updateAddress(index, "pincode", e.target.value.replace(/\D/g, ""))
                          }
                          placeholder="520001"
                          inputProps={{ maxLength: 6, inputMode: "numeric" }}
                          sx={fieldSx}
                        />
                      </Box>
                    </Grid>
                  </Grid>
                </EntryBox>
              ))}
            </Stack>
          </OptionalAccordion>

          {/* 6. Notification Preferences */}
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
                  <Box>
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
                        <MenuItem key={l} value={l}>{l}</MenuItem>
                      ))}
                    </TextField>
                  </Box>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Box>
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
                        <MenuItem key={tz} value={tz}>{tz}</MenuItem>
                      ))}
                    </TextField>
                  </Box>
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
                      <Box>
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
                      </Box>
                    </Grid>
                    <Grid size={{ xs: 6 }}>
                      <Box>
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
                      </Box>
                    </Grid>
                  </Grid>
                )}
              </Box>
            </Stack>
          </OptionalAccordion>

          {/* 7. Compliance Profile */}
          <OptionalAccordion title="Compliance Profile">
            <Stack spacing={1}>
              {(
                [
                  ["complianceGst", "GST Filing"],
                  ["complianceTds", "TDS Returns"],
                  ["complianceItr", "Income Tax (ITR)"],
                  ["complianceRoc", "ROC Filings"],
                  ["complianceMsme", "MSME Filings"],
                ] as const
              ).map(([key, label]) => (
                <EntryBox key={key} label={label} showRemove={false}>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <FormControlLabel
                      control={
                        <Switch
                          size="small"
                          checked={form[key].enabled}
                          onChange={(e) =>
                            setCompliance(key, "enabled", e.target.checked)
                          }
                        />
                      }
                      label={
                        <Typography variant="body2" fontWeight={600}>
                          {label}
                        </Typography>
                      }
                    />
                    {form[key].enabled && (
                      <Box>
                        <StaticLabel label="Frequency" />
                        <TextField
                          select
                          size="small"
                          sx={{ minWidth: 150, ...fieldSx }}
                          value={form[key].frequency}
                          onChange={(e) =>
                            setCompliance(key, "frequency", e.target.value)
                          }
                        >
                          {COMPLIANCE_FREQUENCIES.map((f) => (
                            <MenuItem key={f} value={f}>{f}</MenuItem>
                          ))}
                        </TextField>
                      </Box>
                    )}
                  </Box>
                </EntryBox>
              ))}
            </Stack>
          </OptionalAccordion>

          {/* 8. Tags */}
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
                    placeholder="e.g. vip, retail, gst-client"
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

          {/* 9. Notes */}
          <OptionalAccordion title="Notes">
            <Box>
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
            </Box>
          </OptionalAccordion>
        </Stack>
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
          sx={{ flex: 1, fontWeight: 600, py: 1.2 }}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={loading}
          color="primary"
          startIcon={
            loading ? (
              <CircularProgress size={16} color="inherit" />
            ) : (
              <PersonAddIcon />
            )
          }
          sx={{ flex: 2, fontWeight: 700, py: 1.2 }}
        >
          {loading ? "Saving…" : "Save Client"}
        </Button>
      </DialogActions>

      <AddStaffDialog
        open={addStaffOpen}
        onClose={() => {
          setAddStaffOpen(false);
          setAddingContactIndex(null);
        }}
        businessId={businessId}
        onSuccess={handleStaffCreated}
      />
    </Dialog>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

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
        sx={{ fontWeight: 700, color: "text.secondary", letterSpacing: "0.08em", display: "block", mb: 2 }}
      >
        {title}
      </Typography>
      {children}
    </Box>
  );
}

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

function OptionalAccordion({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Accordion
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
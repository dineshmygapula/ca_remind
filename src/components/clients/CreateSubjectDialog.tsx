"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Stack,
  CircularProgress,
  IconButton,
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  FormControlLabel,
  Switch,
  TextField,
  MenuItem,
} from "@mui/material";
import {
  Close as CloseIcon,
  PersonAdd as PersonAddIcon,
} from "@mui/icons-material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

import { createSubject } from "@/services/subjectService";
import { DEFAULT_FORM } from "@/constants/clientConstants";
import type { CreateSubjectDto } from "@/types/subject";
import type { AddressType } from "../../types/subject.js";
import { getStaff } from "@/services/staffService";
import AddStaffDialog from "../staff/AddStaffDialog.js"; // adjust path
import type { StaffMember } from "@/types/staff.types";
//const COMPLIANCE_FREQUENCIES = ["MONTHLY", "QUARTERLY", "ANNUALLY"] as const;

interface Props {
  businessId: string;
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

function StaticLabel({
  label,
  required = false,
}: {
  label: string;
  required?: boolean;
}) {
  return (
    <Typography variant="body2" fontWeight={600}>
      {label}
      {required && (
        <Typography component="span" sx={{ color: "error.main", ml: 0.5 }}>
          *
        </Typography>
      )}
    </Typography>
  );
}

export default function CreateSubjectDialog({
  businessId,
  open,
  onClose,
  onSuccess,
}: Props) {
  const [form, setForm] = useState(DEFAULT_FORM);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [errors, setErrors] = useState({
    fullName: "",
    phone: "",
    email: "",
    companyName: "",
  });

  // Staff related states
  const [staffList, setStaffList] = useState<StaffMember[]>([]);
  const [loadingStaff, setLoadingStaff] = useState(false);
  const [openCreateStaff, setOpenCreateStaff] = useState(false);
  //Notes this.state.

  const [notes, setNotes] = useState<string>("");

  // ✅ Extracted so it can be called both from useEffect and onSuccess
  const fetchStaff = useCallback(async () => {
    try {
      setLoadingStaff(true);
      const data = await getStaff(businessId);
      setStaffList(data);
    } catch (err) {
      console.error("Failed to fetch staff", err);
    } finally {
      setLoadingStaff(false);
    }
  }, [businessId]);

  useEffect(() => {
    if (open) fetchStaff();
  }, [open, fetchStaff]);

  function setCompliance(
    key: keyof typeof form,
    field: "enabled" | "frequency",
    value: boolean | string,
  ) {
    setForm((prev) => {
      const current = prev[key];
      if (typeof current !== "object") return prev;
      return {
        ...prev,
        [key]: {
          ...current,
          [field]: value,
        },
      };
    });
  }

  const handleClose = () => {
    if (!loading) {
      setForm(DEFAULT_FORM);
      setApiError("");
      setSuccessMessage("");
      onClose();
    }
  };

  const validateForm = () => {
    const newErrors = {
      fullName: "",
      phone: "",
      email: "",
      companyName: "",
    };

    if (!form.fullName.trim()) {
      newErrors.fullName = "Please enter full name";
    }

    if (!form.phone) {
      newErrors.phone = "Phone number is required";
    } else if (!/^\d{10}$/.test(form.phone)) {
      newErrors.phone = "Phone number must be exactly 10 digits";
    }

    if (!form.email.trim()) {
      newErrors.email = "Please enter email address";
    } else if (!/\S+@\S+\.\S+/.test(form.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!form.companyName.trim()) {
      newErrors.companyName = "Please enter business name";
    }

    setErrors(newErrors);
    return Object.values(newErrors).every((e) => !e);
  };

  const isFormValid = () => {
    return (
      form.fullName.trim() &&
      form.phone.trim() &&
      form.email.trim() &&
      /\S+@\S+\.\S+/.test(form.email) &&
      form.companyName.trim()
    );
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);

      const dto: CreateSubjectDto = {
        subjectType: "CLIENT",
        profile: {
          displayName: form.fullName,
          businessName: form.companyName || form.fullName,
          legalName: form.companyName || form.fullName,
          constitution: "INDIVIDUAL",
          industry: "General",
          businessNature: ["General"],
        },
        primaryContact: {
          name: form.fullName,
          phone: form.phone,
          email: form.email,
        },
        contacts: [],
        isActive: true,
      };

      // IDENTIFIERS (OPTIONAL)
      if (form.pan || form.tan || form.cin || form.udyam || form.iec) {
        dto.identifiers = {
          pan: form.pan || undefined,
          tan: form.tan || undefined,
          cin: form.cin || undefined,
          udyam: form.udyam || undefined,
          iec: form.iec || undefined,
        };
      }

      // GSTIN MAPPING
      const validGstins = form.gstins.filter(
        (g) => g.gstin && g.gstin.trim() !== "",
      );
      if (validGstins.length > 0) {
        dto.gst = {
          gstins: validGstins.map((g) => ({
            gstin: g.gstin.toUpperCase(),
            state: g.state,
            registrationType: g.registrationType,
            status: g.status,
          })),
        };
      }

      // ✅ FIX 1: ADDRESSES — was never assigned to dto
      const validAddresses = form.addresses.filter((a) => a.line1?.trim());
      if (validAddresses.length > 0) {
        dto.addresses = validAddresses;
      }

      // ✅ FIX 2: COMPLIANCE PROFILE — was never mapped to dto
      dto.metadata = {
        complianceProfile: {
          gst: {
            enabled: form.complianceGst.enabled,
            frequency: form.complianceGst.frequency,
          },
          tds: {
            enabled: form.complianceTds.enabled,
            frequency: form.complianceTds.frequency,
          },
          itr: {
            enabled: form.complianceItr.enabled,
            frequency: form.complianceItr.frequency,
          },
          roc: {
            enabled: form.complianceRoc.enabled,
            frequency: form.complianceRoc.frequency,
          },
          msme: {
            enabled: form.complianceMsme.enabled,
            frequency: form.complianceMsme.frequency,
          },
        },
        dueDateOverrides: [],
        tags: [],
      };

      // NOTIFICATION PREFERENCES
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

      // ✅ FIX 3: ASSIGNED TEAM — use || instead of ?? to handle null userName
      /* if (form.assignedTeam?.primaryAssigneeId) {
        dto.assignedTeam = {
          primaryAssignee: {
            userId: form.assignedTeam.primaryAssigneeId,
            name:
              staffList.find(
                (s) => s.id === form.assignedTeam?.primaryAssigneeId,
              )?.userName || "",
          },
        };
      }
       */
      // ✅ 👉 ADD HERE (Assigned Team Mapping)
      /* const selectedStaff = staffList.find(
        (s) => s.id === form.assignedTeam?.primaryAssigneeId,
      );

      if (selectedStaff && selectedStaff.userName) {
        dto.assignedTeam = {
          primaryAssignee: {
            userId: selectedStaff.id,
            name: selectedStaff.userName, // ✅ now 100% string
          },
        };
      } */
      // ✅ CORRECT — build the DTO from already-stored form state
      const selectedStaff = staffList.find(
        (s) => s.id === form.assignedTeam?.primaryAssigneeId,
      );

      if (selectedStaff) {
        const displayName =
          `${selectedStaff.firstName ?? ""} ${selectedStaff.lastName ?? ""}`.trim() ||
          selectedStaff.userName ||
          "";

        dto.assignedTeam = {
          primaryAssignee: {
            userId: selectedStaff.id,
            name: displayName,
          },
        };
      }

      // ✅ NOTES MAPPING
      if (notes && notes.trim() !== "") {
        dto.notes = [
          {
            text: notes.trim(),
          },
        ];
      } else {
        dto.notes = [];
      }
      // ✅ DEBUG: Compare this output against your Swagger payload
      console.log("📦 DTO being sent:", JSON.stringify(dto, null, 2));
      console.log("staffList at submit time:", staffList);
      console.log("Assigned Team in DTO:", dto.assignedTeam);
      console.log("primaryAssigneeId:", form.assignedTeam?.primaryAssigneeId);

      await createSubject(businessId, dto);

      setSuccessMessage("Client created successfully 🎉");

      setTimeout(() => {
        setForm(DEFAULT_FORM);
        onSuccess?.();
        handleClose();
      }, 1000);
    } catch (err: unknown) {
      setApiError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md" // ← change from "lg" to "md" (~900px max)
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: "20px",
          height: "85vh",
          maxHeight: "85vh",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          padding: "0 !important",
          background: "#fff",
        },
      }}
    >
      {/* HEADER */}

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

      {/* CONTENT */}
      <DialogContent
        sx={{
          flex: 1,
          overflowY: "auto",
          px: 4,
          py: 3,
        }}
      >
        {successMessage && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {successMessage}
          </Alert>
        )}

        {apiError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {apiError}
          </Alert>
        )}

        <Stack spacing={2}>
          {/* Full Name */}
          <Box>
            <StaticLabel label="Full Name" required />
            <input
              placeholder="Enter full name (e.g., Rama Rao)"
              style={{ width: "100%", padding: 10 }}
              value={form.fullName}
              onChange={(e) => {
                setForm((f) => ({ ...f, fullName: e.target.value }));
                setErrors((prev) => ({ ...prev, fullName: "" }));
              }}
            />
            {errors.fullName && (
              <Typography color="error" variant="caption">
                {errors.fullName}
              </Typography>
            )}
          </Box>

          {/* Phone */}
          <Box>
            <StaticLabel label="Phone" required />
            <input
              placeholder="Enter 10-digit mobile number"
              style={{ width: "100%", padding: 10 }}
              value={form.phone}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, "");
                if (value.length <= 10) {
                  setForm((f) => ({ ...f, phone: value }));
                  setErrors((prev) => ({ ...prev, phone: "" }));
                }
              }}
            />
            {errors.phone && (
              <Typography color="error" variant="caption">
                {errors.phone}
              </Typography>
            )}
          </Box>

          {/* Email */}
          <Box>
            <StaticLabel label="Email" required />
            <input
              placeholder="Enter email address (e.g., name@example.com)"
              style={{ width: "100%", padding: 10 }}
              value={form.email}
              onChange={(e) => {
                setForm((f) => ({ ...f, email: e.target.value }));
                setErrors((prev) => ({ ...prev, email: "" }));
              }}
            />
            {errors.email && (
              <Typography color="error" variant="caption">
                {errors.email}
              </Typography>
            )}
          </Box>

          {/* Business Name */}
          <Box>
            <StaticLabel label="Business Name" required />
            <input
              placeholder="Enter business name (e.g., Rama Traders)"
              style={{ width: "100%", padding: 10 }}
              value={form.companyName}
              onChange={(e) => {
                setForm((f) => ({ ...f, companyName: e.target.value }));
                setErrors((prev) => ({ ...prev, companyName: "" }));
              }}
            />
            {errors.companyName && (
              <Typography color="error" variant="caption">
                {errors.companyName}
              </Typography>
            )}
          </Box>

          {/* IDENTIFIERS */}
          <Accordion
            sx={{
              borderRadius: "12px !important",
              border: "1px solid",
              borderColor: "divider",
              "&:before": { display: "none" },
            }}
          >
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              sx={{ px: 2, py: 1 }}
            >
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                Identifiers (Recommended)
              </Typography>
            </AccordionSummary>
            <AccordionDetails sx={{ px: 2, pb: 2 }}>
              <Stack spacing={1.5}>
                <Box>
                  <Typography variant="body2" fontWeight={600}>
                    PAN
                  </Typography>
                  <input
                    style={{ width: "100%", padding: 10 }}
                    placeholder="e.g., ABCDE1234F"
                    value={form.pan}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        pan: e.target.value.toUpperCase(),
                      }))
                    }
                  />
                </Box>
                <Box>
                  <Typography variant="body2" fontWeight={600}>
                    GSTIN
                  </Typography>
                  <input
                    style={{ width: "100%", padding: 10 }}
                    placeholder="e.g., 22AAAAA0000A1Z5"
                    value={form.gstins[0]?.gstin || ""}
                    onChange={(e) => {
                      const value = e.target.value.toUpperCase();
                      setForm((f) => {
                        const gstins = [...f.gstins];
                        if (gstins.length === 0) {
                          gstins.push({
                            gstin: value,
                            state: "",
                            registrationType: "REGULAR",
                            status: "ACTIVE",
                          });
                        } else {
                          gstins[0].gstin = value;
                        }
                        return { ...f, gstins };
                      });
                    }}
                  />
                </Box>
                <Box>
                  <Typography variant="body2" fontWeight={600}>
                    TAN
                  </Typography>
                  <input
                    style={{ width: "100%", padding: 10 }}
                    placeholder="e.g., ABCD12345E"
                    value={form.tan}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        tan: e.target.value.toUpperCase(),
                      }))
                    }
                  />
                </Box>
              </Stack>
            </AccordionDetails>
          </Accordion>

          {/* COMPLIANCE SERVICES */}

          <Accordion
            sx={{
              borderRadius: "12px !important",
              border: "1px solid",
              borderColor: "divider",
              "&:before": { display: "none" },
            }}
          >
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              sx={{ px: 2, py: 1 }}
            >
              <Typography variant="body2" fontWeight={600}>
                Compliance Services
              </Typography>
            </AccordionSummary>

            <AccordionDetails sx={{ px: 2, pb: 2 }}>
              <Stack spacing={2}>
                {(
                  [
                    { key: "complianceGst", label: "GST", icon: "📋" },
                    { key: "complianceTds", label: "TDS", icon: "🏦" },
                    { key: "complianceItr", label: "ITR", icon: "📄" },
                    { key: "complianceRoc", label: "ROC", icon: "🏢" },
                    { key: "complianceMsme", label: "MSME", icon: "🏭" },
                  ] as const
                ).map(({ key, label, icon }) => (
                  <Box
                    key={key}
                    sx={{
                      border: "1px solid",
                      borderColor: "divider",
                      borderRadius: 2,
                      p: 2,
                      bgcolor: "background.paper",
                    }}
                  >
                    {/* Service Header — Icon + Name + Toggle */}
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      {/* Left — Icon + Label */}
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1.5 }}
                      >
                        <Box
                          sx={{
                            width: 36,
                            height: 36,
                            borderRadius: "8px",
                            bgcolor: "secondary.main",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "1.1rem",
                          }}
                        >
                          {icon}
                        </Box>
                        <Box>
                          <Typography variant="body2" fontWeight={700}>
                            {label}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {form[key].enabled
                              ? `${label} · Select Frequency`
                              : `${label} · Inactive`}
                          </Typography>
                        </Box>
                      </Box>

                      {/* Right — Active/Inactive Toggle */}
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        <Typography
                          variant="caption"
                          fontWeight={600}
                          color={
                            form[key].enabled ? "success.main" : "text.disabled"
                          }
                        >
                          {form[key].enabled ? "Active" : "Inactive"}
                        </Typography>
                        <Switch
                          size="small"
                          checked={form[key].enabled}
                          onChange={(e) =>
                            setCompliance(
                              key as keyof typeof form,
                              "enabled",
                              e.target.checked,
                            )
                          }
                          sx={{
                            "& .MuiSwitch-switchBase.Mui-checked": {
                              color: "success.main",
                            },
                            "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track":
                            {
                              bgcolor: "success.main",
                            },
                          }}
                        />
                      </Box>
                    </Box>

                    {/* Frequency Dropdown — only when enabled */}
                    {form[key].enabled && (
                      <Box sx={{ mt: 2 }}>
                        <Typography
                          variant="caption"
                          fontWeight={600}
                          color="text.secondary"
                          sx={{ display: "block", mb: 0.75 }}
                        >
                          Select Filing Frequency
                        </Typography>
                        <TextField
                          select
                          fullWidth
                          size="small"
                          value={form[key].frequency || ""}
                          onChange={(e) =>
                            setCompliance(
                              key as
                              | "complianceGst"
                              | "complianceTds"
                              | "complianceItr"
                              | "complianceRoc"
                              | "complianceMsme",
                              "frequency",
                              e.target.value,
                            )
                          }
                          sx={{
                            "& .MuiOutlinedInput-root": { borderRadius: "8px" },
                          }}
                        >
                          <MenuItem value="" disabled>
                            Select Filing Frequency
                          </MenuItem>
                          <MenuItem value="MONTHLY">Monthly</MenuItem>
                          <MenuItem value="QUARTERLY">Quarterly</MenuItem>
                          <MenuItem value="ANNUAL">Annual</MenuItem>
                        </TextField>
                      </Box>
                    )}
                  </Box>
                ))}
              </Stack>
            </AccordionDetails>
          </Accordion>

          {/* ADDRESSES */}
          <Accordion
            sx={{
              borderRadius: "12px !important",
              border: "1px solid",
              borderColor: "divider",
              "&:before": { display: "none" },
            }}
          >
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              sx={{ px: 2, py: 1 }}
            >
              <Typography variant="body2" fontWeight={600}>
                Addresses
              </Typography>
            </AccordionSummary>
            <AccordionDetails sx={{ px: 2, pb: 2 }}>
              <Stack spacing={2}>
                <Box>
                  <Typography variant="body2" fontWeight={600}>
                    Address Type
                  </Typography>
                  <select
                    style={{ width: "100%", padding: 10 }}
                    value={form.addresses[0]?.type || "REGISTERED"}
                    onChange={(e) => {
                      const value = e.target.value as AddressType;
                      setForm((f) => {
                        const addresses = [...f.addresses];
                        if (addresses.length === 0) {
                          addresses.push({
                            type: value,
                            line1: "",
                            city: "",
                            state: "",
                            pincode: "",
                          });
                        } else {
                          addresses[0].type = value;
                        }
                        return { ...f, addresses };
                      });
                    }}
                  >
                    <option value="REGISTERED">Registered</option>
                    <option value="COMMUNICATION">Communication</option>
                    <option value="BRANCH">Branch</option>
                  </select>
                </Box>

                <Box>
                  <Typography variant="body2" fontWeight={600}>
                    Address Line
                  </Typography>
                  <input
                    style={{ width: "100%", padding: 10 }}
                    placeholder="e.g., Door No, Street Name"
                    value={form.addresses[0]?.line1 || ""}
                    onChange={(e) => {
                      const value = e.target.value;
                      setForm((f) => {
                        const addresses = [...f.addresses];
                        if (addresses.length === 0) {
                          addresses.push({
                            type: "REGISTERED",
                            line1: value,
                            city: "",
                            state: "",
                            pincode: "",
                          });
                        } else {
                          addresses[0].line1 = value;
                        }
                        return { ...f, addresses };
                      });
                    }}
                  />
                </Box>

                <Box>
                  <Typography variant="body2" fontWeight={600}>
                    City
                  </Typography>
                  <input
                    style={{ width: "100%", padding: 10 }}
                    placeholder="e.g., Hyderabad"
                    value={form.addresses[0]?.city || ""}
                    onChange={(e) => {
                      const value = e.target.value;
                      setForm((f) => {
                        const addresses = [...f.addresses];
                        if (addresses.length === 0) {
                          addresses.push({
                            type: "REGISTERED",
                            line1: "",
                            city: value,
                            state: "",
                            pincode: "",
                          });
                        } else {
                          addresses[0].city = value;
                        }
                        return { ...f, addresses };
                      });
                    }}
                  />
                </Box>

                <Box>
                  <Typography variant="body2" fontWeight={600}>
                    State
                  </Typography>
                  <input
                    style={{ width: "100%", padding: 10 }}
                    placeholder="e.g., Telangana"
                    value={form.addresses[0]?.state || ""}
                    onChange={(e) => {
                      const value = e.target.value;
                      setForm((f) => {
                        const addresses = [...f.addresses];
                        if (addresses.length === 0) {
                          addresses.push({
                            type: "REGISTERED",
                            line1: "",
                            city: "",
                            state: value,
                            pincode: "",
                          });
                        } else {
                          addresses[0].state = value;
                        }
                        return { ...f, addresses };
                      });
                    }}
                  />
                </Box>

                <Box>
                  <Typography variant="body2" fontWeight={600}>
                    Pincode
                  </Typography>
                  <input
                    style={{ width: "100%", padding: 10 }}
                    placeholder="e.g., 500001"
                    value={form.addresses[0]?.pincode || ""}
                    onChange={(e) => {
                      const value = e.target.value;
                      setForm((f) => {
                        const addresses = [...f.addresses];
                        if (addresses.length === 0) {
                          addresses.push({
                            type: "REGISTERED",
                            line1: "",
                            city: "",
                            state: "",
                            pincode: value,
                          });
                        } else {
                          addresses[0].pincode = value;
                        }
                        return { ...f, addresses };
                      });
                    }}
                  />
                </Box>
              </Stack>
            </AccordionDetails>
          </Accordion>

          {/* NOTIFICATION PREFERENCES */}
          <Accordion
            sx={{
              borderRadius: "12px !important",
              border: "1px solid",
              borderColor: "divider",
              "&:before": { display: "none" },
            }}
          >
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              sx={{ px: 2, py: 1 }}
            >
              <Typography variant="body2" fontWeight={600}>
                Notification Preferences
              </Typography>
            </AccordionSummary>
            <AccordionDetails sx={{ px: 2, pb: 2 }}>
              <Stack spacing={2}>
                <Box>
                  <StaticLabel label="Channels" />
                  <Stack direction="row" spacing={2} sx={{ mt: 0.5 }}>
                    <FormControlLabel
                      control={
                        <Switch
                          size="small"
                          checked={form.notifChannels.includes("WHATSAPP")}
                          onChange={(e) =>
                            setForm((f) => ({
                              ...f,
                              notifChannels: e.target.checked
                                ? [...f.notifChannels, "WHATSAPP"]
                                : f.notifChannels.filter(
                                  (c) => c !== "WHATSAPP",
                                ),
                            }))
                          }
                        />
                      }
                      label={
                        <Typography variant="body2" fontWeight={600}>
                          WhatsApp
                        </Typography>
                      }
                    />
                    <FormControlLabel
                      control={
                        <Switch
                          size="small"
                          checked={form.notifChannels.includes("EMAIL")}
                          onChange={(e) =>
                            setForm((f) => ({
                              ...f,
                              notifChannels: e.target.checked
                                ? [...f.notifChannels, "EMAIL"]
                                : f.notifChannels.filter((c) => c !== "EMAIL"),
                            }))
                          }
                        />
                      }
                      label={
                        <Typography variant="body2" fontWeight={600}>
                          Email
                        </Typography>
                      }
                    />
                  </Stack>
                </Box>
              </Stack>
            </AccordionDetails>
          </Accordion>

          {/* ASSIGN TEAM */}
          <Accordion
            sx={{
              borderRadius: "12px !important",
              border: "1px solid",
              borderColor: "divider",
              "&:before": { display: "none" },
            }}
          >
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              sx={{ px: 2, py: 1 }}
            >
              <Typography variant="body2" fontWeight={600}>
                Assign Team
              </Typography>
            </AccordionSummary>
            <AccordionDetails sx={{ px: 2, pb: 2 }}>
              <Stack spacing={2}>
                <Box>
                  <Typography variant="body2" fontWeight={600}>
                    Select Staff
                  </Typography>

                  {loadingStaff ? (
                    <CircularProgress size={20} />
                  ) : (
                    <>
                      <select
                        style={{ width: "100%", padding: 10 }}
                        value={form.assignedTeam?.primaryAssigneeId || ""}
                        onChange={(e) => {
                          const value = e.target.value; // ← this line must be first
                          if (value === "__add_new__") {
                            setOpenCreateStaff(true);
                            return;
                          }
                          // ✅ Store both id and name at selection time
                          const selected = staffList.find(
                            (s) => s.id === value,
                          );
                          setForm((f) => ({
                            ...f,
                            assignedTeam: {
                              primaryAssigneeId: value,
                              primaryAssigneeName: selected?.userName || "", // ✅ capture name now
                            },
                          }));
                        }}
                      >
                        <option value="">Select staff</option>
                        {staffList.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.firstName && s.lastName
                              ? `${s.firstName} ${s.lastName}`
                              : s.userName ?? "Unnamed"}
                          </option>
                        ))}
                        {/* ✅ Always show this at the bottom of the dropdown */}
                        <option value="__add_new__">+ Add new staff</option>
                      </select>

                      {/* ✅ Fallback button shown when list is empty */}
                      {staffList.length === 0 && (
                        <Button
                          size="small"
                          variant="outlined"
                          sx={{ mt: 1 }}
                          onClick={() => setOpenCreateStaff(true)}
                        >
                          + Add Staff
                        </Button>
                      )}
                    </>
                  )}
                </Box>
              </Stack>
            </AccordionDetails>
          </Accordion>

          {/* Notes */}

          <Accordion sx={{ mt: 2 }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography fontWeight={600}>Add Internal Notes</Typography>
            </AccordionSummary>

            <AccordionDetails>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                Internal Notes
              </Typography>

              <TextField
                fullWidth
                multiline
                minRows={4}
                placeholder="Add any internal notes about this client"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </AccordionDetails>
          </Accordion>
        </Stack>
      </DialogContent>

      {/* FOOTER */}
      <DialogActions
        sx={{
          px: { xs: 2, sm: 3 },
          py: 2,
          flexDirection: { xs: "column", sm: "row" },
          gap: 1,
        }}
      >
        <Button
          fullWidth
          variant="outlined"
          onClick={handleClose}
          disabled={loading}
        >
          Cancel
        </Button>
        <Button
          fullWidth
          variant="contained"
          onClick={handleSubmit}
          disabled={loading || !isFormValid()}
        >
          {loading ? <CircularProgress size={20} /> : "Save Client"}
        </Button>
      </DialogActions>
      {/* CREATE STAFF DIALOG — mounted at root level, not inside Button */}
      <AddStaffDialog
        open={openCreateStaff}
        onClose={() => setOpenCreateStaff(false)}
        businessId={businessId}
        onSuccess={async (newStaff?: StaffMember) => {
          setOpenCreateStaff(false);
          await fetchStaff();
          if (newStaff?.id) {
            setForm((f) => ({
              ...f,
              assignedTeam: {
                primaryAssigneeId: newStaff.id,
                //primaryAssigneeName: newStaff.userName || "", // ✅ added missing field
                primaryAssigneeName:
                  `${newStaff.firstName ?? ""} ${newStaff.lastName ?? ""}`.trim() ||
                  newStaff.userName ||
                  "",
              },
            }));
          }
        }}
      />
    </Dialog>
  );
}

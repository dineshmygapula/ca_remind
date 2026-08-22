"use client";

import { useState, useEffect } from "react";
import {
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  IconButton,
  Box,
  Typography,
  Alert,
  CircularProgress,
  Switch,
  FormControlLabel,
  Grid,
  Avatar,
  Chip,
} from "@mui/material";
import { Close as CloseIcon } from "@mui/icons-material";
import { updateStaff } from "@/services/staffService";
import { StaffDetails, UpdateStaffDto } from "@/types/staff.types";
import { STAFF_ROLES } from "../../constants/staffConstants";
import PhoneInputField from "../common/PhoneInputField";
import "react-phone-input-2/lib/plain.css";

interface EditStaffDialogProps {
  open: boolean;
  onClose: () => void;
  membershipId: string | null;
  businessId: string;
  onSuccess: () => void;
  staffData: StaffDetails | null;
}

const getInitials = (name?: string) => {
  if (!name) return "??";
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
};

export default function EditStaffDialog({
  open,
  onClose,
  membershipId,
  businessId,
  onSuccess,
  staffData,
}: EditStaffDialogProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const [role, setRole] = useState("");
  const [status, setStatus] = useState<"ACTIVE" | "INACTIVE">("ACTIVE");
  const [userName, setUserName] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");

  // ✅ Pre-fill form from staffData prop — no API call needed
  useEffect(() => {
    if (open && staffData) {
      setRole(staffData.role ?? "");
      setStatus(staffData.status ?? "ACTIVE");
      setUserName(staffData.userName ?? "");
      setFirstName(staffData.contact?.firstName ?? "");
      setLastName(staffData.contact?.lastName ?? "");
      setPhone(staffData.contact?.phone ?? "");
      setError("");
      setFieldErrors({});
    }
  }, [open, staffData]);

  const staticLabelSx = {
    "& .MuiInputLabel-root": {
      position: "static",
      transform: "none",
      fontSize: "0.875rem",
      fontWeight: 500,
      color: "text.primary",
      mb: 0.5,
    },
    "& .MuiInputLabel-asterisk": { color: "error.main" },
    "& .MuiInputBase-root": { mt: 0 },
  };

  const validateForm = (): boolean => {
    const e: Record<string, string> = {};
    if (!phone.trim()) e.phone = "Phone is required";
    else if (phone.length < 10 || phone.length > 15)
      e.phone = "Please enter a valid phone number";
    if (!role) e.role = "Please select a role";
    setFieldErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!membershipId || !staffData) return;
    if (!validateForm()) return;

    try {
      setLoading(true);
      setError("");
const payload: UpdateStaffDto = {};

const membershipPayload: UpdateStaffDto["membership"] = {};
const userPayload: UpdateStaffDto["user"] = {};

// ✅ Membership updates
if (status !== staffData.status) {
  membershipPayload.isActive = status === "ACTIVE";
}

if (role && role !== staffData.role) {
  membershipPayload.roles = [role];
}

// ✅ User updates
if (userName !== (staffData.userName ?? "")) {
  userPayload.userName = userName;
}

if (firstName !== (staffData.contact?.firstName ?? "")) {
  userPayload.firstName = firstName;
}

if (lastName !== (staffData.contact?.lastName ?? "")) {
  userPayload.lastName = lastName;
}

if (phone !== (staffData.contact?.phone ?? "")) {
  userPayload.phone = phone;
}

// ✅ Attach only if present
if (membershipPayload && Object.keys(membershipPayload).length > 0) {
  payload.membership = membershipPayload;
}

if (userPayload && Object.keys(userPayload).length > 0) {
  payload.user = userPayload;
}
      // ✅ Nothing changed — just close
      if (Object.keys(payload).length === 0) {
        console.log("⚠️ No changes detected");
        handleClose();
        return;
      }

      console.log("📤 Final payload:", JSON.stringify(payload, null, 2));
      await updateStaff(businessId, membershipId, payload);
      console.log("✅ Staff updated successfully");
      onSuccess();
      handleClose();
    } catch (err: unknown) {
      console.error("❌ Update staff error:", err);
      setError(
        err instanceof Error ? err.message : "Failed to update staff member"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setRole("");
    setStatus("ACTIVE");
    setUserName("");
    setFirstName("");
    setLastName("");
    setPhone("");
    setError("");
    setFieldErrors({});
    onClose();
  };

  const isActive = status === "ACTIVE";

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{ sx: { borderRadius: 3 } }}
    >
      {/* ── Header ── */}
      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          py: 2,
          px: 3,
          borderBottom: "2px solid #00A3FF",
        }}
      >
        <Typography variant="h6" fontWeight={700} sx={{ color: "#001C3D" }}>
          Edit Staff Member
        </Typography>
        <IconButton onClick={handleClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers sx={{ px: 3, py: 2.5, borderColor: "#E6F4FF" }}>
        {error && (
          <Alert severity="error" onClose={() => setError("")} sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* ✅ Show form only when staffData is available */}
        {staffData ? (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>

            {/* ── Profile Banner ── */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 2,
                p: 2,
                bgcolor: "#E6F4FF",
                borderRadius: 2,
              }}
            >
              <Avatar
                sx={{
                  width: 48,
                  height: 48,
                  bgcolor: "#FFFFFF",
                  color: "#001C3D",
                  fontWeight: 700,
                  fontSize: "1rem",
                  border: "2px solid #00A3FF",
                }}
              >
                {getInitials(staffData.userName)}
              </Avatar>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography fontWeight={600} noWrap sx={{ color: "#001C3D" }}>
                  {staffData.userName || staffData.contact?.email || "Unknown"}
                </Typography>
                <Typography variant="caption" sx={{ color: "#4A5568" }}>
                  {staffData.contact?.email}
                </Typography>
              </Box>
              <Chip
                label={isActive ? "Active" : "Inactive"}
                size="small"
                variant="outlined"
                sx={{
                  fontWeight: 600,
                  borderRadius: "20px",
                  borderColor: isActive ? "#00A3FF" : "#CBD5E0",
                  color: isActive ? "#00A3FF" : "#4A5568",
                  bgcolor: isActive ? "#FFFFFF" : "transparent",
                  flexShrink: 0,
                }}
              />
            </Box>

            {/* ── First Name + Last Name ── */}
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  label="First Name"
                  fullWidth
                  size="small"
                  value={firstName}
                  onChange={(e) => {
                    setFirstName(e.target.value);
                    if (fieldErrors.firstName)
                      setFieldErrors((p) => ({ ...p, firstName: "" }));
                  }}
                  error={!!fieldErrors.firstName}
                  helperText={fieldErrors.firstName}
                  placeholder="e.g., Bhavani"
                  InputLabelProps={{ shrink: true }}
                  sx={staticLabelSx}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  label="Last Name"
                  fullWidth
                  size="small"
                  value={lastName}
                  onChange={(e) => {
                    setLastName(e.target.value);
                    if (fieldErrors.lastName)
                      setFieldErrors((p) => ({ ...p, lastName: "" }));
                  }}
                  error={!!fieldErrors.lastName}
                  helperText={fieldErrors.lastName}
                  placeholder="e.g., Sharma"
                  InputLabelProps={{ shrink: true }}
                  sx={staticLabelSx}
                />
              </Grid>
            </Grid>

            {/* ── Username ── */}
            <TextField
              label="Username"
              fullWidth
              size="small"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              placeholder="e.g., bhavani_sharma"
              InputLabelProps={{ shrink: true }}
              sx={staticLabelSx}
            />

            {/* ── Phone ── */}
            <PhoneInputField
              value={phone}
              onChange={(val) => {
                setPhone(val);
                if (fieldErrors.phone)
                  setFieldErrors((p) => ({ ...p, phone: "" }));
              }}
              label="Phone"
              required
              error={!!fieldErrors.phone}
              helperText={fieldErrors.phone}
              defaultCountry="in"
            />

            {/* ── Role Dropdown ── */}
            <TextField
              label="Role"
              select
              fullWidth
              required
              size="small"
              value={role}
              onChange={(e) => {
                setRole(e.target.value);
                if (fieldErrors.role)
                  setFieldErrors((p) => ({ ...p, role: "" }));
              }}
              error={!!fieldErrors.role}
              helperText={fieldErrors.role}
              InputLabelProps={{ shrink: true }}
              sx={staticLabelSx}
            >
              {STAFF_ROLES.map((r) => (
                <MenuItem key={r.value} value={r.value}>
                  {r.label}
                </MenuItem>
              ))}
            </TextField>

            {/* ── Status Toggle ── */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                p: 1.5,
                bgcolor: "#f8fafc",
                borderRadius: 2,
                border: "1px solid #E6F4FF",
              }}
            >
              <Box>
                <Typography
                  variant="body2"
                  fontWeight={500}
                  sx={{ color: "#001C3D" }}
                >
                  Account Status
                </Typography>
                <Typography variant="caption" sx={{ color: "#4A5568" }}>
                  {isActive
                    ? "Staff member is active"
                    : "Staff member is inactive"}
                </Typography>
              </Box>
              <FormControlLabel
                control={
                  <Switch
                    checked={isActive}
                    onChange={(e) =>
                      setStatus(e.target.checked ? "ACTIVE" : "INACTIVE")
                    }
                    sx={{
                      "& .MuiSwitch-switchBase.Mui-checked": {
                        color: "#00A3FF",
                      },
                      "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track":
                        {
                          bgcolor: "#00A3FF",
                        },
                    }}
                  />
                }
                label=""
                sx={{ mr: 0 }}
              />
            </Box>
          </Box>
        ) : (
          // ✅ Fallback if staffData is null
          <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
            <CircularProgress sx={{ color: "#00A3FF" }} />
          </Box>
        )}
      </DialogContent>

      {/* ── Actions ── */}
      <DialogActions sx={{ p: 2.5, gap: 1, borderTop: "1px solid #E6F4FF" }}>
        <Button
          variant="outlined"
          onClick={handleClose}
          disabled={loading}
          sx={{ borderRadius: 50, px: 3 }}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={loading || !staffData}
          startIcon={
            loading ? <CircularProgress size={18} color="inherit" /> : null
          }
          sx={{ borderRadius: 50, px: 3 }}
        >
          {loading ? "Updating…" : "Update Staff"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
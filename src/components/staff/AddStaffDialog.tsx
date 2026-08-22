"use client";

import { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  IconButton,
  Alert,
  CircularProgress,
  FormControlLabel,
  Checkbox,
  MenuItem,
} from "@mui/material";
import { Close as CloseIcon } from "@mui/icons-material";
import { CreateStaffDto } from "@/types/staff.types";
import { createStaff } from "@/services/staffService";
import PhoneInputField from "../common/PhoneInputField";
import "react-phone-input-2/lib/plain.css";

interface AddStaffDialogProps {
  open: boolean;
  onClose: () => void;
  businessId: string;
  onSuccess: () => void;
}

const ROLES = ["Accountant", "Owner", "Admin"];

const DEFAULT_FORM: CreateStaffDto = {
  userName: "",
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  department: "",
  roles: [],
  sendInvite: true,
};

export default function AddStaffDialog({
  open,
  onClose,
  businessId,
  onSuccess,
}: AddStaffDialogProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState<CreateStaffDto>(DEFAULT_FORM);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // ✅ For text fields
  const handleChange =
    (field: keyof CreateStaffDto) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setFormData((prev) => ({ ...prev, [field]: e.target.value }));
      if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
    };

  // ✅ For role dropdown (single select → stored as array)
  const handleRoleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, roles: [e.target.value] }));
    if (errors.roles) setErrors((prev) => ({ ...prev, roles: "" }));
  };

  // ✅ For phone
  const handlePhoneChange = (value: string) => {
    setFormData((prev) => ({ ...prev, phone: value }));
    if (errors.phone) setErrors((prev) => ({ ...prev, phone: "" }));
  };

  // ✅ For checkbox
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, sendInvite: e.target.checked }));
  };

  const validateForm = (): boolean => {
    const e: Record<string, string> = {};

    if (!formData.firstName.trim()) e.firstName = "First name is required";
    if (!formData.lastName.trim()) e.lastName = "Last name is required";
    if (!formData.email.trim()) e.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
      e.email = "Invalid email format";
    if (!formData.phone.trim()) e.phone = "Phone is required";
    else if (formData.phone.length < 10 || formData.phone.length > 15)
      e.phone = "Please enter a valid phone number";
    if (!formData.roles.length) e.roles = "Please select a role";

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    try {
      setLoading(true);
      setError("");

      console.log("📤 Staff payload:", JSON.stringify(formData, null, 2));
      const result = await createStaff(businessId, formData);
      console.log("✅ Staff created:", result);

      alert(`Staff member "${formData.firstName} ${formData.lastName}" added successfully!`);
      onSuccess();
      handleClose();
    } catch (err: unknown) {
      console.error("❌ Create staff error:", err);
      if (err instanceof Error) {
        if (err.message.includes("E11000") || err.message.includes("duplicate key")) {
          if (err.message.includes("phone"))
            setError("A staff member with this phone number already exists");
          else if (err.message.includes("email"))
            setError("A staff member with this email already exists");
          else setError("This staff member already exists");
        } else {
          setError(err.message);
        }
      } else {
        setError("Failed to create staff member");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData(DEFAULT_FORM);
    setErrors({});
    setError("");
    onClose();
  };

  // ✅ Reusable static label style
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

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{ sx: { borderRadius: 2 } }}
    >
      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          py: 2,
        }}
      >
        Add Staff Member
        <IconButton onClick={handleClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        {error && (
          <Alert severity="error" onClose={() => setError("")} sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Grid container spacing={2} sx={{ pt: 1 }}>

          {/* First Name + Last Name — side by side */}
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              label="First Name"
              fullWidth
              required
              size="small"
              value={formData.firstName}
              onChange={handleChange("firstName")}
              error={!!errors.firstName}
              helperText={errors.firstName}
              placeholder="e.g., Bhavani"
              InputLabelProps={{ shrink: true }}
              sx={staticLabelSx}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              label="Last Name"
              fullWidth
              required
              size="small"
              value={formData.lastName}
              onChange={handleChange("lastName")}
              error={!!errors.lastName}
              helperText={errors.lastName}
              placeholder="e.g., Sharma"
              InputLabelProps={{ shrink: true }}
              sx={staticLabelSx}
            />
          </Grid>

          {/* Phone */}
          <Grid size={{ xs: 12 }}>
            <PhoneInputField
              value={formData.phone}
              onChange={handlePhoneChange}
              label="Phone"
              required
              error={!!errors.phone}
              helperText={errors.phone}
              defaultCountry="in"
            />
          </Grid>

          {/* Email */}
          <Grid size={{ xs: 12 }}>
            <TextField
              label="Email"
              fullWidth
              required
              type="email"
              size="small"
              value={formData.email}
              onChange={handleChange("email")}
              error={!!errors.email}
              helperText={errors.email}
              placeholder="bhavani@example.com"
              InputLabelProps={{ shrink: true }}
              sx={staticLabelSx}
            />
          </Grid>

          {/* Department */}
          <Grid size={{ xs: 12 }}>
            <TextField
              label="Department"
              fullWidth
              size="small"
              value={formData.department}
              onChange={handleChange("department")}
              error={!!errors.department}
              helperText={errors.department}
              placeholder="e.g., Finance"
              InputLabelProps={{ shrink: true }}
              sx={staticLabelSx}
            />
          </Grid>

          {/* Role Dropdown */}
          <Grid size={{ xs: 12 }}>
            <TextField
              label="Role"
              fullWidth
              required
              select
              size="small"
              value={formData.roles[0] ?? ""}
              onChange={handleRoleChange}
              error={!!errors.roles}
              helperText={errors.roles}
              InputLabelProps={{ shrink: true }}
              sx={staticLabelSx}
            >
              {ROLES.map((role) => (
                <MenuItem key={role} value={role}>
                  {role}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          {/* Send Invite */}
          <Grid size={{ xs: 12 }}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={formData.sendInvite}
                  onChange={handleCheckboxChange}
                />
              }
              label="Send invitation email to this staff member"
            />
          </Grid>

        </Grid>
      </DialogContent>

      <DialogActions sx={{ p: 2, gap: 1 }}>
        <Button variant="outlined" onClick={handleClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={loading}
          startIcon={
            loading ? <CircularProgress size={18} color="inherit" /> : null
          }
        >
          {loading ? "Adding…" : "Add Staff Member"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
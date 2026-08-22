"use client";

import {
  Box,
  Button,
  CircularProgress,
  TextField,
  Typography,
  MenuItem,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  LinearProgress,
  Divider,
  InputAdornment,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { useState } from "react";
import { BusinessFormData } from "../../types/business";
import { BUSINESS_TYPE_OPTIONS } from "../../constants/businessConstants";
import { BUSINESS_TIME_ZONE_OPTIONS } from "../../constants/businessConstants";
import { INDIAN_STATES } from "../../constants/clientConstants";
interface BusinessFormProps {
  formData: BusinessFormData;
  submitting: boolean;
  onSubmit: () => void;
  onFieldChange: (field: keyof BusinessFormData, value: string) => void;
  onAddressChange: (field: string, value: string) => void;
}

export default function BusinessForm({
  formData,
  submitting,
  onSubmit,
  onFieldChange,
  onAddressChange,
}: BusinessFormProps) {
  const [submitAttempted, setSubmitAttempted] = useState(false);

  // ── Validation ───────────────────────────────────────
  const nameRegex = /^[A-Za-z0-9\s&.,'()-]+$/;
  const isNameValid =
    formData.name.trim().length > 0 && nameRegex.test(formData.name.trim());

  // phone is plain 10 digits
  const phoneDigits = formData.phone.replace(/\D/g, "");
  const isPhoneValid = phoneDigits.length === 10;

  const isFormValid = isNameValid && isPhoneValid;

  const handleSubmitClick = () => {
    setSubmitAttempted(true);
    if (!isFormValid) return;
    onSubmit();
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "#fff",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Step label */}
      <Box sx={{ px: 3, pt: 1.5, pb: 0.5 }}>
        <Typography variant="body2" color="text.secondary">
          Step 3 of 3 · Business
        </Typography>
      </Box>

      <Divider />
      {/* Progress bar */}
      <LinearProgress
        variant="determinate"
        value={100}
        sx={{
          height: 4,
          bgcolor: "#e0e0e0",
          "& .MuiLinearProgress-bar": { bgcolor: "primary.main" },
        }}
      />

      {/* Scrollable content */}
      <Box sx={{ flex: 1, px: 3, pt: 3, pb: 12, overflowY: "auto" }}>
        {/* Helper text */}
        <Typography
          variant="body1"
          sx={{ mb: 3, lineHeight: 1.7, color: "text.primary" }}
        >
          Start with a name and phone. You can add owner, email, and a full
          address (city, state, country, etc.) now or later in business profile.
        </Typography>

        {/* 1. Business Name */}
        <Box sx={{ mb: 3 }}>
          <Typography sx={{ mb: 0.75, fontWeight: 500 }}>
            Business name
            <Typography component="span" color="error.main" sx={{ ml: 0.5 }}>
              *
            </Typography>
          </Typography>
          <TextField
            fullWidth
            value={formData.name}
            onChange={(e) => onFieldChange("name", e.target.value)}
            placeholder="Shown in the app"
            error={submitAttempted && !isNameValid}
            helperText={
              submitAttempted && !isNameValid
                ? formData.name.trim().length === 0
                  ? "Business name is required"
                  : "Only letters, numbers & . , & ' ( ) - allowed"
                : ""
            }
          />
        </Box>

        {/* 2. Phone Number */}
        <Box sx={{ mb: 3 }}>
          <Typography sx={{ mb: 0.75, fontWeight: 500 }}>
            Phone number
            <Typography component="span" color="error.main" sx={{ ml: 0.5 }}>
              *
            </Typography>
          </Typography>
          <TextField
            fullWidth
            value={formData.phone}
            onChange={(e) => {
              // only allow digits, max 10
              const val = e.target.value.replace(/\D/g, "").slice(0, 10);
              onFieldChange("phone", val);
            }}
            placeholder="10-digit mobile"
            inputProps={{ maxLength: 10, inputMode: "numeric" }}
            error={submitAttempted && !isPhoneValid}
            helperText={
              submitAttempted && !isPhoneValid
                ? "Enter a valid 10-digit mobile number"
                : ""
            }
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <Typography variant="caption" color="text.secondary">
                    {phoneDigits.length}/10
                  </Typography>
                </InputAdornment>
              ),
            }}
          />
        </Box>

        {/* 3. Business Category */}
        <Box sx={{ mb: 3 }}>
          <Typography sx={{ mb: 0.75, fontWeight: 500 }}>
            Business Type
          </Typography>
          <TextField
            select
            fullWidth
            value={formData.businessType || "OTHER"}
            onChange={(e) => onFieldChange("businessType", e.target.value)}
            SelectProps={{ displayEmpty: true }}
          >
            {BUSINESS_TYPE_OPTIONS.map(({ value, label }) => (
              <MenuItem key={value} value={value}>
                {label}
              </MenuItem>
            ))}
          </TextField>
        </Box>

        {/* 4. Business Time Zone */}
       <Box sx={{ mb: 3 }}>
          <Typography sx={{ mb: 0.75, fontWeight: 500 }}>
            Business Time Zone
          </Typography>
          <Typography sx={{ mb: 0.75, fontWeight: 400, fontSize: "0.875rem", color: "text.secondary" }}>
            Reminders and due dates are scheduled in this timezone
          </Typography>
         <TextField
  select
  fullWidth
  value={formData.businessTimeZone || ""}
  onChange={(e) =>
    onFieldChange("businessTimeZone", e.target.value)
  }
  SelectProps={{ displayEmpty: true }}
>
  {BUSINESS_TIME_ZONE_OPTIONS.map((option) => (
    <MenuItem key={option.value} value={option.value}>
      {option.label}
    </MenuItem>
  ))}
</TextField>
        </Box> 

        {/* 5. Optional Accordion — Owner, Email, Address */}
        <Accordion
          elevation={0}
          sx={{
            border: "1px solid",
            borderColor: "divider",
            borderRadius: "8px !important",
            "&:before": { display: "none" },
            "&.Mui-expanded": { mt: 0 },
            mb: 3,
          }}
        >
          <AccordionSummary
            expandIcon={<ExpandMoreIcon sx={{ color: "text.secondary" }} />}
            sx={{
              px: 2,
              minHeight: 56,
              "& .MuiAccordionSummary-content": { my: 1 },
            }}
          >
            <Typography variant="body2" color="text.secondary">
              Owner, email, full address — same fields as business profile
            </Typography>
          </AccordionSummary>

          <AccordionDetails
            sx={{
              px: 2,
              pb: 3,
              pt: 1,
              display: "flex",
              flexDirection: "column",
              gap: 2.5,
            }}
          >
            {/* Owner Name */}
            <Box>
              <Typography
                sx={{ mb: 0.75, fontWeight: 500, fontSize: "0.875rem" }}
              >
                Owner name
              </Typography>
              <TextField
                fullWidth
                value={formData.ownerName || ""}
                onChange={(e) => onFieldChange("ownerName", e.target.value)}
                placeholder="Optional"
              />
            </Box>

            {/* Email */}
            <Box>
              <Typography
                sx={{ mb: 0.75, fontWeight: 500, fontSize: "0.875rem" }}
              >
                Email
              </Typography>
              <TextField
                fullWidth
                value={formData.email || ""}
                onChange={(e) => onFieldChange("email", e.target.value)}
                placeholder="Optional"
                type="email"
              />
            </Box>

            {/* Street / Line 1 */}
            <Box>
              <Typography
                sx={{ mb: 0.75, fontWeight: 500, fontSize: "0.875rem" }}
              >
                Street / line 1
              </Typography>
              <TextField
                fullWidth
                value={formData.address?.line1 || ""}
                onChange={(e) => onAddressChange("line1", e.target.value)}
                placeholder="Building, street"
                multiline
                minRows={2}
                inputProps={{ maxLength: 120 }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment
                      position="end"
                      sx={{ alignSelf: "flex-end", mb: 1 }}
                    >
                      <Typography variant="caption" color="text.secondary">
                        {(formData.address?.line1 || "").length}/120
                      </Typography>
                    </InputAdornment>
                  ),
                }}
              />
            </Box>

            {/* Area / Locality */}
            <Box>
              <Typography
                sx={{ mb: 0.75, fontWeight: 500, fontSize: "0.875rem" }}
              >
                Area / locality
              </Typography>
              <TextField
                fullWidth
                value={formData.address?.area || ""}
                onChange={(e) => onAddressChange("area", e.target.value)}
                placeholder="Optional"
              />
            </Box>
            {/* Colony */}
           {/*   <Box>
              <Typography
                sx={{ mb: 0.75, fontWeight: 500, fontSize: "0.875rem" }}
              >
               Colony
              </Typography>
              <TextField
                fullWidth
                value={formData.address?.colony || ""}
                onChange={(e) => onAddressChange("colony", e.target.value)}
                placeholder="Optional"
              />
            </Box> */}

            {/* City */}
            <Box>
              <Typography
                sx={{ mb: 0.75, fontWeight: 500, fontSize: "0.875rem" }}
              >
                City
              </Typography>
              <TextField
                fullWidth
                value={formData.address?.city || ""}
                onChange={(e) => onAddressChange("city", e.target.value)}
                placeholder="Optional"
              />
            </Box>

            {/* State */}
            <Box>
              <Typography
                sx={{ mb: 0.75, fontWeight: 500, fontSize: "0.875rem" }}
              >
                State
              </Typography>
             <TextField
  select
  fullWidth
  value={formData.address?.state || ""}
  onChange={(e) => onAddressChange("state", e.target.value)}
  SelectProps={{ displayEmpty: true }}
>
  <MenuItem value="">
    <em>Select State</em>
  </MenuItem>

  {INDIAN_STATES.map((state) => (
    <MenuItem key={state} value={state}>
      {state}
    </MenuItem>
  ))}
</TextField>
            </Box>

            {/* Pincode */}
            <Box>
              <Typography
                sx={{ mb: 0.75, fontWeight: 500, fontSize: "0.875rem" }}
              >
                Pincode
              </Typography>
              <TextField
                fullWidth
                value={formData.address?.pincode || ""}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, "").slice(0, 6);
                  onAddressChange("pincode", val);
                }}
                placeholder="Up to 6 characters"
                inputProps={{ maxLength: 6, inputMode: "numeric" }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <Typography variant="caption" color="text.secondary">
                        {(formData.address?.pincode || "").length}/6
                      </Typography>
                    </InputAdornment>
                  ),
                }}
              />
            </Box>

            {/* Country */}
            <Box>
              <Typography
                sx={{ mb: 0.75, fontWeight: 500, fontSize: "0.875rem" }}
              >
                Country
              </Typography>
              <TextField
                fullWidth
                value={formData.address?.country || "IN"}
                onChange={(e) => onAddressChange("country", e.target.value)}
              />
            </Box>
          </AccordionDetails>
        </Accordion>
      </Box>

      {/* Fixed bottom Continue button */}
      <Box sx={{ mt: 3, mb: 2 }}>
        <Button
          onClick={handleSubmitClick}
          disabled={submitting || !isFormValid}
          fullWidth
          size="large"
          variant="contained"
          color="primary"
          sx={{
            py: 1.5,
            fontSize: "1rem",
            fontWeight: 600,
            borderRadius: 2,
          }}
        >
          {submitting ? (
            <CircularProgress size={22} sx={{ color: "#fff" }} />
          ) : (
            "Continue"
          )}
        </Button>
      </Box>
    </Box>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Container,
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  CircularProgress,
  InputAdornment,
  Divider,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Snackbar,
  Alert,
  LinearProgress
} from "@mui/material";
import type { SelectChangeEvent } from "@mui/material/Select";
import BusinessIcon from "@mui/icons-material/Business";
import ReceiptIcon from "@mui/icons-material/Receipt";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { createOrganization } from "@/services/organizationService";
import { useAuth } from "@/context/AuthContext";
import EmailField from "@/components/common/EmailField";
import NameField from "@/components/common/NameField";
import { BillingMeta, OrganizationFormData } from "@/types/organizations";
import {
  INVOICE_PREFERENCES,
  EMPTY_FORM,
  EMPTY_BILLING_META,
} from "@/constants/organizationConstants";
import PhoneInputField from "@/components/common/PhoneInputField";

// ADD these to your existing MUI imports
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

export default function OrganizationForm() {
  const router = useRouter();
  const { refreshAppState } = useAuth();

  const [formData, setFormData] = useState<OrganizationFormData>(EMPTY_FORM);
  const [billingMeta, setBillingMeta] =
    useState<BillingMeta>(EMPTY_BILLING_META);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [submitAttempted, setSubmitAttempted] = useState(false); // ✅ NEW

  // ── Derived validation ───────────────────────────────
const nameRegex = /^[A-Za-z0-9\s&.,'\-()]+$/;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const isNameValid =
    formData.name.trim().length > 0 && nameRegex.test(formData.name.trim());
  const isEmailValid =
    formData.billingEmail.trim().length > 0 &&
    emailRegex.test(formData.billingEmail.trim());
  // const isFormValid = isNameValid && isEmailValid; // ✅ drives button disabled state
  /* const isAddressValid = billingMeta.billingAddress.trim().length > 0;
  const isFormValid = isNameValid && isEmailValid && isAddressValid; */

  const isFormValid = isNameValid && isEmailValid;
  // ── Handlers ────────────────────────────────────────
  const handleBillingMetaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setBillingMeta((prev) => ({ ...prev, [name]: value }));
  };

  const handleInvoicePreferenceChange = (e: SelectChangeEvent) => {
    setBillingMeta((prev) => ({ ...prev, invoicePreference: e.target.value }));
  };

  const handleSubmit = async () => {
    setSubmitAttempted(true); // ✅ forces both fields to show errors if empty

    if (!isFormValid) return; // ✅ block if invalid

    try {
      setSubmitting(true);
      setError("");

      await createOrganization({
        name: formData.name.trim(),
        billingEmail: formData.billingEmail.trim(),
        planKey: "free",
        billingMeta: {
          ...(billingMeta.gstNumber.trim() && {
            gstNumber: billingMeta.gstNumber.trim(),
          }),
          ...(billingMeta.billingAddress.trim() && {
            billingAddress: billingMeta.billingAddress.trim(),
          }),
          ...(billingMeta.invoicePreference && {
            invoicePreference: billingMeta.invoicePreference,
          }),
        },
      });

      setSuccess(true);
      await refreshAppState();
      //setTimeout(() => router.push("/business-create"), 1500);
      setTimeout(() => router.push("/plan-trial"), 1500); // ← only change
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "An unknown error occurred",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ px: { xs: 1.5, sm: 3 } }}>
      <Paper
        elevation={0}
        sx={{
          mt: { xs: 2, sm: 6, md: 8 },
          mb: { xs: 3, sm: 4 },
          borderRadius: 3,
          overflow: "hidden",
          border: "1px solid",
          borderColor: "divider",
          boxShadow: "0 2px 12px rgba(26,47,94,0.10)",
        }}
      >

         {/* Step label */}
              <Box sx={{ px: 3, pt: 1.5, pb: 0.5 }}>
                <Typography variant="body2" color="text.secondary">
                  Step 2 of 3 · Organization
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
        
        <Box sx={{ height: 4, bgcolor: "primary.dark" }} />

        <Box sx={{ p: { xs: 2.5, sm: 3, md: 4 } }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
            <BusinessIcon
              sx={{ color: "primary.dark", fontSize: { xs: 20, sm: 24 } }}
            />
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                color: "primary.dark",
                fontSize: { xs: "0.95rem", sm: "1.1rem" },
              }}
            >
              Create Organization
            </Typography>
          </Box>

          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mb: 3, fontSize: { xs: "0.8rem", sm: "0.875rem" } }}
          >
            Only name and billing email are required. You can add GST and full
            billing address later in organization settings.
          </Typography>

          <Divider sx={{ mb: 3 }} />

          {error && (
            <Alert severity="error" onClose={() => setError("")} sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: { xs: 2, sm: 2.5 },
            }}
          >
            {/* 1. Organization Name */}
            <NameField
              value={formData.name}
              onChange={(value) =>
                setFormData((prev) => ({ ...prev, name: value }))
              }
              label="Organization Name"
              placeholder="Enter your Organization name"
              required
              forceError={submitAttempted} // ✅ triggers error on submit attempt
            />

            {/* 2. Billing Email */}
            <EmailField
              value={formData.billingEmail}
              onChange={(value) =>
                setFormData((prev) => ({ ...prev, billingEmail: value }))
              }
              label="Billing Email"
              placeholder="Enter your billing email"
              required
              forceError={submitAttempted} // ✅ triggers error on submit attempt
            />

            {/* 3-5. Optional Tax & Billing Section */}
            <Accordion
              elevation={0}
              sx={{
                border: "1px solid",
                borderColor: "divider",
                borderRadius: "8px !important",
                "&:before": { display: "none" },
                "&.Mui-expanded": { mt: 0 },
              }}
            >
              <AccordionSummary
                expandIcon={<ExpandMoreIcon sx={{ color: "text.secondary" }} />}
                sx={{
                  px: 2,
                  py: 0.5,
                  minHeight: 56,
                  "& .MuiAccordionSummary-content": { my: 1 },
                }}
              >
                <Box>
                  <Typography
                    sx={{
                      fontWeight: 600,
                      fontSize: "0.95rem",
                      color: "text.primary",
                    }}
                  >
                    Tax & billing address
                    <Typography
                      component="span"
                      sx={{
                        color: "text.secondary",
                        fontWeight: 400,
                        ml: 0.5,
                        fontSize: "0.875rem",
                      }}
                    >
                      (optional)
                    </Typography>
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ fontSize: "0.78rem" }}
                  >
                    GST, address, invoice preference
                  </Typography>
                </Box>
              </AccordionSummary>

              <AccordionDetails
                sx={{
                  px: 2,
                  pb: 2,
                  pt: 0,
                  display: "flex",
                  flexDirection: "column",
                  gap: 2,
                }}
              >
                {/* GST Number */}
                <Box>
                  <Typography
                    sx={{ mb: 0.5, fontWeight: 500, fontSize: "0.875rem" }}
                  >
                    GST Number
                  </Typography>
                  <TextField
                    id="gst-number"
                    fullWidth
                    name="gstNumber"
                    value={billingMeta.gstNumber}
                    onChange={handleBillingMetaChange}
                    placeholder="Enter GST Number"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <ReceiptIcon
                            fontSize="small"
                            sx={{ color: "text.secondary" }}
                          />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Box>

                {/* Billing Address */}
                <Box>
                  <Typography
                    sx={{ mb: 0.5, fontWeight: 500, fontSize: "0.875rem" }}
                  >
                    Billing Address
                  </Typography>
                  <TextField
                    id="billing-address"
                    fullWidth
                    name="billingAddress"
                    value={billingMeta.billingAddress}
                    onChange={handleBillingMetaChange}
                    placeholder="Enter billing address"
                    multiline
                    minRows={2}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment
                          position="start"
                          sx={{ alignSelf: "flex-start", mt: 1.5 }}
                        >
                          <LocationOnIcon
                            fontSize="small"
                            sx={{ color: "text.secondary" }}
                          />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Box>

                {/* Invoice Preference */}
                <FormControl fullWidth>
                  <InputLabel id="invoice-preference-label">
                    Invoice Preference
                  </InputLabel>
                  <Select
                    labelId="invoice-preference-label"
                    id="invoice-preference"
                    value={billingMeta.invoicePreference}
                    label="Invoice Preference"
                    onChange={handleInvoicePreferenceChange}
                  >
                    <MenuItem value="" disabled>
                      Select Invoice Preference
                    </MenuItem>
                    {INVOICE_PREFERENCES.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </AccordionDetails>
            </Accordion>
          </Box>

          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column-reverse", sm: "row" },
              gap: { xs: 1.5, sm: 2 },
              justifyContent: { xs: "stretch", sm: "flex-end" },
              mt: { xs: 3, sm: 4 },
            }}
          >
            <Button
              onClick={() => router.push("/organization")}
              disabled={submitting}
              startIcon={<ArrowBackIcon />}
              variant="outlined"
              color="primary"
              sx={{ width: { xs: "100%", sm: "auto" } }}
            >
              Cancel
            </Button>

            <Button
              onClick={handleSubmit}
              disabled={submitting || !isFormValid}
              variant="contained"
              color="primary"
              fullWidth
              sx={{ minWidth: { sm: 160 }, width: { xs: "100%", sm: "auto" } }}
            >
              {submitting ? (
                <CircularProgress size={20} sx={{ color: "#fff" }} />
              ) : (
                "Create Organization"
              )}
            </Button>
          </Box>
        </Box>
      </Paper>

      <Snackbar
        open={success}
        autoHideDuration={2000}
        onClose={(_, reason) => {
          if (reason === "clickaway") return;
          setSuccess(false);
        }}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity="success" variant="filled" sx={{ width: "100%" }}>
          Organization Created Successfully 🎉
        </Alert>
      </Snackbar>
    </Container>
  );
}

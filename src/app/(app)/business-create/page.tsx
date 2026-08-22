"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Container,
  Box,
  Paper,
  Alert,
  CircularProgress,
  Typography,
} from "@mui/material";
//import BusinessIcon from "@mui/icons-material/Business";
import BusinessForm from "@/components/business/BusinessForm";
import { createBusiness } from "@/services/businessService";
import { getOrganizations } from "@/services/organizationService";
import { useAuth } from "@/context/AuthContext";
import { EMPTY_BUSINESS_FORM } from "../../../constants/businessConstants";
import { BusinessFormData } from "../../../types/business";
import type { CreateBusinessDto } from "@/types/business";  
// ── Component ──────────────────────────────────────────
export default function BusinessCreatePage() {
  const router = useRouter();
  const { refreshAppState } = useAuth();

  const [formData, setFormData] =
    useState<BusinessFormData>(EMPTY_BUSINESS_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [organizationId, setOrganizationId] = useState<string>("");
  const [loadingOrg, setLoadingOrg] = useState(true);

  // ── Fetch organization on mount ──────────────────────
  useEffect(() => {
    const fetchOrg = async () => {
      try {
        const orgs = await getOrganizations();

        // ✅ FIX: redirect if no org exists instead of just showing error
        if (orgs.length === 0) {
          setError(
            "No organization found. Please create an organization first.",
          );
          return;
        }

        setOrganizationId(orgs[0].id);
      } catch {
        setError("Failed to load organization. Please try again.");
      } finally {
        setLoadingOrg(false);
      }
    };

    fetchOrg();
  }, []);

  // ── Handlers ────────────────────────────────────────
  // ── Handlers ────────────────────────────────────────
const handleFieldChange = (field: keyof BusinessFormData, value: string) => {
  setFormData((prev) => ({ ...prev, [field]: value }));
};

const handleAddressChange = (field: string, value: string) => {
  setFormData((prev) => ({
    ...prev,
    address: { ...prev.address, type: "REGISTERED", [field]: value },
  }));
};

const handleSubmit = async () => {
  if (!organizationId) {
    setError("Organization not loaded. Please refresh and try again.");
    return;
  }
  try {
    setSubmitting(true);
    setError("");

    // ✅ phone is already plain 10 digits from the form
    const payload: CreateBusinessDto = {
      name: formData.name.trim(),
      phone: formData.phone,           // "9876543210" — 10 digits
      businessType: formData.businessType,
      // timezone: formData.timezone || "Asia/Kolkata",
       timezone: formData.businessTimeZone || "India(IST)",
      locale: formData.locale || "en-IN",
      uiConfig: {},
      // only include address if at least line1 filled
      ...(formData.address?.line1?.trim() && {
        address: {
          type: "REGISTERED",
          line1: formData.address.line1.trim(),
          ...(formData.address.area && { area: formData.address.area }),
          ...(formData.address.city && { city: formData.address.city }),
          ...(formData.address.state && { state: formData.address.state }),
          ...(formData.address.pincode && { pincode: formData.address.pincode }),
          country: formData.address.country || "IN",
        },
      }),
    };

    await createBusiness(organizationId, payload);
    await refreshAppState();
    router.push("/dashboard");
  } catch (err: unknown) {
    setError(err instanceof Error ? err.message : "Failed to create business");
  } finally {
    setSubmitting(false);
  }
};
  //const handleCancel = () => router.push("/dashboard");

  // ── Loading State ────────────────────────────────────
  // ✅ FIX: show spinner while fetching org — don't render form yet
  if (loadingOrg) {
    return (
      <Container maxWidth="sm" sx={{ px: { xs: 1.5, sm: 3 } }}>
        <Box
          sx={{
            mt: { xs: 6, sm: 10 },
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 2,
          }}
        >
          <CircularProgress size={36} />
          <Typography variant="body2" color="text.secondary">
            Loading organization...
          </Typography>
        </Box>
      </Container>
    );
  }

  // ── Org fetch failed — show error only, no form ──────
  // ✅ FIX: if org failed to load, don't show the form at all
  if (!organizationId && error) {
    return (
      <Container maxWidth="sm" sx={{ px: { xs: 1.5, sm: 3 } }}>
        <Box sx={{ mt: { xs: 4, sm: 8 } }}>
          <Alert
            severity="error"
            action={
              <Typography
                variant="body2"
                sx={{
                  cursor: "pointer",
                  color: "primary.main",
                  fontWeight: 600,
                  whiteSpace: "nowrap",
                }}
                onClick={() => router.push("/organization/create")}
              >
                Create Org
              </Typography>
            }
          >
            {error}
          </Alert>
        </Box>
      </Container>
    );
  }

  // ── Main Render ──────────────────────────────────────
  return (
    <Container
      maxWidth="sm"
      sx={{ px: { xs: 1.5, sm: 3 } }} // ✅ responsive horizontal padding
    >
      <Paper
        elevation={0}
        sx={{
          mt: { xs: 2, sm: 6, md: 8 }, // ✅ FIX: responsive top margin
          mb: { xs: 3, sm: 4 },
          borderRadius: 3,
          overflow: "hidden",
          border: "1px solid",
          borderColor: "divider",
          boxShadow: "0 2px 12px rgba(26,47,94,0.10)",
        }}
      >
        {/* Top accent strip */}
        <Box sx={{ height: 4, bgcolor: "primary.dark" }} />

        <Box sx={{ p: { xs: 2.5, sm: 3, md: 4 } }}>
          {" "}
          {/* ✅ FIX: responsive padding */}
          {/* ✅ Inline error — only for submit errors, not org load errors */}
          {error && (
            <Alert severity="error" onClose={() => setError("")} sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
         <BusinessForm
  formData={formData}
  submitting={submitting}
  onSubmit={handleSubmit}
  onFieldChange={handleFieldChange}
  onAddressChange={handleAddressChange}
/>
        </Box>
      </Paper>
    </Container>
  );
}

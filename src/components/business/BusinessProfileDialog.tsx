"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  Button,
  TextField,
  Box,
  Typography,
  Divider,
  CircularProgress,
  Alert,
  Chip,
  IconButton,
  Stack,
  MenuItem,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import {
  Close as CloseIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Phone as PhoneIcon,
  Business as BusinessIcon,
  Email as EmailIcon,
  Person as PersonIcon,
  Category as CategoryIcon,
  LocationOn as LocationIcon,
  Schedule as TimezoneIcon,
  ExpandMore as ExpandMoreIcon,
} from "@mui/icons-material";
import { getOrganizations } from "@/services/organizationService";
import { getBusinesses, getBusinessById, updateBusiness } from "@/services/businessService";
import { Business, BusinessType, UpdateBusinessDto } from "@/types/business";

const BUSINESS_TYPE_OPTIONS = [
  { value: "OTHER", label: "General / other" },
  { value: "ACCOUNTS", label: "Accounts & Finance" },
  { value: "RETAIL", label: "Retail & Sales" },
  { value: "WHOLESALE", label: "Wholesale" },
  { value: "SERVICE", label: "Services" },
];

// ── Reusable view row ─────────────────────────────────
function InfoRow({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode;
  value: string;
  label: string;
}) {
  const isEmpty = !value || value === "Not provided";
  return (
    <Box sx={{ display: "flex", alignItems: "flex-start", gap: 2, py: 1.5 }}>
      <Box sx={{ color: "text.secondary", mt: 0.25, flexShrink: 0 }}>
        {icon}
      </Box>
      <Box>
        <Typography
          variant="body1"
          fontWeight={isEmpty ? 400 : 600}
          color={isEmpty ? "text.disabled" : "text.primary"}
        >
          {value || "Not provided"}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {label}
        </Typography>
      </Box>
    </Box>
  );
}

interface BusinessProfileDialogProps {
  open: boolean;
  onClose: () => void;
}

export default function BusinessProfileDialog({
  open,
  onClose,
}: BusinessProfileDialogProps) {
  const [business, setBusiness] = useState<Business | null>(null);
  const [orgId, setOrgId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState<UpdateBusinessDto>({});

  useEffect(() => {
    if (open) fetchBusiness();
  }, [open]);

  const fetchBusiness = async () => {
  try {
    setLoading(true);
    setError("");

    // Step 1 — get organizationId
    const orgs = await getOrganizations();
    if (!orgs.length) {
      setError("No organization found.");
      return;
    }
    const organizationId = orgs[0].id;
    setOrgId(organizationId);

    // Step 2 — get businessId from list
    const businesses = await getBusinesses(organizationId);
    if (!businesses.length) {
      setError("No business found.");
      return;
    }
    const businessId = businesses[0].id;

    // Step 3 — get full details by ID (includes settings.uiConfig)
    const biz = await getBusinessById(organizationId, businessId);
    console.log("✅ Business API Response:", JSON.stringify(biz, null, 2));

    setBusiness(biz);
    populateForm(biz);
    setIsEditing(false);
  } catch (err: unknown) {
    setError(err instanceof Error ? err.message : "Failed to load business");
  } finally {
    setLoading(false);
  }
};

  const populateForm = (biz: Business) => {
  setFormData({
    name:         biz.name || "",
    phone:        biz.phone || "",
    businessType: biz.businessType as BusinessType,
    ownerName:    biz.settings?.uiConfig?.ownerName || "",  // ✅ from uiConfig
    email:        biz.settings?.uiConfig?.email || "",      // ✅ from uiConfig
    tags:         biz.tags || [],
    notes:        biz.notes || "",
    isActive:     biz.isActive,
    address: {
      type:    "REGISTERED",
      line1:   biz.address?.line1 || "",
      area:    biz.address?.area || "",
      city:    biz.address?.city || "",
      state:   biz.address?.state || "",
      pincode: biz.address?.pincode || "",
      country: biz.address?.country || "IN",
    },
  });
};

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      address: { ...prev.address, type: "REGISTERED", [name]: value },
    }));
  };

  const handleCancel = () => {
    setIsEditing(false);
    if (business) populateForm(business);
  };

  const handleSave = async () => {
    if (!business) return;
    try {
      setSubmitting(true);
      setError("");

      // ✅ Only send changed fields — PATCH behavior
     const payload: UpdateBusinessDto = {
  ...(formData.name && { name: formData.name }),
  ...(formData.phone && { phone: formData.phone }),
  ...(formData.businessType && { businessType: formData.businessType }),
  ...(formData.notes !== undefined && { notes: formData.notes }),
  ...(formData.address && { address: formData.address }),
  // ✅ send uiConfig with ownerName and email
  uiConfig: {
    ownerName: formData.ownerName || "",
    email:     formData.email || "",
  },
      };
      console.log("📤 PATCH Payload:", JSON.stringify(payload, null, 2));

      await updateBusiness(orgId, business.id, payload);
      await fetchBusiness();
      setIsEditing(false);
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Failed to update business",
      );
    } finally {
      setSubmitting(false);
    }
  };

  // ── Helpers ───────────────────────────────────────
  const getAddressString = (biz: Business) => {
    if (!biz.address) return "";
    return [
      biz.address.line1,
      biz.address.area,
      biz.address.city,
      biz.address.state,
      biz.address.pincode,
      biz.address.country,
    ]
      .filter(Boolean)
      .join(", ");
  };

  const getTypeLabel = (value: string) =>
    BUSINESS_TYPE_OPTIONS.find((o) => o.value === value)?.label || value;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{ sx: { borderRadius: 3 } }}
    >
      {/* ── Header ── */}
      {/* ── Header ── */}
      <Box
        sx={{
          px: 3,
          py: 2,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: "1px solid",
          borderColor: "divider",
        }}
      >
        <Typography variant="h6" fontWeight={700} color="text.primary">
          Business Profile
        </Typography>
        <IconButton
          onClick={onClose}
          size="small"
          sx={{ color: "text.secondary" }}
        >
          <CloseIcon />
        </IconButton>
      </Box>

      <DialogContent sx={{ p: 0 }}>
        {/* Loading */}
        {loading && (
          <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
            <CircularProgress size={32} />
          </Box>
        )}

        {/* Error */}
        {error && (
          <Box sx={{ p: 2 }}>
            <Alert severity="error" onClose={() => setError("")}>
              {error}
            </Alert>
          </Box>
        )}

        {!loading && business && (
          <Box>
            {/* Section title + Edit/Save controls */}
            <Box
              sx={{
                px: 3,
                py: 2,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <Typography variant="subtitle1" fontWeight={700}>
                Business Details
              </Typography>
              {!isEditing ? (
                <Button
                  variant="text"
                  startIcon={<EditIcon fontSize="small" />}
                  size="small"
                  onClick={() => setIsEditing(true)}
                  sx={{ color: "primary.main", fontWeight: 600 }}
                >
                  Edit
                </Button>
              ) : (
                <Stack direction="row" spacing={1}>
                  <Button
                    variant="text"
                    startIcon={<CancelIcon fontSize="small" />}
                    size="small"
                    onClick={handleCancel}
                    disabled={submitting}
                    sx={{ color: "text.secondary" }}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="contained"
                    startIcon={<SaveIcon fontSize="small" />}
                    size="small"
                    onClick={handleSave}
                    disabled={submitting}
                    color="primary"
                  >
                    {submitting ? (
                      <CircularProgress size={16} sx={{ color: "#fff" }} />
                    ) : (
                      "Save"
                    )}
                  </Button>
                </Stack>
              )}
            </Box>

            <Divider />

            {/* ════════════ VIEW MODE ════════════ */}
            {!isEditing && (
              <Box sx={{ px: 3, py: 1 }}>
                <InfoRow
                  icon={<BusinessIcon fontSize="small" />}
                  value={business.name}
                  label="Business Name"
                />
                <Divider />
                <InfoRow
                  icon={<PersonIcon fontSize="small" />}
                  value={business.settings?.uiConfig?.ownerName || ""}
                  label="Owner Name"
                />
                <Divider />
                <InfoRow
                  icon={<EmailIcon fontSize="small" />}
                 value={business.settings?.uiConfig?.email || ""}
                  label="Business Email"
                />
                <Divider />
                <InfoRow
                  icon={<PhoneIcon fontSize="small" />}
                  value={business.phone}
                  label="Business Phone"
                />
                <Divider />
                <InfoRow
                  icon={<CategoryIcon fontSize="small" />}
                  value={getTypeLabel(business.businessType)}
                  label="Business Category"
                />
                <Divider />
                <InfoRow
                  icon={<LocationIcon fontSize="small" />}
                  value={getAddressString(business)}
                  label="Business Address"
                />
                <Divider />
                <InfoRow
                  icon={<TimezoneIcon fontSize="small" />}
                  value={business.settings?.timezone || "Asia/Kolkata"}
                  label="Timezone"
                />
                <Divider />
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 2,
                    py: 1.5,
                  }}
                >
                  <Box sx={{ color: "text.secondary", flexShrink: 0 }}>
                    <BusinessIcon fontSize="small" />
                  </Box>
                  <Box>
                    <Chip
                      label={business.isActive ? "Active" : "Inactive"}
                      color={business.isActive ? "success" : "default"}
                      size="small"
                    />
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mt: 0.25 }}
                    >
                      Status
                    </Typography>
                  </Box>
                </Box>
              </Box>
            )}

            {/* ════════════ EDIT MODE ════════════ */}
            {isEditing && (
              <Box
                sx={{
                  px: 3,
                  py: 2.5,
                  display: "flex",
                  flexDirection: "column",
                  gap: 2.5,
                }}
              >
                {/* Business Name */}
                <Box>
                  <Typography
                    sx={{ mb: 0.75, fontWeight: 500, fontSize: "0.875rem" }}
                  >
                    Business Name
                    <Typography
                      component="span"
                      color="error.main"
                      sx={{ ml: 0.5 }}
                    >
                      *
                    </Typography>
                  </Typography>
                  <TextField
                    fullWidth
                    size="small"
                    name="name"
                    value={formData.name || ""}
                    onChange={handleInputChange}
                    placeholder="Sri & Associates"
                  />
                </Box>

                {/* Owner Name */}
                <Box>
                  <Typography sx={{ mb: 0.75, fontWeight: 500, fontSize: '0.875rem' }}>
                    Owner Name
                  </Typography>
                  <TextField
                    fullWidth size="small"
                    name="ownerName"
                    value={formData.ownerName || ''}
                    onChange={handleInputChange}
                    placeholder="Optional"
                  />
                </Box>

                {/* Email */}
                <Box>
                  <Typography sx={{ mb: 0.75, fontWeight: 500, fontSize: '0.875rem' }}>
                    Email
                  </Typography>
                  <TextField
                    fullWidth size="small"
                    name="email"
                    type="email"
                    value={formData.email || ''}
                    onChange={handleInputChange}
                    placeholder="Optional"
                  />
                </Box> 

                {/* Phone */}
                <Box>
                  <Typography
                    sx={{ mb: 0.75, fontWeight: 500, fontSize: "0.875rem" }}
                  >
                    Phone
                    <Typography
                      component="span"
                      color="error.main"
                      sx={{ ml: 0.5 }}
                    >
                      *
                    </Typography>
                  </Typography>
                  <TextField
                    fullWidth
                    size="small"
                    name="phone"
                    value={formData.phone || ""}
                    onChange={(e) => {
                      const val = e.target.value
                        .replace(/\D/g, "")
                        .slice(0, 10);
                      setFormData((prev) => ({ ...prev, phone: val }));
                    }}
                    placeholder="10-digit mobile"
                    inputProps={{ maxLength: 10, inputMode: "numeric" }}
                    InputProps={{
                      endAdornment: (
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{ pr: 1 }}
                        >
                          {(formData.phone || "").length}/10
                        </Typography>
                      ),
                    }}
                  />
                </Box>

                {/* Business Category */}
                <Box>
                  <Typography
                    sx={{ mb: 0.75, fontWeight: 500, fontSize: "0.875rem" }}
                  >
                    Business Category
                  </Typography>
                  <TextField
                    select
                    fullWidth
                    size="small"
                    name="businessType"
                    value={formData.businessType || "OTHER"}
                    onChange={handleInputChange}
                  >
                    {BUSINESS_TYPE_OPTIONS.map(({ value, label }) => (
                      <MenuItem key={value} value={value}>
                        {label}
                      </MenuItem>
                    ))}
                  </TextField>
                </Box>

                {/* Address Accordion */}
                <Accordion
                  elevation={0}
                  sx={{
                    border: "1px solid",
                    borderColor: "divider",
                    borderRadius: "8px !important",
                    "&:before": { display: "none" },
                  }}
                >
                  <AccordionSummary
                    expandIcon={
                      <ExpandMoreIcon sx={{ color: "text.secondary" }} />
                    }
                    sx={{ px: 2, minHeight: 48 }}
                  >
                    <Typography variant="body2" color="text.secondary">
                      Address details
                    </Typography>
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
                    <Box>
                      <Typography
                        sx={{ mb: 0.5, fontWeight: 500, fontSize: "0.8rem" }}
                      >
                        Street / line 1
                      </Typography>
                      <TextField
                        fullWidth
                        size="small"
                        name="line1"
                        value={formData.address?.line1 || ""}
                        onChange={handleAddressChange}
                        placeholder="Building, street"
                      />
                    </Box>

                    <Box>
                      <Typography
                        sx={{ mb: 0.5, fontWeight: 500, fontSize: "0.8rem" }}
                      >
                        Area / locality
                      </Typography>
                      <TextField
                        fullWidth
                        size="small"
                        name="area"
                        value={formData.address?.area || ""}
                        onChange={handleAddressChange}
                        placeholder="Optional"
                      />
                    </Box>

                    <Box>
                      <Typography
                        sx={{ mb: 0.5, fontWeight: 500, fontSize: "0.8rem" }}
                      >
                        City
                      </Typography>
                      <TextField
                        fullWidth
                        size="small"
                        name="city"
                        value={formData.address?.city || ""}
                        onChange={handleAddressChange}
                        placeholder="Optional"
                      />
                    </Box>

                    <Box>
                      <Typography
                        sx={{ mb: 0.5, fontWeight: 500, fontSize: "0.8rem" }}
                      >
                        State
                      </Typography>
                      <TextField
                        fullWidth
                        size="small"
                        name="state"
                        value={formData.address?.state || ""}
                        onChange={handleAddressChange}
                        placeholder="Optional"
                      />
                    </Box>

                    <Box>
                      <Typography
                        sx={{ mb: 0.5, fontWeight: 500, fontSize: "0.8rem" }}
                      >
                        Pincode
                      </Typography>
                      <TextField
                        fullWidth
                        size="small"
                        name="pincode"
                        value={formData.address?.pincode || ""}
                        onChange={(e) => {
                          const val = e.target.value
                            .replace(/\D/g, "")
                            .slice(0, 6);
                          setFormData((prev) => ({
                            ...prev,
                            address: {
                              ...prev.address,
                              type: "REGISTERED",
                              pincode: val,
                            },
                          }));
                        }}
                        placeholder="Up to 6 characters"
                        inputProps={{ maxLength: 6 }}
                        InputProps={{
                          endAdornment: (
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              sx={{ pr: 1 }}
                            >
                              {(formData.address?.pincode || "").length}/6
                            </Typography>
                          ),
                        }}
                      />
                    </Box>

                    <Box>
                      <Typography
                        sx={{ mb: 0.5, fontWeight: 500, fontSize: "0.8rem" }}
                      >
                        Country
                      </Typography>
                      <TextField
                        fullWidth
                        size="small"
                        name="country"
                        value={formData.address?.country || "IN"}
                        onChange={handleAddressChange}
                      />
                    </Box>
                  </AccordionDetails>
                </Accordion>

                {/* Notes */}
                <Box>
                  <Typography
                    sx={{ mb: 0.75, fontWeight: 500, fontSize: "0.875rem" }}
                  >
                    Notes
                  </Typography>
                  <TextField
                    fullWidth
                    size="small"
                    name="notes"
                    value={formData.notes || ""}
                    onChange={handleInputChange}
                    placeholder="Optional notes"
                    multiline
                    rows={2}
                  />
                </Box>
              </Box>
            )}
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
}

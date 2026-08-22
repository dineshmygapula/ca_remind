'use client';

import { useState, useEffect } from 'react';
import {
  Box, Paper, Typography, TextField, Button,
  CircularProgress, Alert, Grid, Divider,
  Avatar, Stack, Chip, MenuItem,
} from '@mui/material';
import {
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Business as BusinessIcon,
  Phone as PhoneIcon,
} from '@mui/icons-material';
import { getOrganizations } from '@/services/organizationService';
import { getBusinesses, updateBusiness } from '@/services/businessService';
import { Business, BusinessType, UpdateBusinessDto } from '@/types/business';

const BUSINESS_TYPE_OPTIONS: BusinessType[] = [
  'ACCOUNTS', 'RETAIL', 'WHOLESALE', 'SERVICE', 'OTHER',
];

export default function BusinessProfilePage() {
  const [business, setBusiness]         = useState<Business | null>(null);
  const [orgId, setOrgId]               = useState('');
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState('');
  const [isEditing, setIsEditing]       = useState(false);
  const [submitting, setSubmitting]     = useState(false);
  const [formData, setFormData]         = useState<UpdateBusinessDto>({
    name: '', phone: '', businessType: 'ACCOUNTS',
    tags: [], notes: '', isActive: true,
  });

  // ─── Fetch on mount ───────────────────────────────────────────────────────
  useEffect(() => {
    fetchBusiness();
  }, []);

  const fetchBusiness = async () => {
    try {
      setLoading(true);
      setError('');

      // Step 1 — get the only org
      const orgs = await getOrganizations();
      if (orgs.length === 0) {
        setError('No organization found.');
        return;
      }
      const organizationId = orgs[0].id;
      setOrgId(organizationId);

      // Step 2 — get the only business
      const businesses = await getBusinesses(organizationId);
      if (businesses.length === 0) {
        setError('No business found.');
        return;
      }
      const biz = businesses[0];
      setBusiness(biz);

      // Step 3 — pre-fill form
      setFormData({
        name: biz.name || '',
        phone: biz.phone || '',
        businessType: biz.businessType as BusinessType,
        tags: biz.tags || [],
        notes: biz.notes || '',
        isActive: biz.isActive,
      });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load business');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCancel = () => {
    setIsEditing(false);
    if (business) {
      setFormData({
        name: business.name || '',
        phone: business.phone || '',
        businessType: business.businessType as BusinessType,
        tags: business.tags || [],
        notes: business.notes || '',
        isActive: business.isActive,
      });
    }
  };

  const handleSave = async () => {
    if (!business) return;
    try {
      setSubmitting(true);
      setError('');
      await updateBusiness(orgId, business.id, formData);

      // Wait briefly then refresh
      await new Promise((r) => setTimeout(r, 400));
      await fetchBusiness();
      setIsEditing(false);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to update business');
    } finally {
      setSubmitting(false);
    }
  };

  // ─── Loading state ────────────────────────────────────────────────────────
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}>
        <CircularProgress sx={{ color: '#0b1f3a' }} />
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 700, mx: 'auto', mt: 6, px: 2 }}>

      {/* ── Header Card ── */}
      <Paper elevation={3} sx={{ borderRadius: 2, overflow: 'hidden', mb: 3 }}>
        {/* Navy accent strip */}
        <Box sx={{ height: 4, bgcolor: '#0b1f3a' }} />

        <Box sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar sx={{ width: 64, height: 64, bgcolor: '#0b1f3a', fontSize: '1.8rem' }}>
            <BusinessIcon fontSize="large" />
          </Avatar>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h6" fontWeight={700} color="#0b1f3a">
              {business?.name || '—'}
            </Typography>
            <Stack direction="row" spacing={1} sx={{ mt: 0.5 }} alignItems="center">
              <PhoneIcon fontSize="small" sx={{ color: 'text.secondary' }} />
              <Typography variant="body2" color="text.secondary">
                {business?.phone || '—'}
              </Typography>
              <Chip
                label={business?.isActive ? 'Active' : 'Inactive'}
                color={business?.isActive ? 'success' : 'default'}
                size="small"
              />
            </Stack>
          </Box>
        </Box>
      </Paper>

      {/* ── Details Card ── */}
      <Paper elevation={3} sx={{ borderRadius: 2, overflow: 'hidden' }}>
        <Box sx={{ height: 4, bgcolor: '#0b1f3a' }} />
        <Box sx={{ p: 3 }}>

          {error && (
            <Alert severity="error" onClose={() => setError('')} sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {/* Edit / Save / Cancel controls */}
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
            {!isEditing ? (
              <Button
                variant="outlined"
                startIcon={<EditIcon />}
                size="small"
                onClick={() => setIsEditing(true)}
                sx={{
                  textTransform: 'none',
                  borderColor: '#0b1f3a',
                  color: '#0b1f3a',
                }}
              >
                Edit Business
              </Button>
            ) : (
              <Stack direction="row" spacing={1}>
                <Button
                  startIcon={<CancelIcon />}
                  onClick={handleCancel}
                  disabled={submitting}
                  size="small"
                  sx={{ textTransform: 'none' }}
                >
                  Cancel
                </Button>
                <Button
                  variant="contained"
                  startIcon={<SaveIcon />}
                  onClick={handleSave}
                  disabled={submitting}
                  size="small"
                  sx={{
                    textTransform: 'none',
                    bgcolor: '#0b1f3a',
                    '&:hover': { bgcolor: '#112a4e' },
                  }}
                >
                  {submitting ? <CircularProgress size={18} sx={{ color: '#fff' }} /> : 'Save'}
                </Button>
              </Stack>
            )}
          </Box>

          <Divider sx={{ mb: 3 }} />

          {/* Form Fields */}
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Business Name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                disabled={!isEditing}
                size="small"
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Phone Number"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                disabled={!isEditing}
                size="small"
                InputProps={{
                  startAdornment: (
                    <PhoneIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                  ),
                }}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                select
                fullWidth
                label="Business Type"
                name="businessType"
                value={formData.businessType}
                onChange={handleInputChange}
                disabled={!isEditing}
                size="small"
              >
                {BUSINESS_TYPE_OPTIONS.map((type) => (
                  <MenuItem key={type} value={type}>
                    {type}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Notes"
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                disabled={!isEditing}
                size="small"
              />
            </Grid>

            {/* Read-only fields */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Organization ID"
                value={business?.organizationId || '—'}
                disabled
                size="small"
                helperText="Cannot be changed"
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Business ID"
                value={business?.id || '—'}
                disabled
                size="small"
                helperText="Cannot be changed"
              />
            </Grid>
          </Grid>

        </Box>
      </Paper>
    </Box>
  );
}
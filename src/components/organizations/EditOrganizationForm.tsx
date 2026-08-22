'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  CircularProgress,
  Alert,
} from '@mui/material';
import { UpdateOrganizationDto, Organization } from '@/types/organizations';
import { getOrganizationById, updateOrganization } from '@/services/organizationService';

interface EditOrganizationFormProps {
  organizationId: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function EditOrganizationForm({
  organizationId,
  onSuccess,
  onCancel,
}: EditOrganizationFormProps) {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [organization, setOrganization] = useState<Organization | null>(null);
  
  const [formData, setFormData] = useState<UpdateOrganizationDto>({
    name: '',
    billingEmail: '',
  });

  useEffect(() => {
    fetchOrganization();
  }, [organizationId]);

  const fetchOrganization = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await getOrganizationById(organizationId);
      setOrganization(data);
      
      // Pre-fill form
      setFormData({
        name: data.name,
        billingEmail: data.billingEmail,
      });
    } catch (err: unknown) {
      console.error('❌ Error fetching organization:', err);
      setError(err instanceof Error ? err.message : 'Failed to load organization');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      setError('');

      const payload: UpdateOrganizationDto = {
        name: formData.name,
        billingEmail: formData.billingEmail,
        billingMeta: {}, // Include empty object as per API spec
      };

      console.log('📤 Updating organization:', JSON.stringify(payload, null, 2));

      await updateOrganization(organizationId, payload);

      console.log('✅ Organization updated successfully');
      onSuccess();
    } catch (err: unknown) {
      console.error('❌ Update organization error:', err);
      setError(err instanceof Error ? err.message : 'Failed to update organization');
    } finally {
      setSubmitting(false);
    }
  };

  const isFormValid = Boolean(formData.name) && Boolean(formData.billingEmail);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Edit Organization
      </Typography>

      {error && (
        <Alert severity="error" onClose={() => setError('')} sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {organization && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
          {/* Organization Name */}
          <TextField
            label="Organization Name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            fullWidth
            required
            size="small"
          />

          {/* Billing Email */}
          <TextField
            label="Billing Email"
            name="billingEmail"
            type="email"
            value={formData.billingEmail}
            onChange={handleInputChange}
            fullWidth
            required
            size="small"
          />

          {/* Read-only Info */}
          <Box sx={{ p: 2, bgcolor: '#f8fafc', borderRadius: 1 }}>
            <Typography variant="caption" color="text.secondary" display="block">
              Plan: {organization.planKey}
            </Typography>
            <Typography variant="caption" color="text.secondary" display="block">
              Organization ID: {organization.id}
            </Typography>
          </Box>

          {/* Action Buttons */}
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 1 }}>
            <Button onClick={onCancel} disabled={submitting}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              variant="contained"
              disabled={submitting || !isFormValid}
              startIcon={submitting ? <CircularProgress size={20} /> : null}
            >
              {submitting ? 'Updating...' : 'Update'}
            </Button>
          </Box>
        </Box>
      )}
    </Box>
  );
}
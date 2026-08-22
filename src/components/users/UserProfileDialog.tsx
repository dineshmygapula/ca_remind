'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  Button,
  TextField,
  Grid,
  Box,
  Avatar,
  Typography,
  Divider,
  CircularProgress,
  Alert,
  Chip,
  IconButton,
  Stack,
  Paper,
} from '@mui/material';
import {
  Close as CloseIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  Badge as BadgeIcon,
  //Person as PersonIcon,
  CalendarToday as CalendarIcon,
} from '@mui/icons-material';
import { getCurrentUser, updateUser } from '@/services/userService';
import { User, UpdateUserDto } from '@/types/user';

interface UserProfileDialogProps {
  open: boolean;
  onClose: () => void;
}

// ─── Local form shape — all required strings (no undefined) ──────────────────
interface UserFormData {
  //username: string;
  firstName: string;
  lastName: string;
  mobileNumber: string;
}

export default function UserProfileDialog({ open, onClose }: UserProfileDialogProps) {
  const [user, setUser]             = useState<User | null>(null);
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState('');
  const [isEditing, setIsEditing]   = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // ✅ Use local form interface — all fields are required strings, no undefined
  const [formData, setFormData] = useState<UserFormData>({
    //username:     '',
    firstName:    '',
    lastName:     '',
    mobileNumber: '',
  });

  // ─── Fetch when dialog opens ──────────────────────────────────────────────
  useEffect(() => {
    if (open) fetchUserProfile();
  }, [open]);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await getCurrentUser();
      setUser(data);
      setFormData({
       // username:     data.username     || '',
        firstName:    data.firstName    || '',
        lastName:     data.lastName     || '',
        mobileNumber: data.mobileNumber || '',
      });
      setIsEditing(false);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load profile');
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
    if (user) {
      setFormData({
      //  username:     user.username     || '',
        firstName:    user.firstName    || '',
        lastName:     user.lastName     || '',
        mobileNumber: user.mobileNumber || '',
      });
    }
  };

  const handleSave = async () => {
    // ✅ Safe — formData.mobileNumber is always string, never undefined
    if (formData.mobileNumber.length > 0 && formData.mobileNumber.length !== 10) {
      setError('Mobile number must be exactly 10 digits');
      return;
    }

    try {
      setSubmitting(true);
      setError('');

      // Only send fields that have values
      const dto: UpdateUserDto = {
       // ...(formData.username     && { username:     formData.username }),
        ...(formData.firstName    && { firstName:    formData.firstName }),
        ...(formData.lastName     && { lastName:     formData.lastName }),
        ...(formData.mobileNumber && { mobileNumber: formData.mobileNumber }),
      };

      await updateUser(dto);
      await new Promise((r) => setTimeout(r, 400));
      await fetchUserProfile();
      setIsEditing(false);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to update profile');
    } finally {
      setSubmitting(false);
    }
  };

  const getUserInitials = () => {
    if (!user) return '?';
    const first = user.firstName?.[0] || user.username?.[0] || '';
    const last  = user.lastName?.[0]  || '';
    return `${first}${last}`.toUpperCase() || '?';
  };

  const getFullName = () => {
    if (!user) return '';
    const parts = [user.firstName, user.lastName].filter(Boolean);
    return parts.length > 0 ? parts.join(' ') : user.username;
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '—';
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric', month: 'long', day: 'numeric',
    });
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          mt: 8,
          alignSelf: 'flex-start',
        },
      }}
    >
      {/* ── Header ── */}
      <Box sx={{ bgcolor: '#0b1f3a', color: 'white', p: 3, position: 'relative' }}>
        <IconButton
          onClick={onClose}
          sx={{ position: 'absolute', right: 8, top: 8, color: 'white' }}
        >
          <CloseIcon />
        </IconButton>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
            <CircularProgress sx={{ color: 'white' }} />
          </Box>
        ) : user ? (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar
              sx={{
                width: 64,
                height: 64,
                fontSize: '1.6rem',
                bgcolor: 'rgba(255,255,255,0.15)',
                border: '2px solid rgba(255,255,255,0.4)',
              }}
            >
              {getUserInitials()}
            </Avatar>
            <Box>
              <Typography variant="h6" fontWeight={700}>
                {getFullName()}
              </Typography>
              <Stack direction="row" spacing={0.5} alignItems="center" sx={{ mt: 0.5 }}>
                <EmailIcon fontSize="small" sx={{ opacity: 0.8 }} />
                <Typography variant="body2" sx={{ opacity: 0.85 }}>
                  {user.email}
                </Typography>
              </Stack>
              <Stack direction="row" spacing={0.5} alignItems="center" sx={{ mt: 0.4 }}>
                <BadgeIcon sx={{ opacity: 0.7, fontSize: '0.9rem' }} />
                <Typography variant="caption" sx={{ opacity: 0.75 }}>
                  @{user.username}
                </Typography>
              </Stack>
            </Box>
          </Box>
        ) : null}
      </Box>

      <DialogContent sx={{ p: 3 }}>
        {error && (
          <Alert severity="error" onClose={() => setError('')} sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {user && (
          <Box>
            {/* ── Edit Controls ── */}
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
                  Edit Profile
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
                    {submitting
                      ? <CircularProgress size={18} sx={{ color: '#fff' }} />
                      : 'Save'
                    }
                  </Button>
                </Stack>
              )}
            </Box>

            <Divider sx={{ mb: 3 }} />

            {/* ── Two Column Layout ── */}
            <Grid container spacing={3}>

              {/* LEFT — Personal Info */}
              <Grid size={{ xs: 12, sm: 6 }}>
                <Paper elevation={0} sx={{ p: 2, bgcolor: 'grey.50', height: '100%' }}>
                  <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                    Personal Information
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>

                   {/*  <TextField
                      label="Username"
                      name="username"
                      value={formData.username}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      fullWidth
                      size="small"
                      InputProps={{
                        startAdornment: (
                          <PersonIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                        ),
                      }}
                    />
 */}
                    <TextField
                      label="First Name"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      fullWidth
                      size="small"
                    />

                    <TextField
                      label="Last Name"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      fullWidth
                      size="small"
                    />

                    {/* ✅ Mobile — numeric only, max 10 digits */}
                    <TextField
                      label="Mobile Number"
                      name="mobileNumber"
                      value={formData.mobileNumber}
                      onChange={(e) => {
                        const numeric = e.target.value.replace(/[^0-9]/g, '').slice(0, 10);
                        setFormData((prev) => ({ ...prev, mobileNumber: numeric }));
                      }}
                      disabled={!isEditing}
                      fullWidth
                      size="small"
                      slotProps={{
                        input: {
                          maxLength: 10,
                          startAdornment: (
                            <PhoneIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                          ),
                        },
                      }}
                      error={
                        isEditing &&
                        formData.mobileNumber.length > 0 &&
                        formData.mobileNumber.length < 10
                      }
                      helperText={
                        isEditing
                          ? formData.mobileNumber.length > 0 &&
                            formData.mobileNumber.length < 10
                            ? `${formData.mobileNumber.length}/10 digits`
                            : 'Enter 10 digit mobile number'
                          : undefined
                      }
                    />

                    {/* Email — always read only */}
                    <TextField
                      label="Email"
                      value={user.email}
                      disabled
                      fullWidth
                      size="small"
                      helperText="Email cannot be changed"
                      slotProps={{
                        input: {
                          startAdornment: (
                            <EmailIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                          ),
                        },
                      }}
                    />

                  </Box>
                </Paper>
              </Grid>

              {/* RIGHT — Subscription + Account Info */}
              <Grid size={{ xs: 12, sm: 6 }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>

                  {/* Subscription */}
                  {user.razorpaySubscriptionData && (
                    <Paper elevation={0} sx={{ p: 2, bgcolor: 'grey.50' }}>
                      <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600 }}>
                        Subscription
                      </Typography>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mt: 1 }}>

                        <Box>
                          <Typography variant="caption" color="text.secondary">
                            Status
                          </Typography>
                          <Box sx={{ mt: 0.5 }}>
                            <Chip
                              label={user.razorpaySubscriptionData.subscriptionStatus.toUpperCase()}
                              color={
                                user.razorpaySubscriptionData.subscriptionStatus === 'active'
                                  ? 'success'
                                  : user.razorpaySubscriptionData.subscriptionStatus === 'created'
                                  ? 'info'
                                  : 'default'
                              }
                              size="small"
                            />
                          </Box>
                        </Box>

                        <Box>
                          <Typography variant="caption" color="text.secondary">
                            Plan
                          </Typography>
                          <Typography variant="body2" sx={{ mt: 0.3, fontWeight: 500 }}>
                            {user.razorpaySubscriptionData.planName || '—'}
                          </Typography>
                        </Box>

                        <Box>
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
                          >
                            <CalendarIcon sx={{ fontSize: '0.85rem' }} />
                            Next Billing Date
                          </Typography>
                          <Typography variant="body2" sx={{ mt: 0.3, fontWeight: 500 }}>
                            {formatDate(user.razorpaySubscriptionData.nextBillingDate)}
                          </Typography>
                        </Box>

                        <Box>
                          <Typography variant="caption" color="text.secondary">
                            Payment Status
                          </Typography>
                          <Box sx={{ mt: 0.5 }}>
                            <Chip
                              label={user.razorpaySubscriptionData.paymentStatus || '—'}
                              size="small"
                              sx={{ bgcolor: '#0b1f3a', color: 'white' }}
                            />
                          </Box>
                        </Box>

                      </Box>
                    </Paper>
                  )}

                  {/* Account Info */}
                  <Paper elevation={0} sx={{ p: 2, bgcolor: 'grey.50' }}>
                    <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600 }}>
                      Account Information
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mt: 1 }}>
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Member Since
                        </Typography>
                        <Typography variant="body2" sx={{ mt: 0.3, fontWeight: 500 }}>
                          {formatDate(user.createdAt)}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Last Updated
                        </Typography>
                        <Typography variant="body2" sx={{ mt: 0.3, fontWeight: 500 }}>
                          {formatDate(user.updatedAt)}
                        </Typography>
                      </Box>
                    </Box>
                  </Paper>

                </Box>
              </Grid>

            </Grid>
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
}
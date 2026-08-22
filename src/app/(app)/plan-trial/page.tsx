'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Container,
  Box,
  Typography,
  Button,
  LinearProgress,
  CircularProgress,
  Alert,
} from '@mui/material';
import EmojiEventsOutlinedIcon from '@mui/icons-material/EmojiEventsOutlined';
import { getOrganizations } from '@/services/organizationService';

export default function PlanTrialPage() {
  const router = useRouter();

  const [organizationId, setOrganizationId] = useState<string>('');
  const [loadingOrg, setLoadingOrg] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchOrg = async () => {
      try {
        const orgs = await getOrganizations();
        if (orgs.length === 0) {
          setError('No organization found. Please create an organization first.');
          return;
        }
        setOrganizationId(orgs[0].id);
      } catch {
        setError('Failed to load organization. Please try again.');
      } finally {
        setLoadingOrg(false);
      }
    };

    fetchOrg();
  }, []);

  const handleViewPlans = () => {
    router.push('/subscription');
  };

  const handleContinueToBusiness = () => {
    router.push('/business-create');
  };

  // ── Loading ──────────────────────────────────────────
  if (loadingOrg) {
    return (
      <Container maxWidth="sm">
        <Box sx={{ mt: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
          <CircularProgress size={36} />
          <Typography variant="body2" color="text.secondary">
            Loading...
          </Typography>
        </Box>
      </Container>
    );
  }

  // ── Org load failed ──────────────────────────────────
  if (!organizationId && error) {
    return (
      <Container maxWidth="sm">
        <Box sx={{ mt: 6 }}>
          <Alert
            severity="error"
            action={
              <Typography
                variant="body2"
                sx={{ cursor: 'pointer', color: 'primary.main', fontWeight: 600, whiteSpace: 'nowrap' }}
                onClick={() => router.push('/organization-create')}
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
    <Box sx={{ minHeight: '100vh', backgroundColor: 'background.default', display: 'flex', flexDirection: 'column' }}>

      {/* Progress bar — uses primary.main from theme by default */}
      <LinearProgress
        variant="determinate"
        value={66}
        sx={{ height: 4 }}
      />

      {/* Step label */}
      <Box sx={{ px: 3, pt: 1.5 }}>
        <Typography variant="body2" color="text.secondary">
          Step 2 of 3 · Organization
        </Typography>
      </Box>

      {/* Main content */}
      <Container maxWidth="sm" sx={{ flex: 1, display: 'flex', flexDirection: 'column', pt: 5, pb: 4 }}>

        {/* Badge icon — uses primary.main from theme */}
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
          <Box
            sx={{
              width: 80,
              height: 80,
              borderRadius: '50%',
              border: '3px solid',
              borderColor: 'primary.main',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <EmojiEventsOutlinedIcon sx={{ fontSize: 44, color: 'primary.main' }} />
          </Box>
        </Box>

        {/* Title — h5 from theme provides fontWeight: 600, fontSize: 1.2rem */}
        <Typography variant="h5" gutterBottom>
          You're on the Free plan
        </Typography>

        {/* Description — body1 from theme provides fontSize: 0.95rem, color: #334155 */}
        <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.7, mb: 5 }}>
          Your organization starts on Free. You can explore paid plans or start a free
          trial anytime from the next screen—or skip and finish setting up your first
          business.
        </Typography>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>

          {/* Primary button — uses MuiButton contained styles from theme */}
          <Button
            variant="contained"
            size="large"
            fullWidth
            onClick={handleViewPlans}
          >
            View plans &amp; trial
          </Button>

          {/* Outlined button — uses MuiButton outlined styles from theme */}
          <Button
            variant="outlined"
            size="large"
            fullWidth
            onClick={handleContinueToBusiness}
          >
            Continue to business
          </Button>

        </Box>
      </Container>
    </Box>
  );
}

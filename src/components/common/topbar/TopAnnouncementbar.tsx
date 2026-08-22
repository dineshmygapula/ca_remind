'use client';

import { useRouter } from 'next/navigation';
import { Box, Button, Typography } from '@mui/material';
import { useSubscription } from '@/context/SubscriptionContext';

export default function TopAnnouncementBar() {
  const router = useRouter();
  const { announcementMessage, subscription, isTrialActive } = useSubscription();

  // Show Upgrade Now only when on trial or no active paid plan
  const showUpgradeButton =
    isTrialActive ||
    !subscription ||
    subscription.status !== 'active' ||
    subscription.planKey === 'free';

  return (
    <Box
      sx={{
        bgcolor: 'primary.dark',
        color: 'primary.contrastText',
        px: 3,
        py: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}
    >
      {/* LEFT */}
      <Typography variant="body2" sx={{ fontWeight: 500 }}>
        New to RemindCA? Take a quick tour &nbsp;»&nbsp; See how reminders work
      </Typography>

      {/* RIGHT */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Typography variant="body2">
          <strong>{announcementMessage}</strong>
        </Typography>
        {showUpgradeButton && (
          <Button
            variant="contained"
            color="secondary"
            size="small"
            onClick={() => router.push('/subscription')}
          >
            Upgrade Now
          </Button>
        )}
      </Box>
    </Box>
  );
}
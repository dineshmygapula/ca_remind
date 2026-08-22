'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { getOrganizations } from '@/services/organizationService';
import { getSubscription } from '@/services/billingService';
import { Subscription } from '@/types/billing';

interface SubscriptionContextValue {
  subscription: Subscription | null;
  trialDaysRemaining: number | null;
  isTrialActive: boolean;
  announcementMessage: string;
  loading: boolean;
  refresh: () => Promise<void>;
}

const SubscriptionContext = createContext<SubscriptionContextValue>({
  subscription: null,
  trialDaysRemaining: null,
  isTrialActive: false,
  announcementMessage: '',
  loading: true,
  refresh: async () => {},
});

const PLAN_DISPLAY_NAMES: Record<string, string> = {
  free: 'Free Trial',
  pro: 'Pro',
  premium: 'Premium',
  enterprise: 'Enterprise',
};

const INTERVAL_DISPLAY: Record<string, string> = {
  monthly: 'Monthly',
  yearly: 'Yearly',
};

export function SubscriptionProvider({ children }: { children: ReactNode }) {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchSubscription = async () => {
    try {
      const orgs = await getOrganizations();
      if (orgs.length === 0) return;
      const data = await getSubscription(orgs[0].id);
      setSubscription(data);
    } catch {
      // no subscription yet
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscription();
  }, []);

  // ── Trial days remaining ─────────────────────────────
  const trialDaysRemaining: number | null = (() => {
    if (!subscription?.isTrialActive || !subscription?.trialEndAt) return null;
    const now = new Date();
    const end = new Date(subscription.trialEndAt);
    const diff = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return Math.max(0, diff);
  })();

  const isTrialActive = subscription?.isTrialActive ?? false;

  // ── Announcement message logic ───────────────────────
  const announcementMessage = (() => {
    if (!subscription) return 'Trial ends in 30 days'; // fallback dummy

    // Trial active → show remaining days
    if (isTrialActive && trialDaysRemaining !== null) {
      if (trialDaysRemaining === 0) return 'Your trial ends today — upgrade to keep access';
      if (trialDaysRemaining === 1) return 'Trial ends in 1 day';
      return `Trial ends in ${trialDaysRemaining} days`;
    }

    // Paid plan active → show plan name
    if (subscription.status === 'active' && subscription.planKey !== 'free') {
      const planName = PLAN_DISPLAY_NAMES[subscription.planKey] ?? subscription.planKey;
      // billingInterval may not be in Subscription type — show plan name only if not available
      return `You are on the ${planName} Plan`;
    }

    // Canceled
    if (subscription.status === 'canceled') {
      return 'Your subscription has been canceled — reactivate to continue';
    }

    // Past due
    if (subscription.status === 'past_due') {
      return 'Payment failed — please update your payment method';
    }

    return 'Trial ends in 30 days'; // final fallback
  })();

  return (
    <SubscriptionContext.Provider
      value={{
        subscription,
        trialDaysRemaining,
        isTrialActive,
        announcementMessage,
        loading,
        refresh: fetchSubscription,
      }}
    >
      {children}
    </SubscriptionContext.Provider>
  );
}

export const useSubscription = () => useContext(SubscriptionContext);
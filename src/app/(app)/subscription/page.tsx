'use client';

import { useEffect, useState } from 'react';
import { getOrganizations } from '@/services/organizationService';
import { getAvailablePlans } from '@/services/billingService';
import PlansPageClient from '@/components/subscription/PlanPageClient';
import { AvailablePlans } from '@/types/billing';
import { useWorkspace } from '@/context/WorkspaceContext';
import { Loader2 } from 'lucide-react';

export default function SubscriptionPlansPage() {
  const { orgId } = useWorkspace();
  const [organizationId, setOrganizationId] = useState<string>('');
  const [plans, setPlans] = useState<AvailablePlans | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    async function loadPlans() {
      try {
        setLoading(true);
        setError('');

        // Use orgId from workspace context if available, or fetch organizations
        let currentOrgId = orgId;
        if (!currentOrgId) {
          const orgs = await getOrganizations();
          if (orgs.length === 0) {
            if (!cancelled) {
              setError('No organization found. Please create an organization first.');
              setLoading(false);
            }
            return;
          }
          currentOrgId = orgs[0].id;
        }

        if (!cancelled) {
          setOrganizationId(currentOrgId);
        }

        const data = await getAvailablePlans(currentOrgId);
        if (!cancelled) {
          setPlans(data);
        }
      } catch (err: unknown) {
        console.error('Failed to load subscription plans:', err);
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : 'Failed to load subscription plans. Please try again.'
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadPlans();

    return () => {
      cancelled = true;
    };
  }, [orgId]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-bg">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-[#F59E0B]" />
          <p className="text-sm font-semibold text-txt-main">Loading subscription plans...</p>
        </div>
      </div>
    );
  }

  if (error || !plans) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-bg px-4">
        <div className="alert alert-error max-w-md shadow-lg rounded-2xl">
          <span>{error || 'Failed to load plans.'}</span>
        </div>
      </div>
    );
  }

  return <PlansPageClient plans={plans} organizationId={organizationId} />;
}
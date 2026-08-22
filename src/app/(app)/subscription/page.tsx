import { getOrganizations } from '@/services/organizationService';
import { getAvailablePlans } from '@/services/billingService';
import PlansPageClient from '@/components/subscription/PlanPageClient';

export default async function SubscriptionPlansPage() {
  let organizationId = '';
  let plans = null;
  let error = '';

  try {
    const orgs = await getOrganizations();

    if (orgs.length === 0) {
      error = 'No organization found. Please create an organization first.';
    } else {
      organizationId = orgs[0].id;
      plans = await getAvailablePlans(organizationId);
    }
  } catch {
    error = 'Failed to load plans. Please try again.';
  }

  if (error || !plans) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-bg px-4">
        <div className="alert alert-error max-w-md shadow-lg">
          <span>{error || 'Failed to load plans.'}</span>
        </div>
      </div>
    );
  }

  return <PlansPageClient plans={plans} organizationId={organizationId} />;
}
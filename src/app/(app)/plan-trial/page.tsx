'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Trophy, Loader2, AlertCircle } from 'lucide-react';
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

  if (loadingOrg) {
    return (
      <div className="min-h-screen bg-[var(--bg)] flex flex-col items-center justify-center p-4">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--primary)] mb-3" />
        <p className="text-sm font-semibold text-[var(--text-secondary)]">Loading...</p>
      </div>
    );
  }

  if (!organizationId && error) {
    return (
      <div className="min-h-screen bg-[var(--bg)] flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full bg-[var(--surface)] border border-rose-200 dark:border-rose-900 rounded-2xl p-6 shadow-lg text-center">
          <AlertCircle className="w-10 h-10 text-rose-500 mx-auto mb-3" />
          <h2 className="text-base font-bold text-[var(--heading)] mb-2">Organization Error</h2>
          <p className="text-xs text-[var(--text-secondary)] mb-5">{error}</p>
          <button
            type="button"
            onClick={() => router.push('/organization-create')}
            className="w-full py-2.5 rounded-xl bg-[var(--primary)] text-white font-bold text-xs shadow-md hover:bg-[var(--primary-hover)] transition-all cursor-pointer"
          >
            Create Organization
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg)] flex flex-col">
      {/* Progress bar */}
      <div className="h-1 w-full bg-slate-100 dark:bg-slate-800">
        <div className="h-1 bg-[var(--primary)] w-2/3 transition-all duration-300" />
      </div>

      {/* Step label */}
      <div className="px-6 pt-3 text-xs font-semibold text-[var(--text-secondary)]">
        Step 2 of 3 · Organization
      </div>

      {/* Main content */}
      <div className="max-w-md mx-auto w-full flex-1 flex flex-col justify-center px-4 py-8">
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-6 sm:p-8 shadow-xl text-center">
          {/* Badge icon */}
          <div className="flex justify-center mb-5">
            <div className="w-16 h-16 rounded-2xl bg-[var(--accent)]/15 border border-[var(--accent)]/30 flex items-center justify-center text-[var(--accent)] shadow-sm">
              <Trophy className="w-8 h-8 stroke-[2.5]" />
            </div>
          </div>

          {/* Title */}
          <h1 className="text-2xl font-black text-[var(--heading)] tracking-tight mb-3">
            You're on the Free plan
          </h1>

          {/* Description */}
          <p className="text-xs text-[var(--text-secondary)] leading-relaxed mb-8">
            Your organization starts on Free. You can explore paid plans or start a free
            trial anytime from the next screen—or skip and finish setting up your first
            business.
          </p>

          <div className="flex flex-col gap-3">
            <button
              type="button"
              onClick={handleViewPlans}
              className="w-full py-3 rounded-xl bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white font-bold text-sm shadow-md hover:shadow-lg transition-all cursor-pointer"
            >
              View plans &amp; trial
            </button>

            <button
              type="button"
              onClick={handleContinueToBusiness}
              className="w-full py-3 rounded-xl border border-[var(--border)] font-semibold text-sm text-[var(--text-primary)] hover:bg-[var(--border)]/40 transition-colors cursor-pointer"
            >
              Continue to business
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

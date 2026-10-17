'use client';

import { useCallback, useEffect, useState } from 'react';
import { getStaff } from '@/services/staffService';
import { StaffMember } from '@/types/staff.types';

export interface UseClientFormDataResult {
  staff: StaffMember[];
  staffLoading: boolean;
  error: string;
  setError: (message: string) => void;
  refetchStaff: () => Promise<void>;
}

/**
 * Loads staff data for the client form dialog.
 * Fetches whenever the dialog opens.
 */
export function useClientFormData(businessId: string, open: boolean): UseClientFormDataResult {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [staffLoading, setStaffLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchStaff = useCallback(async () => {
    if (!businessId) return;
    try {
      setStaffLoading(true);
      const data = await getStaff(businessId);
      setStaff(data.filter((s) => s.status === 'ACTIVE'));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load staff');
    } finally {
      setStaffLoading(false);
    }
  }, [businessId]);

  useEffect(() => {
    if (!open || !businessId) return;
    fetchStaff();
  }, [open, businessId, fetchStaff]);

  return {
    staff,
    staffLoading,
    error,
    setError,
    refetchStaff: fetchStaff,
  };
}

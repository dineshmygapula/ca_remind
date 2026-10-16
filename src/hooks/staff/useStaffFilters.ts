'use client';

import { useState, useMemo, useCallback } from 'react';
import { StaffMember } from '@/types/staff.types';
import { StaffStatusFilter } from '@/constants/staffConstants';

export function useStaffFilters(staff: StaffMember[]) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StaffStatusFilter>('ALL');
  const [roleFilter, setRoleFilter] = useState('');

  const reset = useCallback(() => {
    setSearchQuery('');
    setStatusFilter('ALL');
    setRoleFilter('');
  }, []);

  const filtered = useMemo(() => {
    if (!Array.isArray(staff)) return [];
    let list = [...staff];

    const query = searchQuery.trim().toLowerCase();
    if (query) {
      list = list.filter(
        (m) =>
          m.userName?.toLowerCase().includes(query) ||
          m.firstName?.toLowerCase().includes(query) ||
          m.lastName?.toLowerCase().includes(query) ||
          m.email?.toLowerCase().includes(query) ||
          m.phone?.includes(query) ||
          m.phoneMasked?.includes(query)
      );
    }

    if (statusFilter === 'ACTIVE') {
      list = list.filter((m) => m.status === 'ACTIVE');
    } else if (statusFilter === 'INACTIVE') {
      list = list.filter((m) => m.status === 'INACTIVE');
    }

    if (roleFilter.trim() && roleFilter !== 'ALL') {
      const rQuery = roleFilter.toLowerCase();
      list = list.filter((m) =>
        (m.roles?.[0] || m.role || '').toLowerCase().includes(rQuery)
      );
    }

    return list;
  }, [staff, searchQuery, statusFilter, roleFilter]);

  return {
    filtered,
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    roleFilter,
    setRoleFilter,
    reset,
  };
}

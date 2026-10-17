'use client';

import { useCallback, useMemo, useState } from 'react';
import { ReminderDetail } from '@/types/reminders.types';
import { getDefaultFilterValues } from '@/constants/filterFields';

const startOfDay = (value: Date | string) => {
  const date = new Date(value);
  date.setHours(0, 0, 0, 0);
  return date;
};

const endOfDay = (value: Date | string) => {
  const date = new Date(value);
  date.setHours(23, 59, 59, 999);
  return date;
};

export interface UseReminderFiltersResult {
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  values: Record<string, string>;
  onChange: (key: string, value: string) => void;
  dateFrom: string;
  setDateFrom: (value: string) => void;
  dateTo: string;
  setDateTo: (value: string) => void;
  filteredReminders: ReminderDetail[];
  filtered: ReminderDetail[];
  reset: () => void;
}

export function useReminderFilters(reminders: ReminderDetail[]): UseReminderFiltersResult {
  const [searchQuery, setSearchQuery] = useState('');
  const [values, setValues] = useState<Record<string, string>>(() =>
    getDefaultFilterValues('reminders')
  );
  const [dateFrom, setDateFromState] = useState('');
  const [dateTo, setDateTo] = useState('');

  const setDateFrom = useCallback(
    (value: string) => {
      setDateFromState(value);
      if (dateTo && value && new Date(value) > new Date(dateTo)) setDateTo('');
    },
    [dateTo]
  );

  const onChange = useCallback((key: string, value: string) => {
    setValues((prev) => ({ ...prev, [key]: value }));
  }, []);

  const reset = useCallback(() => {
    setSearchQuery('');
    setValues(getDefaultFilterValues('reminders'));
    setDateFromState('');
    setDateTo('');
  }, []);

  const filteredReminders = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    const todayStart = startOfDay(new Date());
    const todayEnd = endOfDay(new Date());
    const from = dateFrom ? startOfDay(dateFrom) : null;
    const to = dateTo ? endOfDay(dateTo) : null;

    const timeFilter = values.when || 'ALL';
    const statusFilter = values.status || 'ALL';
    const channelFilter = values.channel || 'ALL';

    return reminders.filter((r) => {
      if (
        query &&
        !r.task?.title?.toLowerCase().includes(query) &&
        !r.subject?.name?.toLowerCase().includes(query)
      ) {
        return false;
      }
      if (statusFilter !== 'ALL' && r.status !== statusFilter) return false;
      if (channelFilter !== 'ALL' && r.channel !== channelFilter) return false;

      const needsSchedule = timeFilter !== 'ALL' || from || to;
      if (!needsSchedule) return true;
      if (!r.scheduledAt) return false;

      const scheduled = new Date(r.scheduledAt);

      if (timeFilter === 'OVERDUE' && !(scheduled < todayStart && r.status === 'SCHEDULED')) {
        return false;
      }
      if (timeFilter === 'TODAY' && !(scheduled >= todayStart && scheduled <= todayEnd)) {
        return false;
      }
      if (timeFilter === 'UPCOMING' && !(scheduled > todayEnd)) return false;
      if (from && scheduled < from) return false;
      if (to && scheduled > to) return false;

      return true;
    });
  }, [reminders, searchQuery, values, dateFrom, dateTo]);

  return {
    searchQuery,
    setSearchQuery,
    values,
    onChange,
    dateFrom,
    setDateFrom,
    dateTo,
    setDateTo,
    filteredReminders,
    filtered: filteredReminders,
    reset,
  };
}
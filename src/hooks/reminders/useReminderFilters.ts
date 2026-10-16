"use client";

import { useCallback, useMemo, useState } from "react";
import { ReminderDetail } from "@/types/reminders.types";
import {
  ReminderStatusFilter,
  ReminderChannelFilter,
  ReminderTimeFilter,
} from "@/constants/reminderConstants";

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

export function useReminderFilters(reminders: ReminderDetail[]) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<ReminderStatusFilter>("ALL");
  const [channelFilter, setChannelFilter] = useState<ReminderChannelFilter>("ALL");
  const [timeFilter, setTimeFilter] = useState<ReminderTimeFilter>("ALL");
  const [dateFrom, setDateFromState] = useState("");
  const [dateTo, setDateTo] = useState("");

  const setDateFrom = useCallback(
    (value: string) => {
      setDateFromState(value);
      if (dateTo && value && new Date(value) > new Date(dateTo)) setDateTo("");
    },
    [dateTo]
  );

  const reset = useCallback(() => {
    setSearchQuery("");
    setStatusFilter("ALL");
    setChannelFilter("ALL");
    setTimeFilter("ALL");
    setDateFromState("");
    setDateTo("");
  }, []);

  const filtered = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    const todayStart = startOfDay(new Date());
    const todayEnd = endOfDay(new Date());
    const from = dateFrom ? startOfDay(dateFrom) : null;
    const to = dateTo ? endOfDay(dateTo) : null;

    return reminders.filter((r) => {
      if (
        query &&
        !r.task?.title?.toLowerCase().includes(query) &&
        !r.subject?.name?.toLowerCase().includes(query)
      ) {
        return false;
      }
      if (statusFilter !== "ALL" && r.status !== statusFilter) return false;
      if (channelFilter !== "ALL" && r.channel !== channelFilter) return false;

      const needsSchedule = timeFilter !== "ALL" || from || to;
      if (!needsSchedule) return true;
      if (!r.scheduledAt) return false;

      const scheduled = new Date(r.scheduledAt);

      if (timeFilter === "OVERDUE" && !(scheduled < todayStart && r.status === "SCHEDULED")) {
        return false;
      }
      if (timeFilter === "TODAY" && !(scheduled >= todayStart && scheduled <= todayEnd)) {
        return false;
      }
      if (timeFilter === "UPCOMING" && !(scheduled > todayEnd)) return false;
      if (from && scheduled < from) return false;
      if (to && scheduled > to) return false;

      return true;
    });
  }, [reminders, searchQuery, statusFilter, channelFilter, timeFilter, dateFrom, dateTo]);

  return {
    filtered,
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    channelFilter,
    setChannelFilter,
    timeFilter,
    setTimeFilter,
    dateFrom,
    setDateFrom,
    dateTo,
    setDateTo,
    reset,
  };
}
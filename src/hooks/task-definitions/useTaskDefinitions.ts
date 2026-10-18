"use client";

import { useCallback, useMemo, useState } from "react";
import { TaskDefinitionListItem } from "@/types/taskDefinition.types";
import { isPastDue } from "@/lib/task-definitons/taskDefinitionStat";

export type StatusFilter = "ALL" | "ACTIVE" | "INACTIVE";
export type AutoCreateFilter = "ALL" | "ON" | "OFF";

export function useTaskDefinitionFilters(definitions: TaskDefinitionListItem[]) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");
  const [scheduleFilter, setScheduleFilter] = useState("");
  const [autoCreateFilter, setAutoCreateFilter] = useState<AutoCreateFilter>("ALL");
  const [showPastDueOnly, setShowPastDueOnly] = useState(false);

  const togglePastDueOnly = useCallback(() => setShowPastDueOnly((prev) => !prev), []);

  const reset = useCallback(() => {
    setSearchQuery("");
    setStatusFilter("ALL");
    setScheduleFilter("");
    setAutoCreateFilter("ALL");
    setShowPastDueOnly(false);
  }, []);

  const filtered = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    const schedule = scheduleFilter.toLowerCase();

    return definitions.filter((def) => {
      if (
        query &&
        !def.name?.toLowerCase().includes(query) &&
        !def.taskType?.toLowerCase().includes(query)
      ) {
        return false;
      }
      if (statusFilter === "ACTIVE" && !def.isActive) return false;
      if (statusFilter === "INACTIVE" && def.isActive) return false;
      if (
        schedule &&
        schedule !== "all" &&
        def.schedulePattern?.toLowerCase() !== schedule
      ) {
        return false;
      }
      if (autoCreateFilter === "ON" && !def.autoCreateTasks) return false;
      if (autoCreateFilter === "OFF" && def.autoCreateTasks) return false;
      if (showPastDueOnly && !isPastDue(def)) return false;
      return true;
    });
  }, [
    definitions,
    searchQuery,
    statusFilter,
    scheduleFilter,
    autoCreateFilter,
    showPastDueOnly,
  ]);

  return {
    filtered,
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    scheduleFilter,
    setScheduleFilter,
    autoCreateFilter,
    setAutoCreateFilter,
    showPastDueOnly,
    togglePastDueOnly,
    reset,
  };
}
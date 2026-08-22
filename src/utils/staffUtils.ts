// utils/staffUtils.ts  (or inline in the drawer)
import { StaffDashboardResponse, StaffWorkSummary } from "@/types/staff.types";

export function computeWorkSummary(dashboard: StaffDashboardResponse): StaffWorkSummary {
  const tasks = dashboard.tasks.items;
  const now = new Date();

  return {
    totalClients: dashboard.clients.items.length,
    pendingTasks: tasks.filter(
      (t) => t.status === "OPEN" && new Date(t.due_date) >= now
    ).length,
    overdueTasks: tasks.filter(
      (t) => t.status === "OPEN" && new Date(t.due_date) < now
    ).length,
    completedTasks: tasks.filter((t) => t.status === "CLOSED").length,
  };
}
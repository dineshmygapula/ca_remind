import { TaskDefinitionListItem } from "@/types/taskDefinition.types";

const DAY_MS = 24 * 60 * 60 * 1000;

const startOfDay = (value: Date | string) => {
  const date = new Date(value);
  date.setHours(0, 0, 0, 0);
  return date.getTime();
};

export const isPastDue = (definition: TaskDefinitionListItem) =>
  !!definition.dueDate && startOfDay(definition.dueDate) < startOfDay(new Date());

export const isDueThisWeek = (definition: TaskDefinitionListItem) => {
  if (!definition.dueDate) return false;
  const today = startOfDay(new Date());
  const due = startOfDay(definition.dueDate);
  return due >= today && due <= today + 7 * DAY_MS;
};

export const isFullyAutomated = (definition: TaskDefinitionListItem) =>
  !!definition.autoCreateTasks && !!definition.autoCreateReminders;

export function getTaskDefinitionStats(definitions: TaskDefinitionListItem[]) {
  const dueThisWeek = definitions.filter(isDueThisWeek);
  const activeCount = definitions.filter((d) => d.isActive).length;

  return {
    total: definitions.length,
    activeCount,
    allActive: definitions.length > 0 && activeCount === definitions.length,
    pastDueCount: definitions.filter(isPastDue).length,
    dueThisWeekCount: dueThisWeek.length,
    nextDueName: dueThisWeek[0]?.name || "None",
    fullyAutomatedCount: definitions.filter(isFullyAutomated).length,
  };
}
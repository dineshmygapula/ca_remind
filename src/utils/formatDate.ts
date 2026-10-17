

// Parses "yyyy-MM-dd" as a LOCAL date (no timezone shift).
// Full ISO timestamps fall back to normal Date parsing.
export function parseDate(value?: string | null): Date | null {
  if (!value) return null;

  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  const date = m
    ? new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]))
    : new Date(value);

  return isNaN(date.getTime()) ? null : date;
}

export function formatDueDate(value?: string | null) {
  if (!value) return "—";
  const date = parseDate(value);
  if (!date) return value;

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

// Negative = overdue, 0 = today, positive = days remaining. null if invalid.
export function getDueDiffDays(value?: string | null): number | null {
  const due = parseDate(value);
  if (!due) return null;

  const today = new Date();
  const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const startOfDue = new Date(due.getFullYear(), due.getMonth(), due.getDate());

  return Math.round((startOfDue.getTime() - startOfToday.getTime()) / 86_400_000);
}
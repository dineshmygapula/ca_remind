"use client";

import { useMemo, useState } from "react";

export interface SortOption<T> {
  key: string;
  label: string;
  compare: (a: T, b: T) => number;
}

export function useSortedItems<T>(items: T[], options: SortOption<T>[]) {
  const [sortKey, setSortKey] = useState(options[0].key);

  const sorted = useMemo(() => {
    const active = options.find((o) => o.key === sortKey) ?? options[0];
    return [...items].sort(active.compare);
  }, [items, options, sortKey]);

  const sortProps = useMemo(
    () => ({
      value: sortKey,
      options: options.map(({ key, label }) => ({ key, label })),
      onChange: setSortKey,
    }),
    [options, sortKey]
  );

  return { sorted, sortProps };
}

export const compareDates =
  <T,>(get: (item: T) => string | undefined | null, direction: "asc" | "desc") =>
  (a: T, b: T) => {
    const av = get(a);
    const bv = get(b);
    if (!av) return 1;
    if (!bv) return -1;
    const diff = new Date(av).getTime() - new Date(bv).getTime();
    return direction === "asc" ? diff : -diff;
  };

export const compareStrings =
  <T,>(get: (item: T) => string | undefined | null) =>
  (a: T, b: T) =>
    (get(a) || "").localeCompare(get(b) || "");
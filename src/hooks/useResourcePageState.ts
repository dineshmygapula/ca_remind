"use client";

import { useCallback, useState } from "react";

type DrawerState =
  | { mode: "closed" }
  | { mode: "view"; id: string }
  | { mode: "form"; id: string | null };

interface DeleteTarget {
  id: string;
  label: string;
}

export function useResourcePageState() {
  const [drawer, setDrawer] = useState<DrawerState>({ mode: "closed" });
  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget | null>(null);

  const close = useCallback(() => setDrawer({ mode: "closed" }), []);
  const openCreate = useCallback(() => setDrawer({ mode: "form", id: null }), []);
  const openEdit = useCallback((id: string) => setDrawer({ mode: "form", id }), []);
  const openView = useCallback((id: string) => setDrawer({ mode: "view", id }), []);
  const requestDelete = useCallback(
    (id: string, label: string) => setDeleteTarget({ id, label }),
    []
  );
  const cancelDelete = useCallback(() => setDeleteTarget(null), []);

  return {
    viewOpen: drawer.mode === "view",
    viewId: drawer.mode === "view" ? drawer.id : null,
    formOpen: drawer.mode === "form",
    formId: drawer.mode === "form" ? drawer.id : null,
    deleteTarget,
    close,
    openCreate,
    openEdit,
    openView,
    requestDelete,
    cancelDelete,
  };
}
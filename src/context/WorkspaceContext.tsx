// context/WorkspaceContext.tsx
"use client";
import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from "react";
import { useAuth } from "./AuthContext";
import { getOrganizations } from "@/services/organizationService";
import { getBusinesses } from "@/services/businessService";

type Status = "loading" | "unauthenticated" | "error" | "no_org" | "no_business" | "ready";

interface WorkspaceContextType {
  status: Status;
  orgId: string | null;
  businessId: string | null;
  refresh: () => void;
}

const WorkspaceContext = createContext<WorkspaceContextType | null>(null);

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const [ids, setIds] = useState<{ orgId: string | null; businessId: string | null }>({
    orgId: null,
    businessId: null,
  });
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [tick, setTick] = useState(0);

  const refresh = useCallback(() => setTick((t) => t + 1), []);

  useEffect(() => {
    if (!user) {
      setIds({ orgId: null, businessId: null });
      setError(null);
      setFetching(true); // ready for the next login, avoids a flash of "no_org"
      return;
    }

    let cancelled = false; // prevents stale responses overwriting newer ones
    setFetching(true);
    setError(null);

    (async () => {
      try {
        const [org] = await getOrganizations();
        const [biz] = org ? await getBusinesses(org.id) : [];
        if (!cancelled) setIds({ orgId: org?.id ?? null, businessId: biz?.id ?? null });
      } catch (e) {
        if (!cancelled) setError(e as Error);
      } finally {
        if (!cancelled) setFetching(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [user, tick]);

  const status: Status =
    authLoading ? "loading"
    : !user ? "unauthenticated"
    : fetching ? "loading"
    : error ? "error"
    : !ids.orgId ? "no_org"
    : !ids.businessId ? "no_business"
    : "ready";

  return (
    <WorkspaceContext.Provider value={{ status, ...ids, refresh }}>
      {children}
    </WorkspaceContext.Provider>
  );
}

export const useWorkspace = () => {
  const ctx = useContext(WorkspaceContext);
  if (!ctx) throw new Error("useWorkspace must be used inside WorkspaceProvider");
  return ctx;
};
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
  refresh: () => Promise<{ orgId: string | null; businessId: string | null }>;
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

  const fetchWorkspace = useCallback(async () => {
    if (!user) {
      setIds({ orgId: null, businessId: null });
      setError(null);
      setFetching(false);
      return { orgId: null, businessId: null };
    }

    setFetching(true);
    setError(null);

    try {
      const [org] = await getOrganizations();
      const [biz] = org ? await getBusinesses(org.id) : [];
      const newIds = { orgId: org?.id ?? null, businessId: biz?.id ?? null };
      setIds(newIds);
      return newIds;
    } catch (e) {
      setError(e as Error);
      return { orgId: null, businessId: null };
    } finally {
      setFetching(false);
    }
  }, [user]);

  useEffect(() => {
    fetchWorkspace();
  }, [fetchWorkspace]);

  const refresh = useCallback(async () => {
    return await fetchWorkspace();
  }, [fetchWorkspace]);

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
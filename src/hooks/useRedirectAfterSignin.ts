"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useWorkspace } from "@/context/WorkspaceContext";

const ROUTE_FOR_STATUS = {
  no_org: "/organization-create",
  no_business: "/business-create",
  ready: "/dashboard",
} as const;

export function useRedirectIfSignedIn() {
  const { status } = useWorkspace();
  const router = useRouter();

  useEffect(() => {
    if (status in ROUTE_FOR_STATUS) {
      router.replace(ROUTE_FOR_STATUS[status as keyof typeof ROUTE_FOR_STATUS]);
    }
  }, [status, router]);
}
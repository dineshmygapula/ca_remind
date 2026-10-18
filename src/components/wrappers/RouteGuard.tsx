"use client";

import { useEffect, ReactNode } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useWorkspace } from "@/context/WorkspaceContext";

const ORG_SETUP_PATH = "/organization-create";
const BIZ_SETUP_PATH = "/business-create";

export function RouteGuard({ children }: { children: ReactNode }) {
  const { status } = useWorkspace();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (status === "loading") return; // still resolving — do nothing yet

    switch (status) {
      case "unauthenticated":
        router.replace(`/login?next=${encodeURIComponent(pathname)}`);
        break;

      case "no_org":
        if (pathname !== ORG_SETUP_PATH) {
          router.replace(ORG_SETUP_PATH);
        }
        break;

      case "no_business":
        if (pathname !== BIZ_SETUP_PATH && pathname !== ORG_SETUP_PATH) {
          router.replace(BIZ_SETUP_PATH);
        }
        break;

      case "ready":
        if (pathname === ORG_SETUP_PATH || pathname === BIZ_SETUP_PATH) {
          router.replace("/dashboard");
        }
        break;
    }
  }, [status, pathname]);

  if (status === "loading") {
    return (
      <div
        role="status"
        aria-label="Loading your workspace"
        className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-4 bg-[var(--bg)]"
      >
        <Loader2 className="w-8 h-8 animate-spin text-[var(--primary)]" />
        <p className="text-sm font-medium text-[var(--text-secondary)]">
          Loading your workspace…
        </p>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div
        role="alert"
        className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-4 bg-[var(--bg)] px-4"
      >
        <p className="text-base font-semibold text-[var(--text-primary)]">
          Failed to load workspace data.
        </p>
        <p className="text-sm text-[var(--text-secondary)]">
          Check your connection and try again.
        </p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="btn btn-sm rounded-xl bg-[var(--primary)] text-white border-none px-5"
        >
          Retry
        </button>
      </div>
    );
  }

  const isRedirecting =
    status === "unauthenticated" ||
    (status === "no_org" && pathname !== ORG_SETUP_PATH) ||
    (status === "no_business" &&
      pathname !== BIZ_SETUP_PATH &&
      pathname !== ORG_SETUP_PATH) ||
    (status === "ready" &&
      (pathname === ORG_SETUP_PATH || pathname === BIZ_SETUP_PATH));

  if (isRedirecting) {
    return (
      <div
        role="status"
        aria-label="Redirecting"
        className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--bg)]"
      >
        <Loader2 className="w-8 h-8 animate-spin text-[var(--primary)]" />
      </div>
    );
  }

  return <>{children}</>;
}

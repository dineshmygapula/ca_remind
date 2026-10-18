"use client";

/**
 * RouteGuard.tsx
 *
 * Client-side complement to middleware.ts.
 *
 * The edge middleware handles the coarse auth check (cookie present / absent).
 * RouteGuard handles the *workspace* check — whether the authenticated user
 * has finished onboarding (org + business creation).
 *
 * State machine:
 *
 *  loading        → show full-page spinner (auth + workspace both resolving)
 *  unauthenticated→ middleware already redirected; this is a safety net
 *  error          → show an error UI with a retry button
 *  no_org         → redirect to /organization-create
 *                   (exempt if already there)
 *  no_business    → redirect to /business-create
 *                   (exempt if already there or at /organization-create)
 *  ready          → redirect away from setup pages (back to /dashboard)
 *  ready          → render children normally
 */

import { useEffect, ReactNode } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useWorkspace } from "@/context/WorkspaceContext";

// Setup routes that are valid *mid-onboarding* — don't redirect away from them
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
        // Middleware should have caught this, but belt-and-suspenders:
        router.replace(`/login?next=${encodeURIComponent(pathname)}`);
        break;

      case "no_org":
        // Must create an org first.
        if (pathname !== ORG_SETUP_PATH) {
          router.replace(ORG_SETUP_PATH);
        }
        break;

      case "no_business":
        // Org exists but no business yet — must create one.
        if (pathname !== BIZ_SETUP_PATH && pathname !== ORG_SETUP_PATH) {
          router.replace(BIZ_SETUP_PATH);
        }
        break;

      case "ready":
        // Fully set up — push away from setup pages.
        if (
          pathname === ORG_SETUP_PATH ||
          pathname === BIZ_SETUP_PATH
        ) {
          router.replace("/dashboard");
        }
        break;

      // "error" is handled inline below — no redirect
    }
  }, [status, pathname, router]);

  // ── Loading state ──────────────────────────────────────────────────────────
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

  // ── Error state ────────────────────────────────────────────────────────────
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

  // ── Redirect in progress ───────────────────────────────────────────────────
  // While the router.replace() fires, show the spinner so there's no flash
  // of incorrect content.
  const isRedirecting =
    (status === "unauthenticated") ||
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

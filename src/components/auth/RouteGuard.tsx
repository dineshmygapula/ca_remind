"use client";
import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

const PUBLIC_ROUTES = ["/login", "/signup", "/"];

const ONBOARDING_ROUTES = [
  "/organization-create",
  "/plan-trial",
  "/business-create",
];

const STATE_REDIRECT: Record<string, string> = {
  unauthenticated: "/login",
  no_org:          "/organization-create",
  no_plan:         "/plan-trial",
  no_business:     "/business-create",
};

export default function RouteGuard({ children }: { children: React.ReactNode }) {
  const { appState } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (appState === "loading") return;

    const isPublic     = PUBLIC_ROUTES.includes(pathname);
    const isOnboarding = ONBOARDING_ROUTES.includes(pathname);

    if (appState === "ready") {
      // ✅ Ready user on login/signup → dashboard
      // ✅ Ready user on "/" (home) → dashboard  
      // ✅ Ready user on onboarding → dashboard (already completed)
      if (isPublic || isOnboarding) {
        router.replace("/dashboard");
      }
      // ✅ Ready user on any (app) page → just render it, no redirect
      console.log("appState check:", localStorage.getItem("app_token"))
      return;
    }

    if (appState === "unauthenticated") {
      // ✅ Unauthenticated user on "/" or "/login" or "/signup" → just render, no redirect
      if (isPublic) return;
      // ✅ Unauthenticated user trying to access protected page → login
      router.replace("/login");
      return;
    }

    // ✅ Partially set up user (no_org, no_plan, no_business)
    // Only redirect if they are NOT already on the correct onboarding page
    const target = STATE_REDIRECT[appState];
    if (!target) return;
    if (pathname === target) return; // already on correct page, no loop
    router.replace(target);

  }, [appState, pathname]);

  // ✅ CRITICAL FIX: Don't block rendering with a spinner on public routes
  // Show spinner ONLY when loading AND on a protected route
  if (appState === "loading") {
    const isPublic = PUBLIC_ROUTES.includes(pathname);
    if (isPublic) {
      // Render the page immediately — no spinner on "/", "/login", "/signup"
      return <>{children}</>;
    }
    // Protected route — show spinner while resolving
    return (
      <div style={{ display: "flex", height: "100vh", alignItems: "center", justifyContent: "center" }}>
        <span style={{
          display: "inline-block", width: 32, height: 32,
          borderRadius: "50%", border: "4px solid #e0e0e0",
          borderTopColor: "#1976d2", animation: "spin 0.8s linear infinite"
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return <>{children}</>;
}
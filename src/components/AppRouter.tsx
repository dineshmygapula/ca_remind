"use client";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "../context/AuthContext";

export default function AppRouter({ children }: { children: React.ReactNode }) {
  const { appState } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  // ✅ Prevent hydration mismatch — don't render until mounted on client
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (appState === "loading") return;

    if (
      appState === "unauthenticated" &&
      pathname !== "/login" &&
      pathname !== "/signup"
    ) {
      router.push("/login");
      return;
    }

    if (appState === "no_org" && pathname !== "/organization-create") {
      router.push("/organization-create");
      return;
    }

    if (appState === "no_business" && pathname !== "/business-create") {
      router.push("/business-create");
      return;
    }

    if (appState === "ready" && (pathname === "/login" || pathname === "/signup")) {
      router.push("/dashboard");
      return;
    }

  }, [appState, pathname, router]);

  // ✅ Return null instead of <div> — null is the same on server and client
  if (!mounted || appState === "loading") return null;

  return <>{children}</>;
}
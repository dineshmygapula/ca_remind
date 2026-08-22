"use client";

import { AuthProvider } from "@/context/AuthContext";
import { MuiProvider } from "@/components/MuiProvider";
import RouteGuard from "@/components/auth/RouteGuard";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>

      {/* <RouteGuard>{children}</RouteGuard> */}
      {children}


    </AuthProvider>
  );
}
export default Providers;

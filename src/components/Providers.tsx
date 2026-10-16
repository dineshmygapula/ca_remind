"use client";

import { AuthProvider } from "@/context/AuthContext";
import { MuiProvider } from "@/components/MuiProvider";
import RouteGuard from "@/components/auth/RouteGuard";
import { WorkspaceProvider } from "@/context/WorkspaceContext";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <WorkspaceProvider>
      {/* <RouteGuard>{children}</RouteGuard> */}
      {children}
      </WorkspaceProvider>



    </AuthProvider>
  );
}
export default Providers;

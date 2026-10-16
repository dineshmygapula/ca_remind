"use client";

import { AuthProvider } from "@/context/AuthContext";
import { MuiProvider } from "@/components/MuiProvider";
import RouteGuard from "@/components/auth/RouteGuard";
import { WorkspaceProvider } from "@/context/WorkspaceContext";
import { ToastProvider } from "@/context/ToastContext";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <WorkspaceProvider>
        <ToastProvider>
          {children}
        </ToastProvider>
      </WorkspaceProvider>
    </AuthProvider>
  );
}
export default Providers;

"use client";

import { AuthProvider } from "@/context/AuthContext";
import { WorkspaceProvider } from "@/context/WorkspaceContext";
import { ToastProvider } from "@/context/ToastContext";
import AppToaster from "./AppToaster";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <WorkspaceProvider>
        <ToastProvider>
          <AppToaster /> {children}
        </ToastProvider>
      </WorkspaceProvider>
    </AuthProvider>
  );
}
export default Providers;

"use client";

import { AuthProvider } from "@/context/AuthContext";
import { WorkspaceProvider } from "@/context/WorkspaceContext";
import { ToastProvider } from "@/context/ToastContext";
import { Toaster } from "react-hot-toast";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <WorkspaceProvider>
        <ToastProvider>
          <Toaster position="top-right" reverseOrder={false} />
          {children}
        </ToastProvider>
      </WorkspaceProvider>
    </AuthProvider>
  );
}
export default Providers;

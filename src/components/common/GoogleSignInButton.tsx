"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import GoogleIcon from "./GoogleIcon";
import { signInWithGoogle } from "@/services/authServices";
import { FirebaseError } from "firebase/app";

interface GoogleSignInButtonProps {
  onSuccess?: () => void;
  onError?: (error: string) => void;
  disabled?: boolean;
  text?: string;
  className?: string;
}

export function GoogleSignInButton({
  onSuccess,
  onError,
  disabled = false,
  text = "Continue with Google",
  className = "",
}: GoogleSignInButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    if (loading || disabled) return;
    setLoading(true);
    onError?.("");
    try {
      await signInWithGoogle();
      onSuccess?.();
    } catch (err: unknown) {
      if (err instanceof FirebaseError) {
        if (
          err.code === "auth/popup-closed-by-user" ||
          err.code === "auth/cancelled-popup-request"
        ) {
          // User closed popup; not an actionable error
          return;
        }
        if (err.code === "auth/network-request-failed") {
          onError?.("Network error. Check your connection.");
          return;
        }
      }
      onError?.(err instanceof Error ? err.message : "Google sign-in failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={disabled || loading}
      className={`btn btn-outline w-full h-[54px] min-h-[54px] rounded-[14px] border-[var(--border)] !text-slate-900 hover:!text-slate-900 dark:!text-slate-100 dark:hover:!text-slate-100 bg-white hover:bg-slate-50 dark:bg-slate-800 dark:hover:bg-slate-700 text-[15.5px] font-bold flex items-center justify-center gap-3 disabled:opacity-50 transition-colors ${className}`}
    >
      {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <GoogleIcon />}
      <span>{text}</span>
    </button>
  );
}

export default GoogleSignInButton;

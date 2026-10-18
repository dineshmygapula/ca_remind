// hooks/useAuthActions.ts
import { useState } from "react";
import { FirebaseError } from "firebase/app";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "@/config/firebase";
import { loginWithEmail } from "@/services/authServices";
import { LoginForm, ResetEmailForm } from "@/utils/schema";

// Turns Firebase error codes into user-friendly messages ("" = show nothing)
const getAuthMessage = (err: unknown, fallback: string): string => {
  if (err instanceof FirebaseError) {
    switch (err.code) {
      case "auth/invalid-credential":
      case "auth/wrong-password":
      case "auth/user-not-found":
        return "Incorrect email or password";
      case "auth/too-many-requests":
        return "Too many attempts. Please try again later";
      case "auth/network-request-failed":
        return "Network error. Check your connection";
      case "auth/popup-closed-by-user":
      case "auth/cancelled-popup-request":
        return ""; // user cancelled, not an error
    }
  }
  return err instanceof Error ? err.message : fallback;
};

export function useAuthActions() {
  // Email login
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async (data: LoginForm) => {
    setLoading(true);
    setError("");
    try {
      await loginWithEmail(data.email, data.password);
      // Nothing else to do: onAuthStateChanged -> WorkspaceProvider fetches
      // org/business -> the redirect effect routes the user.
    } catch (err) {
      setError(getAuthMessage(err, "Login failed"));
    } finally {
      setLoading(false);
    }
  };

  // Password reset
  const [open, setOpen] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [resetError, setResetError] = useState("");
  const [success, setSuccess] = useState(false);
  const [sentTo, setSentTo] = useState("");

  const openModal = () => {
    setResetError("");
    setSuccess(false);
    setOpen(true);
  };
  const closeModal = () => setOpen(false);

  const resetSubmit = async (data: ResetEmailForm) => {
    setResetLoading(true);
    setResetError("");
    try {
      await sendPasswordResetEmail(auth, data.email);
      setSentTo(data.email);
      setSuccess(true);
    } catch (err) {
      setResetError(getAuthMessage(err, "Failed to send reset email"));
    } finally {
      setResetLoading(false);
    }
  };

  return {
    submit, loading, error,
    open, openModal, closeModal, resetSubmit, resetLoading, resetError, success, sentTo,
  };
}
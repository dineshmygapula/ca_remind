// hooks/useSignup.ts
import { useState } from "react";
import { FirebaseError } from "firebase/app";
import { SignupForm } from "@/utils/schema";
import { signupWithEmail } from "@/services/authServices";

export function useSignup() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async (data: SignupForm) => {
    setLoading(true);
    setError("");

    try {
      await signupWithEmail(data.firstName, data.lastName, data.email, data.password);
      // Once created, the user is automatically logged in:
      // onAuthStateChanged in AuthContext triggers, WorkspaceProvider detects "no_org",
      // and useRedirectIfSignedIn automatically routes to /organization-create.
    } catch (err: unknown) {
      if (err instanceof FirebaseError) {
        if (err.code === "auth/email-already-in-use") {
          setError("This email is already registered. Please log in instead.");
          return;
        }
        if (err.code === "auth/weak-password") {
          setError("Password should be at least 6 characters.");
          return;
        }
        if (err.code === "auth/network-request-failed") {
          setError("Network error. Please check your connection.");
          return;
        }
      }
      const message = err instanceof Error ? err.message : "Signup failed. Please try again.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return {
    submit,
    loading,
    error,
    setError,
  };
}
// hooks/useAuthActions.ts
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
    GoogleAuthProvider,
    signInWithPopup,
    sendPasswordResetEmail,
} from "firebase/auth";


import { LoginForm, ResetEmailForm } from "@/utils/schema";
import { useAuth } from "@/context/AuthContext";
import { loginWithEmail } from "@/services/authServices";
import { getOrganizations } from "@/services/organizationService";
import { getBusinesses } from "@/services/businessService";
import { auth } from "@/config/firebase";

export function useAuthActions() {
    const router = useRouter();
    const { refreshAppState } = useAuth();

    // Login
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const submit = async (data: LoginForm) => {
        setLoading(true);
        setError("");

        try {
            await loginWithEmail(data.email, data.password);
            await refreshAppState();

            const orgs = await getOrganizations();

            if (orgs.length === 0) {
                return router.push("/organization-create");
            }

            const businesses = await getBusinesses(orgs[0].id);

            if (businesses.length === 0) {
                return router.push("/business-create");
            }

            router.push("/dashboard");
        } catch (err) {
            setError(err instanceof Error ? err.message : "Login failed");
        } finally {
            setLoading(false);
        }
    };

    // Google Sign In
    const [googleError, setGoogleError] = useState("");

    const signIn = async () => {
        try {
            const provider = new GoogleAuthProvider();
            provider.setCustomParameters({ prompt: "select_account" });

            const result = await signInWithPopup(auth, provider);
            const idToken = await result.user.getIdToken();

            if (typeof window !== "undefined") {
                localStorage.setItem("app_token", `Bearer ${idToken}`);
            }

            router.push("/organization-create");
        } catch (err) {
            setGoogleError(
                err instanceof Error ? err.message : "Google sign-in failed"
            );
        }
    };

    // Password Reset
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
            setResetError(
                err instanceof Error
                    ? err.message
                    : "Failed to send reset email"
            );
        } finally {
            setResetLoading(false);
        }
    };

    return {
        // Login
        submit,
        loading,
        error,

        // Google
        signIn,
        googleError,

        // Password Reset
        open,
        openModal,
        closeModal,
        resetSubmit,
        resetLoading,
        resetError,
        success,
        sentTo,
    };
}
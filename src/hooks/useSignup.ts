// hooks/useSignup.ts
import { useState } from "react";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { SignupForm } from "@/utils/schema";
import { resendVerificationEmail, signupWithEmail } from "@/services/authServices";
import { auth } from "@/config/firebase";
import { useRouter } from "next/navigation";

export function useSignup() {
    const router = useRouter();

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [showResend, setShowResend] = useState(false);
    const [resendLoading, setResendLoading] = useState(false);
    const [signupDone, setSignupDone] = useState(false);
    const [registeredEmail, setRegisteredEmail] = useState("");

    // kept only to support resend-verification, which some backends require
    const [lastPassword, setLastPassword] = useState("");

    const submit = async (data: SignupForm) => {
        setLoading(true);
        setError("");
        setShowResend(false);

        try {
            await signupWithEmail(data.firstName, data.lastName, data.email, data.password);
            setRegisteredEmail(data.email);
            setSignupDone(true);
        } catch (err) {
            const message = err instanceof Error ? err.message : "Signup failed. Please try again.";

            if (message.includes("email-already-in-use") || message.includes("already registered")) {
                setError(
                    "This email is already registered. If you haven't verified it yet, click Resend Verification below."
                );
                setShowResend(true);
                setRegisteredEmail(data.email);
                setLastPassword(data.password);
            } else {
                setError(message);
            }
        } finally {
            setLoading(false);
        }
    };

    const resendVerification = async () => {
        setResendLoading(true);
        try {
            await resendVerificationEmail(registeredEmail, lastPassword);
            setError("Verification email resent! Check your inbox.");
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to resend email.");
        } finally {
            setResendLoading(false);
        }
    };

    const googleSignIn = async () => {
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
            setError(err instanceof Error ? err.message : "Google sign-in failed");
        }
    };

    const goToLogin = () => router.push("/login");

    return {
        submit,
        loading,
        error,
        showResend,
        resendLoading,
        resendVerification,
        googleSignIn,
        signupDone,
        registeredEmail,
        goToLogin,
    };
}
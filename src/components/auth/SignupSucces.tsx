// components/auth/SignupSuccess.tsx
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { AuthLayout } from "../wrappers/AuthLayout";

export function SignupSuccess({ email, onGoToLogin }: { email: string; onGoToLogin: () => void }) {
    return (
        <AuthLayout mode="signup">
            <div className="flex justify-center mb-4">
                <div className="w-14 h-14 rounded-2xl bg-[var(--primary)]/10 flex items-center justify-center">
                    <CheckCircle2 className="w-7 h-7 text-[var(--accent-hover)]" />
                </div>
            </div>

            <div className="text-center">
                <h1 className="text-xl sm:text-2xl font-black tracking-tight text-[var(--heading)]">
                    Check your email
                </h1>
                <p className="mt-2.5 text-xs leading-5 text-[var(--text-secondary)]">
                    We sent a verification link to
                </p>
                <p className="mt-1 text-xs font-bold text-[var(--primary)] break-all">{email}</p>
                <p className="mt-2.5 text-xs leading-5 text-[var(--text-secondary)]">
                    Click the link in that email to verify your account, then return here to log in.
                </p>
            </div>

            <button
                type="button"
                onClick={onGoToLogin}
                className="mt-5 w-full h-10 rounded-lg bg-[var(--primary)] text-white font-bold text-xs flex items-center justify-center gap-2 hover:bg-[var(--primary-hover)] shadow-md hover:shadow-lg"
            >
                Go to Login <ArrowRight className="w-4 h-4" />
            </button>
        </AuthLayout>
    );
}
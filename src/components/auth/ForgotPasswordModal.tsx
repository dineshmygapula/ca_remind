// components/auth/ForgotPasswordModal.tsx
import { X, KeyRound, AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { FormWrapper } from "../wrappers/FormWrapper";
import { InputField } from "../ui/InputField";
import { resetEmailSchema } from "@/utils/schema";

type ResetProps = {
    open: boolean;
    openModal: () => void;
    closeModal: () => void;
    submit: (data: { email: string }) => Promise<void>;
    loading: boolean;
    error: string;
    success: boolean;
    sentTo: string;
};

export function ForgotPasswordModal({
    reset,
    defaultEmail,
}: {
    reset: ResetProps;
    defaultEmail: string;
}) {
    const { open, closeModal, submit, loading, error, success, sentTo } = reset;

    return (
        <dialog className={`modal ${open ? "modal-open" : ""}`}>
            <div className="modal-box p-0 max-w-sm bg-[var(--surface)] border border-[var(--border)] rounded-xl overflow-hidden">
                <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border)]">
                    <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-[var(--primary)]/10 flex items-center justify-center">
                            <KeyRound className="w-4 h-4 text-[var(--primary)]" />
                        </div>
                        <div>
                            <h2 className="text-sm font-bold text-[var(--heading)]">
                                Reset your password
                            </h2>
                            <p className="text-[11px] text-[var(--text-secondary)] mt-0.5">
                                We'll send you a reset link
                            </p>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={closeModal}
                        className="btn btn-ghost btn-xs btn-circle"
                        aria-label="Close"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                <div className="p-5">
                    {success ? (
                        <div
                            role="alert"
                            className="alert alert-success rounded-lg p-3 bg-green-50 border border-green-200 items-start gap-2.5"
                        >
                            <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
                            <div>
                                <p className="text-xs font-semibold text-green-800">
                                    Password reset email sent
                                </p>
                                <p className="text-xs text-green-700 mt-0.5">
                                    Check your inbox at <strong>{sentTo}</strong>.
                                </p>
                            </div>
                        </div>
                    ) : (
                        <FormWrapper
                            formId="reset-form"
                            schema={resetEmailSchema}
                            defaultValues={{ email: defaultEmail }}
                            onSubmit={submit}
                        >
                            <p className="text-xs text-[var(--text-secondary)] leading-5 mb-3.5">
                                Enter the email address linked to your account and we'll send you a reset link.
                            </p>

                            {error && (
                                <div
                                    role="alert"
                                    className="alert alert-error mb-3 py-2 px-3 rounded-lg text-red-700 bg-red-50 border border-red-200 items-start gap-2"
                                >
                                    <AlertCircle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                                    <span className="text-xs">{error}</span>
                                </div>
                            )}

                            <InputField
                                name="email"
                                label="Email address"
                                placeholder="name@yourfirm.com"
                            />
                        </FormWrapper>
                    )}
                </div>

                <div className="flex justify-end gap-2.5 px-5 py-3.5 border-t border-[var(--border)]">
                    <button
                        type="button"
                        onClick={closeModal}
                        className="btn btn-outline h-8 min-h-8 px-3.5 rounded-lg text-xs font-semibold"
                    >
                        {success ? "Close" : "Cancel"}
                    </button>

                    {!success && (
                        <button
                            type="submit"
                            form="reset-form"
                            disabled={loading}
                            className="btn h-8 min-h-8 px-4 rounded-lg bg-[var(--primary)] border-none text-white text-xs font-semibold flex items-center gap-2 disabled:opacity-50"
                        >
                            {loading && (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            )}
                            {loading ? "Sending..." : "Send Reset Link"}
                        </button>
                    )}
                </div>
            </div>

            <form
                method="dialog"
                className="modal-backdrop bg-[var(--primary)]/50 backdrop-blur-sm"
            >
                <button type="button" onClick={closeModal}>
                    close
                </button>
            </form>
        </dialog>
    );
}
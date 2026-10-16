"use client";

import Link from "next/link";
import { Mail, ArrowRight, Loader2, AlertCircle } from "lucide-react";
import { AuthLayout } from "../wrappers/AuthLayout";
import { FormWrapper } from "../wrappers/FormWrapper";
import { InputField } from "../ui/InputField";
import { PasswordField } from "../ui/PasswordField";
import { CheckboxField } from "../ui/CheckboxField";
import { ForgotPasswordModal } from "./ForgotPasswordModal";
import { loginSchema } from "@/utils/schema";
import GoogleIcon from "../common/GoogleIcon";
import { useAuthActions } from "@/hooks/useAuthActions";
import { useRedirectIfSignedIn } from "@/hooks/useRedirectAfterSignin";

const ErrorAlert = ({ message }: { message: string }) => (
  <div
    role="alert"
    className="alert alert-error mb-3.5 py-2 px-3 rounded-lg text-red-700 bg-red-50 border border-red-200 items-start gap-2"
  >
    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
    <span className="text-xs">{message}</span>
  </div>
);

export default function LoginForm() {
  useRedirectIfSignedIn();

  const {
    submit, loading, error,
    signIn: googleSignIn, googleLoading, googleError,
    open, openModal, closeModal, resetSubmit, resetLoading, resetError, success, sentTo,
  } = useAuthActions();

  const reset = {
    open, openModal, closeModal,
    submit: resetSubmit,
    loading: resetLoading,
    error: resetError,
    success, sentTo,
  };

  return (
    <AuthLayout mode="login">
      <div className="mb-4">
        <h1 className="text-xl sm:text-2xl font-black tracking-tight text-[var(--heading)]">
          Welcome back
        </h1>
        <p className="mt-1.5 text-xs text-[var(--text-secondary)]">
          Sign in to manage your compliance tasks and reminders.
        </p>
      </div>

      {(error || googleError) && <ErrorAlert message={error || googleError} />}

      <FormWrapper
        schema={loginSchema}
        defaultValues={{ email: "", password: "", rememberMe: false }}
        onSubmit={submit}
        className="space-y-3"
      >
        <InputField name="email" label="Email address" placeholder="name@yourfirm.com" icon={Mail} />
        <PasswordField name="password" label="Password" placeholder="Enter your password" />

        <div className="flex justify-end -mt-1">
          <button
            type="button"
            onClick={openModal}
            className="btn btn-link btn-xs no-underline hover:underline p-0 h-auto min-h-0 text-xs font-semibold text-[var(--primary)]"
          >
            Forgot password?
          </button>
        </div>

        <CheckboxField name="rememberMe" label="Remember me" />

        <button
          type="submit"
          disabled={loading || googleLoading}
          className="btn mt-1 w-full h-10 min-h-10 rounded-lg bg-[var(--primary)] border-none text-white font-bold text-xs flex items-center justify-center gap-2 disabled:opacity-50 shadow-md hover:shadow-lg"
        >
          {loading ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Logging in...</>
          ) : (
            <>Log in <ArrowRight className="w-4 h-4" /></>
          )}
        </button>
      </FormWrapper>

      <div className="divider text-[10px] font-semibold text-[var(--text-secondary)] my-4">OR</div>

      <button
        type="button"
        onClick={googleSignIn}
        disabled={googleLoading || loading}
        className="btn btn-outline w-full h-10 min-h-10 rounded-lg text-xs font-semibold flex items-center justify-center gap-2.5 disabled:opacity-50"
      >
        {googleLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <GoogleIcon />}
        <span>Continue with Google</span>
      </button>

      <p className="text-center text-xs text-[var(--text-secondary)] mt-4">
        Don't have an account?{" "}
        <Link href="/signup" className="font-bold text-[var(--primary)] hover:underline">
          Sign up
        </Link>
      </p>

      <ForgotPasswordModal reset={reset} defaultEmail="" />
    </AuthLayout>
  );
}
"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, ArrowRight, Loader2, AlertCircle } from "lucide-react";
import { AuthLayout } from "../wrappers/AuthLayout";
import { FormWrapper } from "../wrappers/FormWrapper";
import { InputField } from "../ui/InputField";
import { PasswordField } from "../ui/PasswordField";
import { CheckboxField } from "../ui/CheckboxField";
import { ForgotPasswordModal } from "./ForgotPasswordModal";
import { loginSchema } from "@/utils/schema";
import GoogleSignInButton from "../common/GoogleSignInButton";
import { useAuthActions } from "@/hooks/useAuthActions";
import { useRedirectIfSignedIn } from "@/hooks/useRedirectAfterSignin";

const ErrorAlert = ({ message }: { message: string }) => (
  <div
    role="alert"
    className="alert alert-error mb-5 py-3 px-4 rounded-xl text-red-700 bg-red-50 border border-red-200 items-start gap-2.5"
  >
    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
    <span className="text-sm">{message}</span>
  </div>
);

export default function LoginForm() {
  useRedirectIfSignedIn();
  const [googleError, setGoogleError] = useState("");

  const {
    submit, loading, error,
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
      <div className="mb-7">
        <h1 className="text-3xl sm:text-[34px] leading-tight font-extrabold tracking-tight text-[var(--heading)]">
          Welcome back
        </h1>
        <p className="mt-1.5 text-base text-[var(--text-secondary)]">
          Sign in to manage your compliance tasks and reminders.
        </p>
      </div>

      {(error || googleError) && <ErrorAlert message={error || googleError} />}

      <FormWrapper
        schema={loginSchema}
        defaultValues={{ email: "", password: "", rememberMe: false }}
        onSubmit={submit}
        className="space-y-5"
      >
        <InputField name="email" label="Email address" placeholder="name@yourfirm.com" icon={Mail} />
        <PasswordField name="password" label="Password" placeholder="Enter your password" />

        <div className="flex items-center justify-between -mt-1">
          <CheckboxField name="rememberMe" label="Remember me" />
          <button
            type="button"
            onClick={openModal}
            className="min-h-11 px-1 text-sm font-bold text-[var(--primary)] hover:underline"
          >
            Forgot password?
          </button>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="btn w-full h-[54px] min-h-[54px] rounded-[14px] bg-[var(--primary)] border-none text-white text-base font-extrabold flex items-center justify-center gap-2.5 disabled:opacity-50 shadow-[0_8px_20px_rgba(20,34,77,0.22)] hover:shadow-[0_10px_24px_rgba(20,34,77,0.3)]"
        >
          {loading ? (
            <><Loader2 className="w-[18px] h-[18px] animate-spin" /> Logging in...</>
          ) : (
            <>Log in <ArrowRight className="w-[18px] h-[18px] text-[#F2B63F]" strokeWidth={2.4} /></>
          )}
        </button>
      </FormWrapper>

      <div className="divider text-xs font-bold tracking-wider text-[var(--text-secondary)] my-6">OR</div>

      <GoogleSignInButton disabled={loading} onError={setGoogleError} />

      <p className="text-center text-sm text-[var(--text-secondary)] mt-6">
        Don't have an account?{" "}
        <Link href="/signup" className="inline-block px-1 py-3 font-extrabold text-[var(--primary)] hover:underline">
          Sign up
        </Link>
      </p>

      <ForgotPasswordModal reset={reset} defaultEmail="" />
    </AuthLayout>
  );
}
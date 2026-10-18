"use client";

import Link from "next/link";
import { User, Mail, ArrowRight, Loader2, AlertCircle } from "lucide-react";
import { AuthLayout } from "../wrappers/AuthLayout";
import { FormWrapper } from "../wrappers/FormWrapper";
import { InputField } from "../ui/InputField";
import { PasswordField } from "../ui/PasswordField";
import { PasswordRequirements } from "./PasswordRequirements";
import { signupSchema } from "@/utils/schema";
import { useSignup } from "@/hooks/useSignup";
import { GoogleSignInButton } from "../common/GoogleSignInButton";
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

export default function SignupForm() {
  useRedirectIfSignedIn();

  const { submit, loading, error, setError } = useSignup();

  return (
    <AuthLayout mode="signup">
      <div className="mb-7">
        <h1 className="text-3xl sm:text-[34px] leading-tight font-extrabold tracking-tight text-[var(--heading)]">
          Create your account
        </h1>
        <p className="mt-1.5 text-base text-[var(--text-secondary)]">
          Start your 14-day free trial. No credit card required.
        </p>
      </div>

      {error && <ErrorAlert message={error} />}

      <FormWrapper
        schema={signupSchema}
        defaultValues={{ firstName: "", lastName: "", email: "", password: "", confirmPassword: "" }}
        onSubmit={submit}
        className="space-y-5"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <InputField name="firstName" label="First name" placeholder="First name" icon={User} />
          <InputField name="lastName" label="Last name" placeholder="Last name" icon={User} />
        </div>

        <InputField name="email" label="Email address" placeholder="name@yourfirm.com" icon={Mail} />
        <PasswordField name="password" label="Password" placeholder="Enter your password" />
        <PasswordField name="confirmPassword" label="Confirm password" placeholder="Re-enter your password" />

        <PasswordRequirements name="password" />

        <button
          type="submit"
          disabled={loading}
          className="btn w-full h-[54px] min-h-[54px] rounded-[14px] bg-[var(--primary)] border-none text-white text-base font-extrabold flex items-center justify-center gap-2.5 disabled:opacity-50 shadow-[0_8px_20px_rgba(20,34,77,0.22)] hover:shadow-[0_10px_24px_rgba(20,34,77,0.3)]"
        >
          {loading ? (
            <><Loader2 className="w-[18px] h-[18px] animate-spin" /> Creating account...</>
          ) : (
            <>Start your trial <ArrowRight className="w-[18px] h-[18px] text-[#F2B63F]" strokeWidth={2.4} /></>
          )}
        </button>
      </FormWrapper>

      <div className="divider text-xs font-bold tracking-wider text-[var(--text-secondary)] my-6">OR</div>

      <GoogleSignInButton disabled={loading} onError={setError} />

      <p className="text-center text-sm text-[var(--text-secondary)] mt-6">
        Already have an account?{" "}
        <Link href="/login" className="inline-block px-1 py-3 font-extrabold text-[var(--primary)] hover:underline">
          Log in
        </Link>
      </p>
    </AuthLayout>
  );
}
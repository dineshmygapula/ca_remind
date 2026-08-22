// "use client";

// import React, { useState } from "react";
// import { useRouter } from "next-nprogress-bar";
// import {
//   Bell,
//   Mail,
//   Lock,
//   Eye,
//   EyeOff,
//   ArrowRight,
//   Loader2,
//   AlertCircle,
//   CheckCircle2,
//   KeyRound,
//   X,
//   ShieldCheck,
// } from "lucide-react";

// import { auth } from "../../config/firebase";
// import {
//   GoogleAuthProvider,
//   signInWithPopup,
//   sendPasswordResetEmail,
// } from "firebase/auth";

// import { loginWithEmail } from "../../services/authServices";
// import { useAuth } from "@/context/AuthContext";
// import { getOrganizations } from "../../services/organizationService";
// import { getBusinesses } from "../../services/businessService";
// import { GoogleIcon } from "../common/GoogleIcon";

// const isValidEmail = (value: string) =>
//   /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

// export default function LoginForm() {
//   const router = useRouter();
//   const { refreshAppState } = useAuth();

//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [rememberMe, setRememberMe] = useState(false);

//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");
//   const [showPassword, setShowPassword] = useState(false);

//   const [touched, setTouched] = useState({
//     email: false,
//     password: false,
//   });

//   const [forgotOpen, setForgotOpen] = useState(false);
//   const [resetEmail, setResetEmail] = useState("");
//   const [resetLoading, setResetLoading] = useState(false);
//   const [resetError, setResetError] = useState("");
//   const [resetSuccess, setResetSuccess] = useState(false);
//   const [resetTouched, setResetTouched] = useState(false);

//   const getPasswordError = () => {
//     if (!touched.password) return "";

//     if (!password.trim()) {
//       return "Password is required";
//     }

//     return "";
//   };

//   const getResetEmailError = () => {
//     if (!resetTouched) return "";

//     if (!resetEmail.trim()) {
//       return "Email address is required";
//     }

//     if (!isValidEmail(resetEmail)) {
//       return "Please enter a valid email address";
//     }

//     return "";
//   };

//   const isFormValid =
//     isValidEmail(email) && password.trim().length > 0;

//   const isResetEmailValid =
//     resetEmail.trim().length > 0 && isValidEmail(resetEmail);

//   const handleLogin = async () => {
//     setTouched({
//       email: true,
//       password: true,
//     });

//     if (!isFormValid) return;

//     setLoading(true);
//     setError("");

//     try {
//       await loginWithEmail(email, password);

//       await refreshAppState();

//       const orgs = await getOrganizations();

//       if (orgs.length === 0) {
//         router.push("/organization-create");
//         return;
//       }

//       const businesses = await getBusinesses(orgs[0].id);

//       if (businesses.length === 0) {
//         router.push("/business-create");
//         return;
//       }

//       router.push("/dashboard");
//     } catch (err) {
//       setError(err instanceof Error ? err.message : "Login failed");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleGoogleSignIn = async () => {
//     try {
//       const provider = new GoogleAuthProvider();

//       provider.setCustomParameters({
//         prompt: "select_account",
//       });

//       const result = await signInWithPopup(auth, provider);

//       const idToken = await result.user.getIdToken();

//       if (typeof window !== "undefined") {
//         localStorage.setItem("app_token", `Bearer ${idToken}`);
//       }

//       router.push("/organization-create");
//     } catch (err: unknown) {
//       setError(
//         err instanceof Error ? err.message : "Google sign-in failed"
//       );
//     }
//   };

//   const handleOpenForgot = () => {
//     setResetEmail(email);
//     setResetError("");
//     setResetSuccess(false);
//     setResetTouched(false);
//     setForgotOpen(true);
//   };

//   const handleCloseForgot = () => {
//     setForgotOpen(false);
//     setResetEmail("");
//     setResetError("");
//     setResetSuccess(false);
//     setResetTouched(false);
//   };

//   const handlePasswordReset = async () => {
//     setResetTouched(true);

//     if (!isResetEmailValid) return;

//     setResetLoading(true);
//     setResetError("");

//     try {
//       await sendPasswordResetEmail(auth, resetEmail);

//       setResetSuccess(true);
//     } catch (err: unknown) {
//       setResetError(
//         err instanceof Error ? err.message : "Failed to send reset email"
//       );
//     } finally {
//       setResetLoading(false);
//     }
//   };

//   return (
//     <div className="h-screen w-full overflow-hidden bg-[var(--bg)] flex items-center justify-center p-3">
//       {/* Main Container */}
//       <div className="w-full h-full max-h-[720px] max-w-[1200px] overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-2xl flex">
//         {/* ===================================================== */}
//         {/* LEFT BRAND PANEL                                      */}
//         {/* ===================================================== */}

//         <div className="hidden lg:flex lg:w-[46%] relative overflow-hidden bg-[var(--primary)] text-white">
//           {/* Decorative circles */}
//           <div className="absolute -top-24 -left-24 w-[360px] h-[360px] rounded-full border border-[var(--accent)]/20" />
//           <div className="absolute top-16 -right-36 w-[440px] h-[440px] rounded-full border border-[var(--accent)]/20" />
//           <div className="absolute -bottom-36 -left-24 w-[440px] h-[440px] rounded-full border border-[var(--accent)]/20" />

//           {/* Content */}
//           <div className="relative z-10 w-full flex flex-col justify-between p-7 xl:p-9">
//             {/* Logo */}
//             <div className="flex items-center gap-2.5">
//               <div className="w-8 h-8 rounded-lg bg-[var(--accent)] flex items-center justify-center shadow-lg">
//                 <Bell className="w-4 h-4 text-[var(--primary)]" />
//               </div>
//               <div className="text-lg font-black tracking-tight">
//                 Remind
//                 <span className="text-[var(--accent)]">CA</span>
//               </div>
//             </div>

//             {/* Main Message */}
//             <div className="max-w-xl">
//               <div className="inline-flex items-center gap-1.5 mb-3.5 px-2.5 py-1 rounded-full border border-[var(--accent)]/30 bg-[var(--accent)]/10">
//                 <ShieldCheck className="w-3.5 h-3.5 text-[var(--accent)]" />
//                 <span className="text-[11px] font-semibold text-[var(--accent)]">
//                   Compliance made simple
//                 </span>
//               </div>

//               <h2 className="text-2xl xl:text-3xl font-black leading-[1.12] tracking-tight">
//                 Never miss a
//                 <br />
//                 compliance
//                 <br />
//                 deadline
//                 <br />
//                 again.
//               </h2>

//               <p className="mt-3.5 max-w-md text-sm leading-6 text-slate-300">
//                 Automated reminders, delivery tracking, and client alerts —
//                 all in one place for your practice.
//               </p>
//             </div>

//             {/* Stats */}
//             <div className="grid grid-cols-3 gap-4 max-w-xl">
//               <div>
//                 <div className="text-lg xl:text-xl font-black text-[var(--accent)]">
//                   132
//                 </div>
//                 <div className="mt-0.5 text-[11px] text-slate-300 leading-4">
//                   Delivered
//                   <br />
//                   this month
//                 </div>
//               </div>

//               <div>
//                 <div className="text-lg xl:text-xl font-black text-[var(--accent)]">
//                   99.4%
//                 </div>
//                 <div className="mt-0.5 text-[11px] text-slate-300 leading-4">
//                   Delivery
//                   <br />
//                   rate
//                 </div>
//               </div>

//               <div>
//                 <div className="text-lg xl:text-xl font-black text-[var(--accent)]">
//                   48
//                 </div>
//                 <div className="mt-0.5 text-[11px] text-slate-300 leading-4">
//                   Active
//                   <br />
//                   reminders
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* ===================================================== */}
//         {/* RIGHT LOGIN PANEL                                     */}
//         {/* ===================================================== */}

//         <div className="w-full lg:w-[54%] bg-[var(--surface)] flex items-center justify-center overflow-y-auto">
//           <div className="w-full max-w-sm px-6 py-6 sm:px-8">
//             {/* Mobile Logo */}
//             <div className="flex lg:hidden items-center justify-center gap-2 mb-5">
//               <div className="w-8 h-8 rounded-lg bg-[var(--accent)] flex items-center justify-center shadow-md">
//                 <Bell className="w-4 h-4 text-[var(--primary)]" />
//               </div>
//               <div className="text-lg font-black text-[var(--primary)]">
//                 Remind
//                 <span className="text-[var(--accent-hover)]">CA</span>
//               </div>
//             </div>

//             {/* Welcome */}
//             <div className="mb-4">
//               <h1 className="text-xl sm:text-2xl font-black tracking-tight leading-tight text-[var(--heading)]">
//                 Welcome back
//               </h1>
//               <p className="mt-1.5 text-xs leading-5 text-[var(--text-secondary)] max-w-sm">
//                 Sign in to manage your compliance tasks and reminders.
//               </p>
//             </div>

//             {/* Error */}
//             {error && (
//               <div
//                 role="alert"
//                 className="alert alert-error mb-3.5 py-2 px-3 rounded-lg text-red-700 bg-red-50 border border-red-200 items-start gap-2"
//               >
//                 <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
//                 <span className="text-xs leading-4">{error}</span>
//               </div>
//             )}

//             {/* ================================================= */}
//             {/* EMAIL                                             */}
//             {/* ================================================= */}

//             <div className="form-control w-full">
//               <label htmlFor="login-email" className="label py-0 mb-1">
//                 <span className="label-text text-xs font-bold text-[var(--text-primary)]">
//                   Email address
//                 </span>
//               </label>

//               <div className="relative">
//                 <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-secondary)] pointer-events-none z-10" />
//                 <input
//                   id="login-email"
//                   type="email"
//                   value={email}
//                   onChange={(e) => setEmail(e.target.value)}
//                   onBlur={() =>
//                     setTouched((prev) => ({ ...prev, email: true }))
//                   }
//                   placeholder="name@yourfirm.com"
//                   className={`input input-bordered w-full h-10 min-h-10 pl-9 pr-3 text-xs bg-[var(--surface)] text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] rounded-lg ${touched.email && !isValidEmail(email)
//                     ? "border-red-400 focus:outline-red-200"
//                     : "border-[var(--border)] hover:border-[var(--primary)]/40 focus:border-[var(--primary)] focus:outline-[var(--primary)]/20"
//                     }`}
//                 />
//               </div>

//               {touched.email && !email.trim() && (
//                 <span className="mt-1 text-[11px] text-red-600">
//                   Email address is required
//                 </span>
//               )}

//               {touched.email && email.trim() && !isValidEmail(email) && (
//                 <span className="mt-1 text-[11px] text-red-600">
//                   Please enter a valid email address
//                 </span>
//               )}
//             </div>

//             {/* ================================================= */}
//             {/* PASSWORD                                          */}
//             {/* ================================================= */}

//             <div className="form-control w-full mt-3">
//               <label htmlFor="login-password" className="label py-0 mb-1">
//                 <span className="label-text text-xs font-bold text-[var(--text-primary)]">
//                   Password
//                 </span>
//               </label>

//               <div className="relative">
//                 <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-secondary)] pointer-events-none z-10" />
//                 <input
//                   id="login-password"
//                   type={showPassword ? "text" : "password"}
//                   value={password}
//                   onChange={(e) => setPassword(e.target.value)}
//                   onBlur={() =>
//                     setTouched((prev) => ({ ...prev, password: true }))
//                   }
//                   placeholder="Enter your password"
//                   onKeyDown={(e) => {
//                     if (e.key === "Enter" && isFormValid && !loading) {
//                       handleLogin();
//                     }
//                   }}
//                   className={`input input-bordered w-full h-10 min-h-10 pl-9 pr-10 text-xs bg-[var(--surface)] text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] rounded-lg ${getPasswordError()
//                     ? "border-red-400 focus:outline-red-200"
//                     : "border-[var(--border)] hover:border-[var(--primary)]/40 focus:border-[var(--primary)] focus:outline-[var(--primary)]/20"
//                     }`}
//                 />

//                 <button
//                   type="button"
//                   onClick={() => setShowPassword((prev) => !prev)}
//                   className="btn btn-ghost btn-xs btn-circle absolute right-2 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] hover:text-[var(--heading)] hover:bg-[var(--bg)]"
//                   aria-label={showPassword ? "Hide password" : "Show password"}
//                 >
//                   {showPassword ? (
//                     <EyeOff className="w-4 h-4" />
//                   ) : (
//                     <Eye className="w-4 h-4" />
//                   )}
//                 </button>
//               </div>

//               {getPasswordError() && (
//                 <span className="mt-1 text-[11px] text-red-600">
//                   {getPasswordError()}
//                 </span>
//               )}
//             </div>

//             {/* Forgot Password */}
//             <div className="flex justify-end mt-2">
//               <button
//                 type="button"
//                 onClick={handleOpenForgot}
//                 className="btn btn-link btn-xs no-underline hover:underline p-0 h-auto min-h-0 text-xs font-semibold text-[var(--primary)] hover:text-[var(--accent-hover)]"
//               >
//                 Forgot password?
//               </button>
//             </div>

//             {/* Remember Me */}
//             <label className="mt-3 flex items-center gap-2 cursor-pointer select-none">
//               <input
//                 type="checkbox"
//                 checked={rememberMe}
//                 onChange={(e) => setRememberMe(e.target.checked)}
//                 className="checkbox checkbox-xs rounded border-[var(--border)] [--chkbg:var(--primary)] [--chkfg:white]"
//               />
//               <span className="text-xs text-[var(--text-secondary)]">
//                 Remember me
//               </span>
//             </label>

//             {/* Login Button */}
//             <button
//               type="button"
//               onClick={handleLogin}
//               disabled={loading || !isFormValid}
//               className="btn mt-4 w-full h-10 min-h-10 rounded-lg bg-[var(--primary)] border-none text-white font-bold text-xs flex items-center justify-center gap-2 hover:bg-[var(--primary-hover)] disabled:opacity-50 shadow-md hover:shadow-lg"
//             >
//               {loading ? (
//                 <>
//                   <Loader2 className="w-4 h-4 animate-spin" />
//                   Logging in...
//                 </>
//               ) : (
//                 <>
//                   Log in
//                   <ArrowRight className="w-4 h-4" />
//                 </>
//               )}
//             </button>

//             {/* Divider */}
//             <div className="divider text-[10px] font-semibold text-[var(--text-secondary)] my-4">
//               OR
//             </div>

//             {/* Google */}
//             <button
//               type="button"
//               onClick={handleGoogleSignIn}
//               className="btn btn-outline w-full h-10 min-h-10 rounded-lg border-[var(--border)] bg-[var(--surface)] text-[var(--text-primary)] font-semibold text-xs flex items-center justify-center gap-2.5 hover:bg-[var(--bg)] hover:border-[var(--primary)]/50"
//             >
//               <GoogleIcon />
//               <span>Continue with Google</span>
//             </button>

//             {/* Signup */}
//             <p className="text-center text-xs text-[var(--text-secondary)] mt-4">
//               Don't have an account?{" "}
//               <button
//                 type="button"
//                 onClick={() => router.push("/signup")}
//                 className="font-bold text-[var(--primary)] hover:text-[var(--accent-hover)] hover:underline cursor-pointer transition-colors"
//               >
//                 Sign up
//               </button>
//             </p>
//           </div>
//         </div>
//       </div>

//       {/* ===================================================== */}
//       {/* FORGOT PASSWORD MODAL                                 */}
//       {/* ===================================================== */}

//       <dialog className={`modal ${forgotOpen ? "modal-open" : ""}`}>
//         <div className="modal-box p-0 max-w-sm bg-[var(--surface)] border border-[var(--border)] rounded-xl overflow-hidden">
//           {/* Header */}
//           <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border)]">
//             <div className="flex items-center gap-2.5">
//               <div className="w-8 h-8 rounded-lg bg-[var(--primary)]/10 flex items-center justify-center">
//                 <KeyRound className="w-4 h-4 text-[var(--primary)]" />
//               </div>
//               <div>
//                 <h2 className="text-sm font-bold text-[var(--heading)]">
//                   Reset your password
//                 </h2>
//                 <p className="text-[11px] text-[var(--text-secondary)] mt-0.5">
//                   We'll send you a reset link
//                 </p>
//               </div>
//             </div>

//             <button
//               type="button"
//               onClick={handleCloseForgot}
//               className="btn btn-ghost btn-xs btn-circle text-[var(--text-secondary)] hover:text-[var(--heading)] hover:bg-[var(--bg)]"
//               aria-label="Close"
//             >
//               <X className="w-4 h-4" />
//             </button>
//           </div>

//           {/* Content */}
//           <div className="p-5">
//             {resetSuccess ? (
//               <div
//                 role="alert"
//                 className="alert alert-success rounded-lg p-3 bg-green-50 border border-green-200 items-start gap-2.5"
//               >
//                 <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
//                 <div>
//                   <p className="text-xs font-semibold text-green-800">
//                     Password reset email sent
//                   </p>
//                   <p className="text-xs text-green-700 mt-0.5">
//                     Check your inbox at <strong>{resetEmail}</strong>.
//                   </p>
//                 </div>
//               </div>
//             ) : (
//               <>
//                 <p className="text-xs text-[var(--text-secondary)] leading-5 mb-3.5">
//                   Enter the email address linked to your account and we'll
//                   send you a reset link.
//                 </p>

//                 {resetError && (
//                   <div
//                     role="alert"
//                     className="alert alert-error mb-3 py-2 px-3 rounded-lg text-red-700 bg-red-50 border border-red-200 items-start gap-2"
//                   >
//                     <AlertCircle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
//                     <span className="text-xs">{resetError}</span>
//                   </div>
//                 )}

//                 <div className="form-control w-full">
//                   <label htmlFor="reset-email" className="label py-0 mb-1">
//                     <span className="label-text text-xs font-bold text-[var(--text-primary)]">
//                       Email address
//                     </span>
//                   </label>

//                   <div className="relative">
//                     <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-secondary)] pointer-events-none z-10" />
//                     <input
//                       id="reset-email"
//                       type="email"
//                       value={resetEmail}
//                       onChange={(e) => setResetEmail(e.target.value)}
//                       onBlur={() => setResetTouched(true)}
//                       onKeyDown={(e) => {
//                         if (e.key === "Enter") {
//                           handlePasswordReset();
//                         }
//                       }}
//                       placeholder="name@yourfirm.com"
//                       className={`input input-bordered w-full h-9 min-h-9 pl-9 pr-3 text-xs bg-[var(--surface)] text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] rounded-lg ${getResetEmailError()
//                         ? "border-red-400 focus:outline-red-200"
//                         : "border-[var(--border)] focus:border-[var(--primary)] focus:outline-[var(--primary)]/20"
//                         }`}
//                     />
//                   </div>

//                   {getResetEmailError() && (
//                     <span className="mt-1 text-[11px] text-red-600">
//                       {getResetEmailError()}
//                     </span>
//                   )}
//                 </div>
//               </>
//             )}
//           </div>

//           {/* Actions */}
//           <div className="flex justify-end gap-2.5 px-5 py-3.5 border-t border-[var(--border)]">
//             <button
//               type="button"
//               onClick={handleCloseForgot}
//               className="btn btn-outline h-8 min-h-8 px-3.5 rounded-lg border-[var(--border)] text-xs font-semibold text-[var(--text-primary)] hover:bg-[var(--bg)]"
//             >
//               {resetSuccess ? "Close" : "Cancel"}
//             </button>

//             {!resetSuccess && (
//               <button
//                 type="button"
//                 onClick={handlePasswordReset}
//                 disabled={resetLoading || !isResetEmailValid}
//                 className="btn h-8 min-h-8 px-4 rounded-lg bg-[var(--primary)] border-none text-white text-xs font-semibold flex items-center gap-2 hover:bg-[var(--primary-hover)] disabled:opacity-50"
//               >
//                 {resetLoading && (
//                   <Loader2 className="w-3.5 h-3.5 animate-spin" />
//                 )}
//                 {resetLoading ? "Sending..." : "Send Reset Link"}
//               </button>
//             )}
//           </div>
//         </div>

//         {/* Backdrop */}
//         <form method="dialog" className="modal-backdrop bg-[var(--primary)]/50 backdrop-blur-sm">
//           <button type="button" onClick={handleCloseForgot}>close</button>
//         </form>
//       </dialog>
//     </div>
//   );
// }
// components/auth/LoginForm.tsx
// components/auth/LoginForm.tsx
import { useRouter } from "next/navigation";
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

export default function LoginForm() {
  const router = useRouter();
  const {
    submit,
    loading,
    error,
    signIn: googleSignIn,
    open,
    openModal,
    closeModal,
    resetSubmit,
    resetLoading,
    resetError,
    success,
    sentTo,
  } = useAuthActions();

  const reset = {
    open,
    openModal,
    closeModal,
    submit: resetSubmit,
    loading: resetLoading,
    error: resetError,
    success,
    sentTo,
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

      {error && (
        <div role="alert" className="alert alert-error mb-3.5 py-2 px-3 rounded-lg text-red-700 bg-red-50 border border-red-200 items-start gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span className="text-xs">{error}</span>
        </div>
      )}

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
            onClick={reset.openModal}
            className="btn btn-link btn-xs no-underline hover:underline p-0 h-auto min-h-0 text-xs font-semibold text-[var(--primary)]"
          >
            Forgot password?
          </button>
        </div>

        <CheckboxField name="rememberMe" label="Remember me" />

        <button
          type="submit"
          disabled={loading}
          className="btn mt-1 w-full h-10 min-h-10 rounded-lg bg-[var(--primary)] border-none text-white font-bold text-xs flex items-center justify-center gap-2 disabled:opacity-50 shadow-md hover:shadow-lg"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" /> Logging in...
            </>
          ) : (
            <>
              Log in <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </FormWrapper>

      <div className="divider text-[10px] font-semibold text-[var(--text-secondary)] my-4">OR</div>

      <button
        type="button"
        onClick={googleSignIn}
        className="btn btn-outline w-full h-10 min-h-10 rounded-lg text-xs font-semibold flex items-center justify-center gap-2.5"
      >
        <GoogleIcon />
        <span>Continue with Google</span>
      </button>

      <p className="text-center text-xs text-[var(--text-secondary)] mt-4">
        Don't have an account?{" "}
        <button type="button" onClick={() => router.push("/signup")} className="font-bold text-[var(--primary)] hover:underline">
          Sign up
        </button>
      </p>

      <ForgotPasswordModal reset={reset} defaultEmail="" />
    </AuthLayout>
  );
}
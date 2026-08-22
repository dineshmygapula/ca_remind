// "use client";

// import React, { useState } from "react";
// import {
//   Bell,
//   Mail,
//   Lock,
//   Eye,
//   EyeOff,
//   User,
//   ArrowRight,
//   Loader2,
//   AlertCircle,
//   CheckCircle2,
//   Circle,
//   ShieldCheck,
// } from "lucide-react";

// import {
//   signupWithEmail,
//   resendVerificationEmail,
// } from "../../services/authServices";

// import { auth } from "../../config/firebase";

// import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";

// import GoogleIcon from "../common/GoogleIcon";
// import { useRouter } from "next-nprogress-bar";

// interface PasswordRules {
//   minLength: boolean;
//   hasUpper: boolean;
//   hasLower: boolean;
//   hasNumber: boolean;
//   hasSpecial: boolean;
//   match: boolean;
// }

// const PASSWORD_RULE_LABELS: {
//   key: keyof PasswordRules;
//   label: string;
// }[] = [
//     {
//       key: "minLength",
//       label: "At least 8 characters",
//     },
//     {
//       key: "hasUpper",
//       label: "One uppercase letter (A-Z)",
//     },
//     {
//       key: "hasLower",
//       label: "One lowercase letter (a-z)",
//     },
//     {
//       key: "hasNumber",
//       label: "One number (0-9)",
//     },
//     {
//       key: "hasSpecial",
//       label: "One special character (!@#$%^&*)",
//     },
//     {
//       key: "match",
//       label: "Both passwords must match",
//     },
//   ];

// export default function SignupForm() {
//   const router = useRouter();

//   const [firstName, setFirstName] = useState("");
//   const [lastName, setLastName] = useState("");
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [confirmPassword, setConfirmPassword] = useState("");

//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");

//   const [showPassword, setShowPassword] = useState(false);
//   const [showConfirm, setShowConfirm] = useState(false);

//   const [signupDone, setSignupDone] = useState(false);

//   const [showResend, setShowResend] = useState(false);

//   const [resendLoading, setResendLoading] = useState(false);

//   const [touched, setTouched] = useState({
//     firstName: false,
//     lastName: false,
//     password: false,
//     confirmPassword: false,
//   });

//   const [forceError, setForceError] = useState(false);

//   const handleBlur = (field: keyof typeof touched) => {
//     setTouched((prev) => ({
//       ...prev,
//       [field]: true,
//     }));
//   };

//   const getFirstNameError = () => {
//     if (!touched.firstName && !forceError) {
//       return "";
//     }

//     if (!firstName.trim()) {
//       return "First Name is required";
//     }

//     if (firstName.trim().length < 2) {
//       return "First Name must be at least 2 characters";
//     }

//     return "";
//   };

//   const getLastNameError = () => {
//     if (!touched.lastName && !forceError) {
//       return "";
//     }

//     if (!lastName.trim()) {
//       return "Last Name is required";
//     }

//     return "";
//   };

//   const passwordRules: PasswordRules = {
//     minLength: password.length >= 8,
//     hasUpper: /[A-Z]/.test(password),
//     hasLower: /[a-z]/.test(password),
//     hasNumber: /[0-9]/.test(password),
//     hasSpecial: /[!@#$%^&*]/.test(password),
//     match: password.length > 0 && password === confirmPassword,
//   };

//   const isPasswordValid =
//     passwordRules.minLength &&
//     passwordRules.hasUpper &&
//     passwordRules.hasLower &&
//     passwordRules.hasNumber &&
//     passwordRules.hasSpecial &&
//     passwordRules.match;

//   const getConfirmPasswordError = () => {
//     if (!touched.confirmPassword && !forceError) {
//       return "";
//     }

//     if (!confirmPassword) {
//       return "Please confirm your password";
//     }

//     if (password !== confirmPassword) {
//       return "Passwords do not match";
//     }

//     return "";
//   };

//   const isFormValid =
//     firstName.trim().length >= 2 &&
//     lastName.trim().length > 0 &&
//     /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) &&
//     isPasswordValid;

//   const handleSignup = async () => {
//     setForceError(true);

//     if (!isFormValid) return;

//     setLoading(true);
//     setError("");

//     try {
//       await signupWithEmail(firstName, lastName, email, password);

//       setSignupDone(true);
//     } catch (err: unknown) {
//       if (err instanceof Error) {
//         if (
//           err.message.includes("email-already-in-use") ||
//           err.message.includes("already registered")
//         ) {
//           setError(
//             "This email is already registered. If you haven't verified it yet, click Resend Verification below."
//           );

//           setShowResend(true);
//         } else {
//           setError(err.message);
//         }
//       } else {
//         setError("Signup failed. Please try again.");
//       }
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleResendVerification = async () => {
//     setResendLoading(true);

//     try {
//       await resendVerificationEmail(email, password);

//       setError("Verification email resent! Check your inbox.");
//     } catch (err: unknown) {
//       setError(err instanceof Error ? err.message : "Failed to resend email.");
//     } finally {
//       setResendLoading(false);
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
//       setError(err instanceof Error ? err.message : "Google sign-in failed");
//     }
//   };

//   /*
//    * ============================================
//    * SIGNUP SUCCESS
//    * ============================================
//    */

//   if (signupDone) {
//     return (
//       <div className="h-screen w-full overflow-hidden bg-[var(--bg)] flex items-center justify-center p-3">
//         <div className="w-full h-full max-h-[720px] max-w-[1200px] overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-2xl flex">
//           {/* LEFT PANEL */}
//           <div className="hidden lg:flex lg:w-[46%] relative overflow-hidden bg-[var(--primary)] text-white">
//             <div className="absolute -top-24 -left-24 w-[360px] h-[360px] rounded-full border border-[var(--accent)]/20" />
//             <div className="absolute top-16 -right-36 w-[440px] h-[440px] rounded-full border border-[var(--accent)]/20" />
//             <div className="absolute -bottom-36 -left-24 w-[440px] h-[440px] rounded-full border border-[var(--accent)]/20" />

//             <div className="relative z-10 w-full flex flex-col justify-between p-7 xl:p-9">
//               {/* Logo */}
//               <div className="flex items-center gap-2.5">
//                 <div className="w-8 h-8 rounded-lg bg-[var(--accent)] flex items-center justify-center shadow-lg">
//                   <Bell className="w-4 h-4 text-[var(--primary)]" />
//                 </div>
//                 <div className="text-lg font-black tracking-tight">
//                   Remind
//                   <span className="text-[var(--accent)]">CA</span>
//                 </div>
//               </div>

//               {/* Message */}
//               <div className="max-w-xl">
//                 <div className="inline-flex items-center gap-1.5 mb-3.5 px-2.5 py-1 rounded-full border border-[var(--accent)]/30 bg-[var(--accent)]/10">
//                   <ShieldCheck className="w-3.5 h-3.5 text-[var(--accent)]" />
//                   <span className="text-[11px] font-semibold text-[var(--accent)]">
//                     Compliance made simple
//                   </span>
//                 </div>

//                 <h2 className="text-2xl xl:text-3xl font-black leading-[1.12] tracking-tight">
//                   Stay ahead of
//                   <br />
//                   every compliance
//                   <br />
//                   deadline.
//                 </h2>

//                 <p className="mt-3.5 max-w-md text-sm leading-6 text-slate-300">
//                   Automate reminders, track deliveries, and keep your clients
//                   informed — all from one place.
//                 </p>
//               </div>

//               {/* Stats */}
//               <div className="grid grid-cols-3 gap-4 max-w-xl">
//                 <div>
//                   <div className="text-lg xl:text-xl font-black text-[var(--accent)]">
//                     132
//                   </div>
//                   <div className="mt-0.5 text-[11px] text-slate-300 leading-4">
//                     Delivered
//                     <br />
//                     this month
//                   </div>
//                 </div>

//                 <div>
//                   <div className="text-lg xl:text-xl font-black text-[var(--accent)]">
//                     99.4%
//                   </div>
//                   <div className="mt-0.5 text-[11px] text-slate-300 leading-4">
//                     Delivery
//                     <br />
//                     rate
//                   </div>
//                 </div>

//                 <div>
//                   <div className="text-lg xl:text-xl font-black text-[var(--accent)]">
//                     48
//                   </div>
//                   <div className="mt-0.5 text-[11px] text-slate-300 leading-4">
//                     Active
//                     <br />
//                     reminders
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* RIGHT PANEL */}
//           <div className="w-full lg:w-[54%] bg-[var(--surface)] flex items-center justify-center overflow-y-auto">
//             <div className="w-full max-w-sm px-6 py-6 sm:px-8">
//               {/* Mobile Logo */}
//               <div className="flex lg:hidden items-center justify-center gap-2 mb-5">
//                 <div className="w-8 h-8 rounded-lg bg-[var(--accent)] flex items-center justify-center shadow-md">
//                   <Bell className="w-4 h-4 text-[var(--primary)]" />
//                 </div>
//                 <div className="text-lg font-black text-[var(--primary)]">
//                   Remind
//                   <span className="text-[var(--accent-hover)]">CA</span>
//                 </div>
//               </div>

//               {/* Success Icon */}
//               <div className="flex justify-center mb-4">
//                 <div className="w-14 h-14 rounded-2xl bg-[var(--primary)]/10 flex items-center justify-center">
//                   <CheckCircle2 className="w-7 h-7 text-[var(--accent-hover)]" />
//                 </div>
//               </div>

//               <div className="text-center">
//                 <h1 className="text-xl sm:text-2xl font-black tracking-tight text-[var(--heading)]">
//                   Check your email
//                 </h1>

//                 <p className="mt-2.5 text-xs leading-5 text-[var(--text-secondary)]">
//                   We sent a verification link to
//                 </p>

//                 <p className="mt-1 text-xs font-bold text-[var(--primary)] break-all">
//                   {email}
//                 </p>

//                 <p className="mt-2.5 text-xs leading-5 text-[var(--text-secondary)]">
//                   Click the link in that email to verify your account, then
//                   return here to log in.
//                 </p>
//               </div>

//               <button
//                 type="button"
//                 onClick={() => router.push("/login")}
//                 className="btn mt-5 w-full h-10 min-h-10 rounded-lg bg-[var(--primary)] border-none text-white font-bold text-xs flex items-center justify-center gap-2 hover:bg-[var(--primary-hover)] shadow-md hover:shadow-lg"
//               >
//                 Go to Login
//                 <ArrowRight className="w-4 h-4" />
//               </button>
//             </div>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   /*
//    * ============================================
//    * SIGNUP FORM
//    * ============================================
//    */

//   return (
//     <div className="h-screen w-full overflow-hidden bg-[var(--bg)] flex items-center justify-center p-3">
//       <div className="w-full h-full max-h-[720px] max-w-[1200px] overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-2xl flex">
//         {/* ================================================= */}
//         {/* LEFT BRAND PANEL                                  */}
//         {/* ================================================= */}

//         <div className="hidden lg:flex lg:w-[46%] relative overflow-hidden bg-[var(--primary)] text-white">
//           {/* Decorative circles */}
//           <div className="absolute -top-24 -left-24 w-[360px] h-[360px] rounded-full border border-[var(--accent)]/20" />
//           <div className="absolute top-16 -right-36 w-[440px] h-[440px] rounded-full border border-[var(--accent)]/20" />
//           <div className="absolute -bottom-36 -left-24 w-[440px] h-[440px] rounded-full border border-[var(--accent)]/20" />

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
//                   Start your free trial
//                 </span>
//               </div>

//               <h2 className="text-2xl xl:text-3xl font-black leading-[1.12] tracking-tight">
//                 Take control of
//                 <br />
//                 your compliance
//                 <br />
//                 workflow.
//               </h2>

//               <p className="mt-3.5 max-w-md text-sm leading-6 text-slate-300">
//                 Automate reminders, track deadlines, and keep every client
//                 obligation organized in one place.
//               </p>
//             </div>

//             {/* Stats */}
//             <div className="grid grid-cols-3 gap-4 max-w-xl">
//               <div>
//                 <div className="text-lg xl:text-xl font-black text-[var(--accent)]">
//                   14
//                 </div>
//                 <div className="mt-0.5 text-[11px] text-slate-300 leading-4">
//                   Day free
//                   <br />
//                   trial
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
//                   24/7
//                 </div>
//                 <div className="mt-0.5 text-[11px] text-slate-300 leading-4">
//                   Deadline
//                   <br />
//                   tracking
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* ================================================= */}
//         {/* RIGHT SIGNUP PANEL                                */}
//         {/* ================================================= */}

//         <div className="w-full lg:w-[54%] bg-[var(--surface)] flex items-center justify-center overflow-y-auto">
//           <div className="w-full max-w-sm px-6 py-5 sm:px-8">
//             {/* Mobile Logo */}
//             <div className="flex lg:hidden items-center justify-center gap-2 mb-4">
//               <div className="w-8 h-8 rounded-lg bg-[var(--accent)] flex items-center justify-center shadow-md">
//                 <Bell className="w-4 h-4 text-[var(--primary)]" />
//               </div>
//               <div className="text-lg font-black text-[var(--primary)]">
//                 Remind
//                 <span className="text-[var(--accent-hover)]">CA</span>
//               </div>
//             </div>

//             {/* Heading */}
//             <div className="mb-3.5">
//               <h1 className="text-xl sm:text-2xl font-black tracking-tight leading-tight text-[var(--heading)]">
//                 Create your account
//               </h1>
//               <p className="mt-1.5 text-xs leading-5 text-[var(--text-secondary)]">
//                 Start your 14-day free trial. No credit card required.
//               </p>
//             </div>

//             {/* Error */}
//             {error && (
//               <div
//                 role="alert"
//                 className="alert alert-error mb-3 py-2 px-3 rounded-lg text-red-700 bg-red-50 border border-red-200 items-start gap-2"
//               >
//                 <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
//                 <span className="text-xs leading-4">{error}</span>
//               </div>
//             )}

//             {/* Resend */}
//             {showResend && (
//               <div className="mb-3">
//                 <button
//                   type="button"
//                   onClick={handleResendVerification}
//                   disabled={resendLoading}
//                   className="btn btn-outline w-full h-9 min-h-9 rounded-lg border-[var(--border)] text-xs font-semibold text-[var(--primary)] hover:bg-[var(--bg)] hover:border-[var(--primary)] disabled:opacity-50 flex items-center justify-center gap-2"
//                 >
//                   {resendLoading && (
//                     <Loader2 className="w-3.5 h-3.5 animate-spin" />
//                   )}
//                   {resendLoading
//                     ? "Resending..."
//                     : "Resend Verification Email"}
//                 </button>
//               </div>
//             )}

//             {/* ================================================= */}
//             {/* FIRST + LAST NAME                                */}
//             {/* ================================================= */}

//             <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
//               {/* First Name */}
//               <div className="form-control w-full">
//                 <label htmlFor="first-name" className="label py-0 mb-1">
//                   <span className="label-text text-xs font-bold text-[var(--text-primary)]">
//                     First Name
//                     <span className="text-red-500 ml-1">*</span>
//                   </span>
//                 </label>

//                 <div className="relative">
//                   <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-secondary)] pointer-events-none z-10" />
//                   <input
//                     id="first-name"
//                     type="text"
//                     value={firstName}
//                     onChange={(e) => setFirstName(e.target.value)}
//                     onBlur={() => handleBlur("firstName")}
//                     placeholder="First name"
//                     className={`input input-bordered w-full h-10 min-h-10 pl-9 pr-3 text-xs bg-[var(--surface)] text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] rounded-lg ${getFirstNameError()
//                       ? "border-red-400 focus:outline-red-200"
//                       : "border-[var(--border)] hover:border-[var(--primary)]/40 focus:border-[var(--primary)] focus:outline-[var(--primary)]/20"
//                       }`}
//                   />
//                 </div>

//                 {getFirstNameError() && (
//                   <span className="mt-1 text-[11px] text-red-600">
//                     {getFirstNameError()}
//                   </span>
//                 )}
//               </div>

//               {/* Last Name */}
//               <div className="form-control w-full">
//                 <label htmlFor="last-name" className="label py-0 mb-1">
//                   <span className="label-text text-xs font-bold text-[var(--text-primary)]">
//                     Last Name
//                     <span className="text-red-500 ml-1">*</span>
//                   </span>
//                 </label>

//                 <div className="relative">
//                   <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-secondary)] pointer-events-none z-10" />
//                   <input
//                     id="last-name"
//                     type="text"
//                     value={lastName}
//                     onChange={(e) => setLastName(e.target.value)}
//                     onBlur={() => handleBlur("lastName")}
//                     placeholder="Last name"
//                     className={`input input-bordered w-full h-10 min-h-10 pl-9 pr-3 text-xs bg-[var(--surface)] text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] rounded-lg ${getLastNameError()
//                       ? "border-red-400 focus:outline-red-200"
//                       : "border-[var(--border)] hover:border-[var(--primary)]/40 focus:border-[var(--primary)] focus:outline-[var(--primary)]/20"
//                       }`}
//                   />
//                 </div>

//                 {getLastNameError() && (
//                   <span className="mt-1 text-[11px] text-red-600">
//                     {getLastNameError()}
//                   </span>
//                 )}
//               </div>
//             </div>

//             {/* Email */}
//             <div className="form-control w-full mt-3">
//               <label htmlFor="signup-email" className="label py-0 mb-1">
//                 <span className="label-text text-xs font-bold text-[var(--text-primary)]">
//                   Email address
//                   <span className="text-red-500 ml-1">*</span>
//                 </span>
//               </label>

//               <div className="relative">
//                 <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-secondary)] pointer-events-none z-10" />
//                 <input
//                   id="signup-email"
//                   type="email"
//                   value={email}
//                   onChange={(e) => setEmail(e.target.value)}
//                   placeholder="name@yourfirm.com"
//                   className={`input input-bordered w-full h-10 min-h-10 pl-9 pr-3 text-xs bg-[var(--surface)] text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] rounded-lg ${forceError &&
//                     !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
//                     ? "border-red-400 focus:outline-red-200"
//                     : "border-[var(--border)] hover:border-[var(--primary)]/40 focus:border-[var(--primary)] focus:outline-[var(--primary)]/20"
//                     }`}
//                 />
//               </div>

//               {forceError &&
//                 !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && (
//                   <span className="mt-1 text-[11px] text-red-600">
//                     Please enter a valid email address
//                   </span>
//                 )}
//             </div>

//             {/* Password */}
//             <div className="form-control w-full mt-3">
//               <label htmlFor="signup-password" className="label py-0 mb-1">
//                 <span className="label-text text-xs font-bold text-[var(--text-primary)]">
//                   Password
//                 </span>
//               </label>

//               <div className="relative">
//                 <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-secondary)] pointer-events-none z-10" />
//                 <input
//                   id="signup-password"
//                   type={showPassword ? "text" : "password"}
//                   placeholder="Enter password"
//                   value={password}
//                   onChange={(e) => setPassword(e.target.value)}
//                   onBlur={() => handleBlur("password")}
//                   className={`input input-bordered w-full h-10 min-h-10 pl-9 pr-10 text-xs bg-[var(--surface)] text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] rounded-lg ${(touched.password || forceError) &&
//                     password.length > 0 &&
//                     !isPasswordValid
//                     ? "border-red-400 focus:outline-red-200"
//                     : "border-[var(--border)] hover:border-[var(--primary)]/40 focus:border-[var(--primary)] focus:outline-[var(--primary)]/20"
//                     }`}
//                 />

//                 <button
//                   type="button"
//                   onClick={() => setShowPassword((prev) => !prev)}
//                   className="btn btn-ghost btn-xs btn-circle absolute right-2 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] hover:text-[var(--heading)] hover:bg-[var(--bg)]"
//                 >
//                   {showPassword ? (
//                     <EyeOff className="w-4 h-4" />
//                   ) : (
//                     <Eye className="w-4 h-4" />
//                   )}
//                 </button>
//               </div>
//             </div>

//             {/* Confirm Password */}
//             <div className="form-control w-full mt-3">
//               <label
//                 htmlFor="signup-confirm-password"
//                 className="label py-0 mb-1"
//               >
//                 <span className="label-text text-xs font-bold text-[var(--text-primary)]">
//                   Confirm Password
//                 </span>
//               </label>

//               <div className="relative">
//                 <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-secondary)] pointer-events-none z-10" />
//                 <input
//                   id="signup-confirm-password"
//                   type={showConfirm ? "text" : "password"}
//                   placeholder="Re-enter password"
//                   value={confirmPassword}
//                   onChange={(e) => setConfirmPassword(e.target.value)}
//                   onBlur={() => handleBlur("confirmPassword")}
//                   className={`input input-bordered w-full h-10 min-h-10 pl-9 pr-10 text-xs bg-[var(--surface)] text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] rounded-lg ${getConfirmPasswordError()
//                     ? "border-red-400 focus:outline-red-200"
//                     : "border-[var(--border)] hover:border-[var(--primary)]/40 focus:border-[var(--primary)] focus:outline-[var(--primary)]/20"
//                     }`}
//                 />

//                 <button
//                   type="button"
//                   onClick={() => setShowConfirm((prev) => !prev)}
//                   className="btn btn-ghost btn-xs btn-circle absolute right-2 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] hover:text-[var(--heading)] hover:bg-[var(--bg)]"
//                 >
//                   {showConfirm ? (
//                     <EyeOff className="w-4 h-4" />
//                   ) : (
//                     <Eye className="w-4 h-4" />
//                   )}
//                 </button>
//               </div>

//               {getConfirmPasswordError() && (
//                 <span className="mt-1 text-[11px] text-red-600">
//                   {getConfirmPasswordError()}
//                 </span>
//               )}
//             </div>

//             {/* Password Requirements */}
//             <div className="mt-3.5 rounded-lg border border-[var(--border)] bg-[var(--bg)] p-3">
//               <div className="flex items-center gap-2 mb-2">
//                 <ShieldCheck className="w-3.5 h-3.5 text-[var(--accent)]" />
//                 <p className="text-xs font-bold text-[var(--heading)]">
//                   Password Requirements
//                 </p>
//               </div>

//               <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-3 gap-y-1.5">
//                 {PASSWORD_RULE_LABELS.map(({ key, label }) => {
//                   const valid = passwordRules[key];

//                   return (
//                     <div
//                       key={key}
//                       className={`flex items-center gap-1.5 text-[11px] ${valid ? "text-green-700" : "text-[var(--text-secondary)]"
//                         }`}
//                     >
//                       {valid ? (
//                         <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
//                       ) : (
//                         <Circle className="w-3.5 h-3.5 shrink-0" />
//                       )}
//                       <span>{label}</span>
//                     </div>
//                   );
//                 })}
//               </div>
//             </div>

//             {/* Signup */}
//             <button
//               type="button"
//               onClick={handleSignup}
//               disabled={loading || !isFormValid}
//               className="btn mt-4 w-full h-10 min-h-10 rounded-lg bg-[var(--primary)] border-none text-white font-bold text-xs flex items-center justify-center gap-2 hover:bg-[var(--primary-hover)] disabled:opacity-50 shadow-md hover:shadow-lg"
//             >
//               {loading ? (
//                 <>
//                   <Loader2 className="w-4 h-4 animate-spin" />
//                   Creating account...
//                 </>
//               ) : (
//                 <>
//                   Start your trial
//                   <ArrowRight className="w-4 h-4" />
//                 </>
//               )}
//             </button>

//             {/* Login */}
//             <p className="text-center text-xs text-[var(--text-secondary)] mt-3.5">
//               Already have an account?{" "}
//               <button
//                 type="button"
//                 onClick={() => router.push("/login")}
//                 className="font-bold text-[var(--primary)] hover:text-[var(--accent-hover)] hover:underline cursor-pointer transition-colors"
//               >
//                 Log in
//               </button>
//             </p>

//             {/* Divider */}
//             <div className="divider text-[10px] font-semibold text-[var(--text-secondary)] my-3.5">
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
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// components/auth/SignupForm.tsx
import { User, Mail, ArrowRight, Loader2, AlertCircle } from "lucide-react";
import { AuthLayout } from "../wrappers/AuthLayout";
import { FormWrapper } from "../wrappers/FormWrapper";
import { InputField } from "../ui/InputField";
import { PasswordField } from "../ui/PasswordField";
import { PasswordRequirements } from "./PasswordRequirements";

import { signupSchema } from "@/utils/schema";
import { useSignup } from "@/hooks/useSignup";
import { SignupSuccess } from "./SignupSucces";
import GoogleIcon from "../common/GoogleIcon";

export default function SignupForm() {
  const {
    submit, loading, error, showResend, resendLoading,
    resendVerification, googleSignIn, signupDone, registeredEmail, goToLogin,
  } = useSignup();

  if (signupDone) {
    return <SignupSuccess email={registeredEmail} onGoToLogin={goToLogin} />;
  }

  return (
    <AuthLayout mode="signup">
      <div className="mb-3.5">
        <h1 className="text-xl sm:text-2xl font-black tracking-tight text-[var(--heading)]">
          Create your account
        </h1>
        <p className="mt-1.5 text-xs leading-5 text-[var(--text-secondary)]">
          Start your 14-day free trial. No credit card required.
        </p>
      </div>

      {error && (
        <div role="alert" className="mb-3 py-2 px-3 rounded-lg text-red-700 bg-red-50 border border-red-200 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span className="text-xs leading-4">{error}</span>
        </div>
      )}

      {showResend && (
        <button
          type="button"
          onClick={resendVerification}
          disabled={resendLoading}
          className="mb-3 w-full h-9 rounded-lg border border-[var(--border)] text-xs font-semibold text-[var(--primary)] hover:bg-[var(--bg)] hover:border-[var(--primary)] disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {resendLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
          {resendLoading ? "Resending..." : "Resend Verification Email"}
        </button>
      )}

      <FormWrapper
        schema={signupSchema}
        defaultValues={{ firstName: "", lastName: "", email: "", password: "", confirmPassword: "" }}
        onSubmit={submit}
        className="space-y-3"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <InputField name="firstName" label="First Name *" placeholder="First name" icon={User} />
          <InputField name="lastName" label="Last Name *" placeholder="Last name" icon={User} />
        </div>

        <InputField name="email" label="Email address *" placeholder="name@yourfirm.com" icon={Mail} />
        <PasswordField name="password" label="Password" placeholder="Enter password" />
        <PasswordField name="confirmPassword" label="Confirm Password" placeholder="Re-enter password" />

        <PasswordRequirements name="password" />

        <button
          type="submit"
          disabled={loading}
          className="mt-1 w-full h-10 rounded-lg bg-[var(--primary)] text-white font-bold text-xs flex items-center justify-center gap-2 disabled:opacity-50 shadow-md hover:shadow-lg"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" /> Creating account...
            </>
          ) : (
            <>
              Start your trial <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </FormWrapper>

      <p className="text-center text-xs text-[var(--text-secondary)] mt-3.5">
        Already have an account?{" "}
        <button type="button" onClick={goToLogin} className="font-bold text-[var(--primary)] hover:underline">
          Log in
        </button>
      </p>

      <div className="border-t border-[var(--border)] my-3.5 relative">
        <span className="absolute -top-2 left-1/2 -translate-x-1/2 bg-[var(--surface)] px-2 text-[10px] font-semibold text-[var(--text-secondary)]">
          OR
        </span>
      </div>

      <button
        type="button"
        onClick={googleSignIn}
        className="w-full h-10 rounded-lg border border-[var(--border)] bg-[var(--surface)] text-[var(--text-primary)] font-semibold text-xs flex items-center justify-center gap-2.5 hover:bg-[var(--bg)] hover:border-[var(--primary)]/50"
      >
        <GoogleIcon />
        <span>Continue with Google</span>
      </button>
    </AuthLayout>
  );
}
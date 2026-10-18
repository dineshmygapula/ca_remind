'use client';

import { useState } from "react";

type Props = {
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  label?: string;
  placeholder?: string;
  forceError?: boolean;
};

export default function EmailField({
  value,
  onChange,
  required = true,
  label = "Email",
  placeholder = "Enter your email",
  forceError = false,
}: Props) {
  const [touched, setTouched] = useState(false);

  const validateEmail = (email: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const shouldValidate = touched || forceError;

  const getError = () => {
    if (!shouldValidate) return "";
    if (required && !value.trim()) return `${label} is required`;
    if (value && !validateEmail(value)) return "Please enter a valid email address";
    return "";
  };

  const errorMessage = getError();

  return (
    <div className="w-full mb-3">
      {label && (
        <label className={`block text-xs font-semibold mb-1.5 ${errorMessage ? "text-rose-500" : "text-[var(--text-secondary)]"}`}>
          {label}
          {required && <span className="text-rose-500 ml-1">*</span>}
        </label>
      )}

      <input
        type="email"
        value={value}
        placeholder={placeholder}
        onBlur={() => setTouched(true)}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full h-11 px-3.5 text-sm rounded-xl border bg-[var(--surface)] text-[var(--text-primary)] transition-colors outline-none placeholder:text-[var(--text-secondary)]/60 ${
          errorMessage
            ? "border-rose-500 focus:border-rose-600 focus:ring-1 focus:ring-rose-500"
            : "border-[var(--border)] focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)]"
        }`}
      />

      {errorMessage && (
        <p className="text-xs text-rose-500 font-medium mt-1 ml-1">
          {errorMessage}
        </p>
      )}
    </div>
  );
}
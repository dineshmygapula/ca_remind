// src/components/common/NameField.tsx
"use client";

import { Building2 } from "lucide-react";
import { useState } from "react";

interface NameFieldProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  required?: boolean;
  icon?: React.ReactNode;
  forceError?: boolean;
  externalError?: string;
  onBlur?: () => void;
}

export default function NameField({
  value,
  onChange,
  label = "Name",
  placeholder = "Enter name",
  required = false,
  icon = <Building2 className="w-4 h-4 text-[var(--accent)]" />,
  forceError = false,
  externalError = "",
  onBlur,
}: NameFieldProps) {
  const [touched, setTouched] = useState(false);

  const nameRegex = /^[A-Za-z0-9\s&.,'\-()]*$/;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!nameRegex.test(e.target.value)) return;
    onChange(e.target.value);
  };

  const handleBlur = () => {
    setTouched(true);
    onBlur?.();
  };

  const shouldValidate = touched || forceError;

  const getError = () => {
    if (!shouldValidate) return "";
    if (externalError) return externalError;
    if (required && !value.trim()) return `${label} is required`;
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

      <div className="relative flex items-center">
        {icon && (
          <div className="absolute left-3.5 flex items-center pointer-events-none text-[var(--text-secondary)]">
            {icon}
          </div>
        )}
        <input
          type="text"
          value={value}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder={placeholder}
          className={`w-full h-11 ${icon ? "pl-10" : "px-3.5"} pr-3.5 text-sm rounded-xl border bg-[var(--surface)] text-[var(--text-primary)] transition-colors outline-none placeholder:text-[var(--text-secondary)]/60 ${
            errorMessage
              ? "border-rose-500 focus:border-rose-600 focus:ring-1 focus:ring-rose-500"
              : "border-[var(--border)] focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)]"
          }`}
        />
      </div>

      {errorMessage && (
        <p className="text-xs text-rose-500 font-medium mt-1 ml-1">
          {errorMessage}
        </p>
      )}
    </div>
  );
}

"use client";

import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/material.css";

interface PhoneInputFieldProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  error?: boolean;
  helperText?: string;
  required?: boolean;
  disabled?: boolean;
  placeholder?: string;
  defaultCountry?: string;
}

export default function PhoneInputField({
  value,
  onChange,
  label = "Phone",
  error = false,
  helperText,
  required = false,
  disabled = false,
  placeholder = "98765 43210",
  defaultCountry = "in",
}: PhoneInputFieldProps) {
  return (
    <div className="w-full">
      {label && (
        <label className={`block text-xs font-semibold mb-1.5 ${error ? "text-rose-500" : "text-[var(--text-secondary)]"}`}>
          {label}
          {required && <span className="text-rose-500 ml-1">*</span>}
        </label>
      )}

      <PhoneInput
        country={defaultCountry}
        value={value}
        onChange={onChange}
        disabled={disabled}
        placeholder={placeholder}
        preferredCountries={["in", "us", "gb", "ae", "sg", "au"]}
        enableSearch
        searchPlaceholder="Search country..."
        inputStyle={{
          width: "100%",
          height: "42px",
          fontSize: "0.875rem",
          borderRadius: "12px",
          borderColor: error ? "#ef4444" : "var(--border, #E2E8F0)",
          backgroundColor: "var(--surface, #FFFFFF)",
          color: "var(--text-primary, #0F172A)",
          paddingLeft: "48px",
          fontFamily: "inherit",
        }}
        buttonStyle={{
          borderRadius: "12px 0 0 12px",
          borderColor: error ? "#ef4444" : "var(--border, #E2E8F0)",
          backgroundColor: "var(--surface, #FFFFFF)",
        }}
        containerStyle={{
          width: "100%",
        }}
        dropdownStyle={{
          borderRadius: "12px",
          boxShadow: "0 8px 24px rgba(0,28,61,0.12)",
          fontSize: "0.875rem",
          zIndex: 1400,
          backgroundColor: "var(--surface, #FFFFFF)",
          color: "var(--text-primary, #0F172A)",
        }}
        searchStyle={{
          width: "calc(100% - 16px)",
          borderRadius: "8px",
          fontSize: "0.875rem",
        }}
      />

      {helperText && (
        <p className={`text-xs mt-1 ml-1 ${error ? "text-rose-500 font-medium" : "text-[var(--text-secondary)]"}`}>
          {helperText}
        </p>
      )}
    </div>
  );
}
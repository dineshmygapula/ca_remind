'use client';

import { TextField, Typography, Box } from "@mui/material";
import { useState } from "react";

type Props = {
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  label?: string;
  placeholder?: string;   // ✅ NEW
  forceError?: boolean;
};

export default function EmailField({
  value,
  onChange,
  required = true,
  label = "Email",
  placeholder = "Enter your email", // ✅ default placeholder
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
    <Box sx={{ mb: 2 }}>
      {/* ✅ STATIC LABEL */}
      <Typography sx={{ mb: 0.5, fontWeight: 500 }}>
        {label}
      </Typography>

      <TextField
        type="email"
        fullWidth
        value={value}
        placeholder={placeholder}
        error={!!errorMessage}
        helperText={errorMessage}
        onBlur={() => setTouched(true)}
        onChange={(e) => onChange(e.target.value)}
      />
    </Box>
  );
}
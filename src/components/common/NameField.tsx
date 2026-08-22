// src/components/common/NameField.tsx
"use client";

import { TextField, InputAdornment,Box,Typography } from "@mui/material";
import BusinessIcon from "@mui/icons-material/Business";
import { useState } from "react";

interface NameFieldProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  required?: boolean;
  icon?: React.ReactNode;
  forceError?: boolean;
  externalError?: string; // ✅ ADD this
  onBlur?: () => void; // ✅ ADD this
}

export default function NameField({
  value,
  onChange,
  label = "Name",
  placeholder = "Enter name",
  required = false,
  icon = <BusinessIcon fontSize="small" sx={{ color: "primary.main" }} />,
  forceError = false,
  externalError = "", // ✅ ADD this
  onBlur, // ✅ ADD this
}: NameFieldProps) {
  const [touched, setTouched] = useState(false);

const nameRegex = /^[A-Za-z0-9\s&.,'\-()]*$/;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!nameRegex.test(e.target.value)) return;
    onChange(e.target.value);
  };

  const handleBlur = () => {
    setTouched(true);
    onBlur?.(); // ✅ notify parent
  };

  const shouldValidate = touched || forceError;

  const getError = () => {
    if (!shouldValidate) return "";
    if (externalError) return externalError; // ✅ parent error takes priority
    if (required && !value.trim()) return `${label} is required`;
    return "";
  };

  const errorMessage = getError();

 return (
  <Box sx={{ mb: 1 }}>
    {/* ✅ STATIC LABEL */}
    <Typography sx={{ fontWeight: 500 }}>
      {label}
      {required && (
        <span style={{ color: "red", marginLeft: 2 }}>*</span>
       )}
       
    </Typography>

    <TextField
      fullWidth
      value={value}
      onChange={handleChange}
      onBlur={handleBlur}
      placeholder={placeholder}
      error={!!errorMessage}
      helperText={errorMessage}
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">{icon}</InputAdornment>
        ),
      }}
    />
  </Box>
);
}

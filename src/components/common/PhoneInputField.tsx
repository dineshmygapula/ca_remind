"use client";

import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/material.css";
import { Typography, Box } from "@mui/material";

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
    <Box>
      <Typography
        component="label"
        sx={{
          display: "block",
          fontSize: "0.75rem",
          fontWeight: 500,
          color: error ? "error.main" : "text.secondary",
          mb: 0.5,
          ml: 0.25,
        }}
      >
        {label}
        {required && (
          <Typography component="span" color="error.main" sx={{ ml: 0.25 }}>
            *
          </Typography>
        )}
      </Typography>

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
          height: "40px",
          fontSize: "0.875rem",
          borderRadius: "12px",
          borderColor: error ? "#d32f2f" : "#00A3FF",
          backgroundColor: "#F8FCFF",
          paddingLeft: "48px",
          fontFamily: "inherit",
        }}
        buttonStyle={{
          borderRadius: "12px 0 0 12px",
          borderColor: error ? "#d32f2f" : "#00A3FF",
          backgroundColor: "#F8FCFF",
        }}
        containerStyle={{
          width: "100%",
        }}
        dropdownStyle={{
          borderRadius: "12px",
          boxShadow: "0 8px 24px rgba(0,28,61,0.12)",
          fontSize: "0.875rem",
          zIndex: 1400,
        }}
        searchStyle={{
          width: "calc(100% - 16px)",
          borderRadius: "8px",
          fontSize: "0.875rem",
        }}
      />

      {helperText && (
        <Typography
          variant="caption"
          sx={{
            display: "block",
            mt: 0.5,
            ml: 1.75,
            color: error ? "error.main" : "text.secondary",
          }}
        >
          {helperText}
        </Typography>
      )}
    </Box>
  );
}
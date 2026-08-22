// src/utils/phoneValidation.ts

import type { CountryCode } from "@/constants/phoneCodes";

export interface PhoneValidationResult {
  isValid: boolean;
  errorMessage: string;
}

export const validatePhone = (
  phone: string,
  countryCode: CountryCode
): PhoneValidationResult => {
  const digitsOnly = phone.replace(/\D/g, ""); // strip non-digits

  if (!phone.trim()) {
    return { isValid: false, errorMessage: "Phone number is required" };
  }

  if (!/^\d+$/.test(digitsOnly)) {
    return { isValid: false, errorMessage: "Phone number must contain digits only" };
  }

  if (digitsOnly.length !== countryCode.digitCount) {
    return {
      isValid: false,
      errorMessage: `Phone number must be exactly ${countryCode.digitCount} digits for ${countryCode.country} (${countryCode.code})`,
    };
  }

  return { isValid: true, errorMessage: "" };
};

// Builds the full number for API submission e.g. "+919999999999"
export const buildFullPhoneNumber = (
  phone: string,
  countryCode: CountryCode
): string => {
  const digitsOnly = phone.replace(/\D/g, "");
  return `${countryCode.code}${digitsOnly}`;
};
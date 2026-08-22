// src/constants/phoneCodes.ts

export interface CountryCode {
  country: string;
  code: string;  // e.g. "+91"
  iso: string;   // e.g. "IN"
  digitCount: number; // expected local number length
}

export const COUNTRY_CODES: CountryCode[] = [
  { country: "India",          code: "+91",  iso: "IN", digitCount: 10 },
  { country: "United States",  code: "+1",   iso: "US", digitCount: 10 },
  { country: "United Kingdom", code: "+44",  iso: "GB", digitCount: 10 },
  { country: "UAE",            code: "+971", iso: "AE", digitCount: 9  },
  { country: "Singapore",      code: "+65",  iso: "SG", digitCount: 8  },
  { country: "Australia",      code: "+61",  iso: "AU", digitCount: 9  },
];

// Default for your app
export const DEFAULT_COUNTRY_CODE = COUNTRY_CODES[0]; // +91 India
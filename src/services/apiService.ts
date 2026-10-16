// src/services/apiService.ts
// This file handles API calls using fetch — no Axios!

/* export const BASE_URL = 'http://48.217.65.157:8093/v1';

const TOKEN_KEY = 'app_token';

// ─────────────────────────────────────────────
// 1️⃣ Get backend token using Firebase token
// Called once after Firebase login
// ─────────────────────────────────────────────

export const getBackendToken = async (email: string, password: string) => {
  try {
    const response = await fetch(`${BASE_URL}/getToken`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),  // ← your backend expects this
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to get backend token');
    }

    const data = await response.json();
    if (data.token) {
      localStorage.setItem(TOKEN_KEY, data.token);
    }
    return data;
  } catch (error: unknown) {
    if (error instanceof Error) throw new Error(error.message);
    throw new Error('Failed to get backend token');
  }
};
export const getToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem(TOKEN_KEY);
  }
  return null;
};

export const clearToken = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(TOKEN_KEY);
  }
};

export const isAuthenticated = (): boolean => {
  return getToken() !== null;
};

export const getHeaders = () => {
  const token = getToken();
  return {
    'Content-Type': 'application/json',
    Authorization: token ? `Bearer ${token}` : '', // ✅ only this line changed
   //Authorization: token || '',

  };
}; */
export const BASE_URL = 'https://api.remindca.com/v1';
// export const BASE_URL = `https://api.remindca.com/v1`; //production server
// export const BASE_URL = 'https://dev.api.remindca.com/v1';//dev server
const TOKEN_KEY = 'app_token';
export const getBackendToken = async (email: string, password: string) => {
  try {
    const response = await fetch(`${BASE_URL}/getToken`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to get backend token');
    }

    const data = await response.json();
    if (data.token) {
      // ✅ Remove "Bearer " prefix if it exists
      const cleanToken = data.token.replace(/^Bearer\s+/i, '');
      localStorage.setItem(TOKEN_KEY, cleanToken);
      console.log('✅ Token saved (cleaned)');
    }
    return data;
  } catch (error: unknown) {
    if (error instanceof Error) throw new Error(error.message);
    throw new Error('Failed to get backend token');
  }
};

export const getToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem(TOKEN_KEY);
  }
  return null;
};

export const clearToken = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(TOKEN_KEY);
  }
};

export const isAuthenticated = (): boolean => {
  return getToken() !== null;
};

export const getHeaders = () => {
  const token = getToken();
  // const token = `Bearer eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkMzY5NGVhMC04YjM4LTRkNmMtOWJmOS02MWVhNDVkYjIyZDciLCJlbWFpbCI6InNhcmFueWFkZWVwaWthbXlnYXB1bGFAZ21haWwuY29tIiwicm9sZSI6InN1YnNjcmliZXIiLCJleHAiOjE4MTc3MTcxMTV9.lhlAFOUkCEpUyMFpQ0_J4C6wNjq9WGhdovQ4JalMZm8howXzOmeKpAUdTc9gnLwQQUYER_r2yDjqpJ6vzZr5CA`
  console.log(token, "token-===================")

  return {
    'Content-Type': 'application/json',
    Authorization: token ? `${token}` : '',
  };
};
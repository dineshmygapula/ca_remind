// lib/api.ts
import axios from "axios";
import { auth } from "../config/firebase";

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
});

api.interceptors.request.use(async (config) => {
  await auth.authStateReady(); // waits for Firebase to restore the session on page load
  const user = auth.currentUser;
  if (user) {
    const token = await user.getIdToken(); // cached, auto-refreshes
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Optional: one retry with a forced refresh if the server says 401
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry && auth.currentUser) {
      original._retry = true;
      const token = await auth.currentUser.getIdToken(true);
      original.headers.Authorization = `Bearer ${token}`;
      return api(original);
    }
    return Promise.reject(error);
  }
);
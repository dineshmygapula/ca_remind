"use client";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { onIdTokenChanged, User } from "firebase/auth";
import { auth } from "@/config/firebase";
import { setSessionCookie, clearSessionCookie } from "@/lib/session";

const AuthContext = createContext<{
  user: User | null;
  loading: boolean;
} | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    /**
     * onIdTokenChanged fires on:
     *  - initial mount (resolved from persisted session)
     *  - sign-in
     *  - sign-out
     *  - automatic Firebase token refresh (every ~1 hour)
     *
     * This keeps the __session cookie perfectly in sync so the edge
     * middleware always has a fresh token to read.
     */
    const unsubscribe = onIdTokenChanged(auth, async (u) => {
      if (u) {
        const token = await u.getIdToken();
        setSessionCookie(token);
      } else {
        clearSessionCookie();
      }
      setUser(u);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
};

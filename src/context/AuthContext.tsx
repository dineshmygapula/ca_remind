// "use client";

// import React, {
//   createContext,
//   useContext,
//   useEffect,
//   useState,
//   ReactNode,
// } from "react";
// import { onAuthStateChanged, User } from "firebase/auth";
// import { auth } from "../config/firebase";
// import { getOrganizations } from "../services/organizationService";
// import { getBusinesses } from "../services/businessService";

// export type AppState =
//   | "loading"
//   | "unauthenticated"
//   | "no_org"
//   | "no_business"
//   | "ready";

// interface AuthContextType {
//   user: User | null;
//   appState: AppState;
//   orgId: string | null;
//   businessId: string | null;
//   refreshAppState: () => Promise<void>;
// }

// const AuthContext = createContext<AuthContextType | null>(null);

// export function AuthProvider({ children }: { children: ReactNode }) {
//   const [user, setUser] = useState<User | null>(null);
//   const [appState, setAppState] = useState<AppState>("loading");
//   const [orgId, setOrgId] = useState<string | null>(null);
//   const [businessId, setBusinessId] = useState<string | null>(null);

//   const resolveAppState = async () => {
//     if (typeof window === "undefined") return;

//     setAppState("loading");

//     try {
//       const currentUser = auth.currentUser;

//       if (!currentUser) {
//         setAppState("unauthenticated");
//         return;
//       }

//       // Force refresh ensures a fresh token
//       const freshToken = await currentUser.getIdToken(true);
//       localStorage.setItem("app_token", `Bearer ${freshToken}`);

//       const orgs = await getOrganizations();
//       if (orgs.length === 0) {
//         setAppState("no_org");
//         return;
//       }

//       const org = orgs[0];
//       setOrgId(org.id);

//       const businesses = await getBusinesses(org.id);
//       if (businesses.length === 0) {
//         setAppState("no_business");
//         return;
//       }

//       setBusinessId(businesses[0].id);
//       setAppState("ready");
//     } catch (error) {
//       console.error("Failed to resolve app state:", error);
//       setAppState("unauthenticated");
//     }
//   };

//   useEffect(() => {
//     const unsubscribe = onAuthStateChanged(auth, (currentUser: User | null) => {
//       setUser(currentUser);
//       if (currentUser) {
//         resolveAppState();
//       } else {
//         localStorage.removeItem("app_token");
//         setAppState("unauthenticated");
//         setOrgId(null);
//         setBusinessId(null);
//       }
//     });

//     return () => unsubscribe();
//   }, []);

//   return (
//     <AuthContext.Provider
//       value={{
//         user,
//         appState,
//         orgId,
//         businessId,
//         refreshAppState: resolveAppState,
//       }}
//     >
//       {children}
//     </AuthContext.Provider>
//   );
// }

// export const useAuth = () => {
//   const ctx = useContext(AuthContext);
//   if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
//   return ctx;
// };


// context/AuthContext.tsx
"use client";
import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "@/config/firebase";

const AuthContext = createContext<{ user: User | null; loading: boolean } | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(
    () =>
      onAuthStateChanged(auth, (u) => {
        setUser(u);
        setLoading(false);
      }),
    []
  );

  return <AuthContext.Provider value={{ user, loading }}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
};
// components/AuthLayoutWrapper.tsx
"use client";

import AuthTopbar from "./AuthTopbar";

export default function AuthLayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <AuthTopbar />
      {children}
    </>
  );
}

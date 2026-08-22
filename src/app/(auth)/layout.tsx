import type { Metadata } from "next";
import "../globals.css";
import Providers from "@/components/Providers";
import NextTopLoader from "nextjs-toploader";

export const metadata: Metadata = {
    title: "RemindCA | Compliance & Reminder Management",
    description:
        "Automated compliance task and reminder management platform for CA firms.",
};

export default function AuthLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang= "en" >
        <body className="min-h-screen bg-[var(--bg)] text-[var(--text-primary)] antialiased transition-colors duration-300" >
            <Providers>
            <NextTopLoader />
    { children }
    </Providers>
        </body>
        </html>
  );
}
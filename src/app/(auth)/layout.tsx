import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import "../globals.css";
import Providers from "@/components/Providers";
import NextTopLoader from "nextjs-toploader";

const manrope = Manrope({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-manrope",
});

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
        <html lang="en" className={manrope.variable}>
        <body className={`${manrope.className} min-h-screen bg-[var(--bg)] text-[var(--text-primary)] antialiased transition-colors duration-300`}>
            <Providers>
            <NextTopLoader />
    { children }
    </Providers>
        </body>
        </html>
  );
}
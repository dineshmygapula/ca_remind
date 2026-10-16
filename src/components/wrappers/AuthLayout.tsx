import { ReactNode } from "react";
import { AuthBanner } from "../auth/AuthBanner";
import { Logo } from "../common/Logo";

export function AuthLayout({
    mode,
    children,
}: {
    mode: "login" | "signup";
    children: ReactNode;
}) {
    return (
        <div className="min-h-screen w-full bg-[var(--bg)] flex flex-col lg:flex-row">
            {/* Brand panel: full height, hidden below lg */}
            <AuthBanner mode={mode} />

            {/* Form panel: the page scrolls, so tall forms (signup) never clip */}
            <main className="flex-1 min-w-0 bg-[var(--surface)] flex items-center justify-center px-6 py-12 sm:px-10">
                <div className="w-full max-w-[440px]">
                    {/* Mobile logo, shown when AuthBanner is hidden below lg */}
                    <div className="flex lg:hidden items-center justify-center mb-8">
                        <Logo />
                    </div>

                    {children}
                </div>
            </main>
        </div>
    );
}
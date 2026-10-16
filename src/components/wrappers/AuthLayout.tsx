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
        <div className="min-h-screen w-full bg-[var(--bg)] flex items-center justify-center p-3 sm:p-4">
            <div className="w-full max-w-[1200px] lg:h-[min(720px,90vh)] rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-2xl flex flex-col lg:flex-row overflow-hidden">
                <AuthBanner mode={mode} />

                {/* This is the ONLY scroll container for the right panel.
            items-start (not items-center) + min-h-full avoids the
            flex-centering-clips-overflow bug. */}
                <div className="w-full lg:w-[54%] bg-[var(--surface)] flex flex-col items-center overflow-y-auto">
                    <div className="w-full min-w-md px-8 py-8 sm:px-10 my-auto">
                        {/* Mobile logo — shown when AuthBanner is hidden below lg */}
                        <div className="flex lg:hidden items-center justify-center mb-5">
                            <Logo />
                        </div>

                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
}
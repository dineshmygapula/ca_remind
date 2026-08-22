import { ReactNode } from "react";
import { Bell } from "lucide-react";
import { AuthBanner } from "../auth/AuthBanner";

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
                    <div className="w-full max-w-sm px-6 py-6 sm:px-8 my-auto">
                        {/* Mobile logo — shown when AuthBanner is hidden below lg */}
                        <div className="flex lg:hidden items-center justify-center gap-2 mb-5">
                            <div className="w-8 h-8 rounded-lg bg-[var(--accent)] flex items-center justify-center shadow-md">
                                <Bell className="w-4 h-4 text-[var(--primary)]" />
                            </div>
                            <div className="text-lg font-black text-[var(--primary)]">
                                Remind
                                <span className="text-[var(--accent-hover)]">CA</span>
                            </div>
                        </div>

                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
}
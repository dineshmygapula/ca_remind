"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  LayoutDashboard,
  CheckSquare,
  Sliders,
  Bell,
  Users,
  UserCheck,
  ChevronDown,
  Sun,
  Moon,
  User,
  Building2,
  FileText,
  CreditCard,
  Headphones,
  Info,
  ShieldCheck,
  HelpCircle,
  LogOut,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Logo } from "../common/Logo";

// ─── Route map ───────────────────────────────────────────
// Single source of truth: label -> path. activeTab is DERIVED
// from the current pathname instead of tracked as separate
// local state, so it can never drift from what's on screen.
const NAV_ITEMS = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Tasks", href: "/tasks", icon: CheckSquare },
  { label: "Taskrules", href: "/task-definitions", icon: Sliders },
  { label: "Reminders", href: "/reminders", icon: Bell },
] as const;

const PEOPLE_ITEMS = [
  { label: "Clients", href: "/clients", icon: UserCheck },
  { label: "Staff", href: "/staff", icon: Users },
] as const;

export function Header() {
  const [isDark, setIsDark] = useState<boolean>(false);
  const [isPeopleOpen, setIsPeopleOpen] = useState<boolean>(false);
  const [isProfileOpen, setIsProfileOpen] = useState<boolean>(false);
  const { user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const peopleRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  // Active tab is computed from the URL every render — clicking a
  // button navigates, the pathname changes, and the highlight just
  // follows automatically. No separate state to fall out of sync.
  const isActive = (href: string) => pathname?.startsWith(href);
  const isPeopleActive = PEOPLE_ITEMS.some((item) => pathname?.startsWith(item.href));

  const goTo = (href: string) => {
    router.push(href);
    setIsPeopleOpen(false);
    setIsProfileOpen(false);
  };

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDark]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (peopleRef.current && !peopleRef.current.contains(event.target as Node)) {
        setIsPeopleOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="navbar bg-[var(--surface)] border-b border-[var(--border)] px-4 sm:px-8 py-3 shadow-md transition-colors duration-300 sticky top-0 z-40">
      {/* Brand Logo */}
      <Logo />

      {/* Navigation Tabs */}
      <div className="flex-1 hidden lg:flex justify-center">
        <nav className="flex items-center gap-1.5 font-semibold text-sm">
          {NAV_ITEMS.map(({ label, href, icon: Icon }) => (
            <button
              key={href}
              type="button"
              onClick={() => goTo(href)}
              className={`rounded-xl px-4 py-2.5 flex items-center gap-2 transition-all cursor-pointer ${isActive(href)
                ? "bg-[var(--primary)] text-white font-bold shadow-md dark:bg-[var(--accent)] dark:text-[#0B1220]"
                : "text-[var(--text-secondary)] hover:text-[var(--heading)] hover:bg-[var(--border)]/40"
                }`}
            >
              <Icon className="w-4 h-4" />
              <span>{label}</span>
            </button>
          ))}

          {/* People Dropdown */}
          <div
            ref={peopleRef}
            className="relative"
            onMouseEnter={() => setIsPeopleOpen(true)}
            onMouseLeave={() => setIsPeopleOpen(false)}
          >
            <button
              type="button"
              onClick={() => setIsPeopleOpen(!isPeopleOpen)}
              className={`rounded-xl px-4 py-2.5 flex items-center gap-2 transition-all cursor-pointer ${isPeopleActive
                ? "bg-[var(--primary)] text-white font-bold shadow-md dark:bg-[var(--accent)] dark:text-[#0B1220]"
                : "text-[var(--text-secondary)] hover:text-[var(--heading)] hover:bg-[var(--border)]/40"
                }`}
            >
              <Users className="w-4 h-4" />
              <span>People</span>
              <ChevronDown
                className={`w-3.5 h-3.5 transition-transform duration-200 ${isPeopleOpen ? "rotate-180" : ""
                  }`}
              />
            </button>

            {isPeopleOpen && (
              <div className="absolute left-0 top-full pt-1 z-[100] w-44">
                <div className="p-2 shadow-2xl bg-[var(--surface)] border border-[var(--border)] rounded-2xl flex flex-col gap-1">
                  {PEOPLE_ITEMS.map(({ label, href, icon: Icon }) => (
                    <button
                      key={href}
                      type="button"
                      onClick={() => goTo(href)}
                      className={`flex items-center gap-2.5 w-full text-left rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors cursor-pointer ${isActive(href)
                        ? "bg-[var(--primary)] text-white dark:bg-[var(--accent)] dark:text-[#0B1220]"
                        : "text-[var(--text-primary)] hover:bg-[var(--border)]/50"
                        }`}
                    >
                      <Icon className="w-4 h-4 text-[var(--accent)]" />
                      <span>{label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </nav>
      </div>

      {/* Right Controls */}
      <div className="navbar-end gap-3">
        {/* Theme Switcher Button */}
        <button
          type="button"
          onClick={() => setIsDark(!isDark)}
          className="btn btn-ghost btn-circle text-[var(--heading)] hover:bg-[var(--border)]/40 cursor-pointer"
          title="Toggle Light/Dark Theme"
        >
          {isDark ? (
            <Sun className="w-5 h-5 text-[var(--accent)]" />
          ) : (
            <Moon className="w-5 h-5 text-[var(--primary)]" />
          )}
        </button>

        {/* User Profile Dropdown */}
        {user ? (
          <div
            ref={profileRef}
            className="relative"
            onMouseEnter={() => setIsProfileOpen(true)}
            onMouseLeave={() => setIsProfileOpen(false)}
          >
            <button
              type="button"
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="btn btn-ghost rounded-xl flex items-center gap-2 border border-[var(--border)] bg-[var(--surface)] px-3.5 py-1.5 hover:bg-[var(--border)]/40 cursor-pointer shadow-sm"
            >
              <div className="w-7 h-7 rounded-lg bg-[var(--primary)] text-white font-bold text-xs flex items-center justify-center dark:bg-[var(--accent)] dark:text-[#0B1220]">
                {user.email?.charAt(0).toUpperCase() || "U"}
              </div>

              <span className="font-semibold text-xs text-[var(--heading)] hidden sm:inline">
                {user.email}
              </span>

              <ChevronDown
                className={`w-3.5 h-3.5 text-[var(--text-secondary)] transition-transform duration-200 ${isProfileOpen ? "rotate-180" : ""
                  }`}
              />
            </button>

            {isProfileOpen && (
              <div className="absolute right-0 top-full pt-1.5 z-[100] w-64">
                <div className="p-2 shadow-2xl bg-[var(--surface)] border border-[var(--border)] rounded-2xl flex flex-col gap-0.5 max-h-[380px] overflow-y-auto">
                  {/* PROFILE */}
                  <div className="px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-wider text-[var(--accent)]">
                    PROFILE
                  </div>

                  <button
                    type="button"
                    onClick={() => goTo("/profile")}
                    className="flex items-center gap-2.5 w-full text-left rounded-xl px-3 py-2 text-xs font-semibold text-[var(--text-primary)] hover:bg-[var(--border)]/50 cursor-pointer transition-colors"
                  >
                    <User className="w-4 h-4 text-[var(--accent)]" />
                    <span>User Profile</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => goTo("/business-profile")}
                    className="flex items-center gap-2.5 w-full text-left rounded-xl px-3 py-2 text-xs font-semibold text-[var(--text-primary)] hover:bg-[var(--border)]/50 cursor-pointer transition-colors"
                  >
                    <Building2 className="w-4 h-4 text-[var(--accent)]" />
                    <span>Business Profile</span>
                  </button>

                  <div className="border-t border-[var(--border)] my-1" />

                  {/* MANAGEMENT */}
                  <div className="px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-wider text-[var(--accent)]">
                    MANAGEMENT
                  </div>

                  <button
                    type="button"
                    onClick={() => goTo("/staff")}
                    className="flex items-center gap-2.5 w-full text-left rounded-xl px-3 py-2 text-xs font-semibold text-[var(--text-primary)] hover:bg-[var(--border)]/50 cursor-pointer transition-colors"
                  >
                    <Users className="w-4 h-4 text-[var(--accent)]" />
                    <span>Staff</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => goTo("/templates")}
                    className="flex items-center gap-2.5 w-full text-left rounded-xl px-3 py-2 text-xs font-semibold text-[var(--text-primary)] hover:bg-[var(--border)]/50 cursor-pointer transition-colors"
                  >
                    <FileText className="w-4 h-4 text-[var(--accent)]" />
                    <span>Templates</span>
                  </button>

                  <div className="border-t border-[var(--border)] my-1" />

                  {/* PREFERENCES */}
                  <div className="px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-wider text-[var(--accent)]">
                    PREFERENCES
                  </div>

                  <button
                    type="button"
                    onClick={() => goTo("/billing")}
                    className="flex items-center gap-2.5 w-full text-left rounded-xl px-3 py-2 text-xs font-semibold text-[var(--text-primary)] hover:bg-[var(--border)]/50 cursor-pointer transition-colors"
                  >
                    <CreditCard className="w-4 h-4 text-[var(--accent)]" />
                    <span>Subscription & Billing</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => goTo("/notifications")}
                    className="flex items-center gap-2.5 w-full text-left rounded-xl px-3 py-2 text-xs font-semibold text-[var(--text-primary)] hover:bg-[var(--border)]/50 cursor-pointer transition-colors"
                  >
                    <Bell className="w-4 h-4 text-[var(--accent)]" />
                    <span>Notification Settings</span>
                  </button>

                  <div className="border-t border-[var(--border)] my-1" />

                  {/* SUPPORT */}
                  <div className="px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-wider text-[var(--accent)]">
                    SUPPORT
                  </div>

                  <button
                    type="button"
                    onClick={() => goTo("/support/agent")}
                    className="flex items-center gap-2.5 w-full text-left rounded-xl px-3 py-2 text-xs font-semibold text-[var(--text-primary)] hover:bg-[var(--border)]/50 cursor-pointer transition-colors"
                  >
                    <Headphones className="w-4 h-4 text-[var(--accent)]" />
                    <span>Talk With Agent</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => goTo("/about")}
                    className="flex items-center gap-2.5 w-full text-left rounded-xl px-3 py-2 text-xs font-semibold text-[var(--text-primary)] hover:bg-[var(--border)]/50 cursor-pointer transition-colors"
                  >
                    <Info className="w-4 h-4 text-[var(--accent)]" />
                    <span>About App</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => goTo("/policies")}
                    className="flex items-center gap-2.5 w-full text-left rounded-xl px-3 py-2 text-xs font-semibold text-[var(--text-primary)] hover:bg-[var(--border)]/50 cursor-pointer transition-colors"
                  >
                    <ShieldCheck className="w-4 h-4 text-[var(--accent)]" />
                    <span>Policies</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => goTo("/help")}
                    className="flex items-center gap-2.5 w-full text-left rounded-xl px-3 py-2 text-xs font-semibold text-[var(--text-primary)] hover:bg-[var(--border)]/50 cursor-pointer transition-colors"
                  >
                    <HelpCircle className="w-4 h-4 text-[var(--accent)]" />
                    <span>Help & Support</span>
                  </button>

                  <div className="border-t border-[var(--border)] my-1" />

                  {/* SIGN OUT */}
                  <button
                    type="button"
                    onClick={() => {
                      setIsProfileOpen(false);
                      // TODO: call your actual signOut() here before redirecting
                      router.push("/login");
                    }}
                    className="flex items-center gap-2.5 w-full text-left rounded-xl px-3 py-2.5 text-xs font-bold text-rose-500 hover:bg-rose-500/10 cursor-pointer transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <button
            type="button"
            onClick={() => router.push("/login")}
            className="rounded-xl px-4 py-2.5 bg-[var(--primary)] text-white font-semibold hover:opacity-90 transition-all cursor-pointer"
          >
            Login
          </button>
        )}
      </div>
    </header>
  );
}
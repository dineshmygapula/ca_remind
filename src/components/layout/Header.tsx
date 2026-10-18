"use client";

import { useRef, useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { useRouter } from "nextjs-toploader/app";
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
  LucideIcon,
} from "lucide-react";
import { signOut } from "firebase/auth";
import { auth } from "@/config/firebase";
import { useAuth } from "@/context/AuthContext";
import { useWorkspace } from "@/context/WorkspaceContext";
import { Logo } from "../common/Logo";
import { useClickOutside } from "@/hooks/useClickOutside";

// ─── Constants ────────────────────────────────────────────────────────────────

const BUSINESS_ROUTES = [
  "/dashboard",
  "/tasks",
  "/task-definitions",
  "/reminders",
  "/clients",
  "/staff",
  "/templates",
];

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

type ProfileSection = {
  heading: string;
  items: {
    label: string;
    icon: LucideIcon;
    href?: string;
    onClick?: () => void;
  }[];
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function navItemClass(active: boolean) {
  const base =
    "rounded-xl px-4 py-2.5 flex items-center gap-2 transition-all cursor-pointer font-semibold text-sm";
  const on =
    "bg-[var(--primary)] text-white font-bold shadow-md dark:bg-[var(--accent)] dark:text-[#0B1220]";
  const off =
    "text-[var(--text-secondary)] hover:text-[var(--heading)] hover:bg-[var(--border)]/40";
  return `${base} ${active ? on : off}`;
}

function dropdownItemClass(active: boolean) {
  const base =
    "flex items-center gap-2.5 w-full text-left rounded-xl px-3 py-2 text-xs font-semibold transition-colors cursor-pointer";
  const on =
    "bg-[var(--primary)] text-white dark:bg-[var(--accent)] dark:text-[#0B1220]";
  const off = "text-[var(--text-primary)] hover:bg-[var(--border)]/50";
  return `${base} ${active ? on : off}`;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

interface NavButtonProps {
  label: string;
  icon: LucideIcon;
  active: boolean;
  onClick: () => void;
}

function NavButton({ label, icon: Icon, active, onClick }: NavButtonProps) {
  return (
    <button type="button" onClick={onClick} className={navItemClass(active)}>
      <Icon className="w-4 h-4" />
      <span>{label}</span>
    </button>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

interface PeopleDropdownProps {
  pathname: string | null;
  onNavigate: (href: string) => void;
}

function PeopleDropdown({ pathname, onNavigate }: PeopleDropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const isPeopleActive = PEOPLE_ITEMS.some((item) =>
    pathname?.startsWith(item.href),
  );

  useClickOutside([ref], () => setOpen(false));

  return (
    <div
      ref={ref}
      className="relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className={navItemClass(isPeopleActive)}
      >
        <Users className="w-4 h-4" />
        <span>People</span>
        <ChevronDown
          className={`w-3.5 h-3.5 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="absolute left-0 top-full pt-1 z-[100] w-44">
          <div className="p-2 shadow-2xl bg-[var(--surface)] border border-[var(--border)] rounded-2xl flex flex-col gap-1">
            {PEOPLE_ITEMS.map(({ label, href, icon: Icon }) => (
              <button
                key={href}
                type="button"
                onClick={() => {
                  onNavigate(href);
                  setOpen(false);
                }}
                className={dropdownItemClass(!!pathname?.startsWith(href))}
              >
                <Icon className="w-4 h-4 text-[var(--accent)]" />
                <span>{label}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

interface ProfileDropdownProps {
  email: string;
  onNavigate: (href: string) => void;
}

function ProfileDropdown({ email, onNavigate }: ProfileDropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useClickOutside([ref], () => setOpen(false));

  const handleSignOut = async () => {
    setOpen(false);
    await signOut(auth);
    router.push("/login");
  };

  const sections: ProfileSection[] = [
    {
      heading: "PROFILE",
      items: [
        { label: "User Profile", icon: User, href: "/user-profile" },
        {
          label: "Business Profile",
          icon: Building2,
          href: "/business-profile",
        },
      ],
    },
    {
      heading: "MANAGEMENT",
      items: [
        { label: "Staff", icon: Users, href: "/staff" },
        { label: "Templates", icon: FileText, href: "/templates" },
      ],
    },
    {
      heading: "PREFERENCES",
      items: [
        {
          label: "Subscription & Billing",
          icon: CreditCard,
          href: "/subscription",
        },
        { label: "Notification Settings", icon: Bell, href: "/notifications" },
      ],
    },
    {
      heading: "SUPPORT",
      items: [
        { label: "Talk With Agent", icon: Headphones, href: "/talkwithagent" },
        { label: "About App", icon: Info, href: "/aboutapp" },
        { label: "Policies", icon: ShieldCheck, href: "/policies" },
        { label: "Help & Support", icon: HelpCircle, href: "/help&support" },
      ],
    },
  ];

  return (
    <div
      ref={ref}
      className="relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="btn btn-ghost rounded-xl flex items-center gap-2 border border-[var(--border)] bg-[var(--surface)] px-3.5 py-1.5 hover:bg-[var(--border)]/40 cursor-pointer shadow-sm"
      >
        <div className="w-7 h-7 rounded-lg bg-[var(--primary)] text-white font-bold text-xs flex items-center justify-center dark:bg-[var(--accent)] dark:text-[#0B1220]">
          {email.charAt(0).toUpperCase()}
        </div>
        <span className="font-semibold text-xs text-[var(--heading)] hidden sm:inline">
          {email}
        </span>
        <ChevronDown
          className={`w-3.5 h-3.5 text-[var(--text-secondary)] transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>

      {/* Dropdown panel */}
      {open && (
        <div className="absolute right-0 top-full pt-1.5 z-[100] w-64">
          <div className="p-2 shadow-2xl bg-[var(--surface)] border border-[var(--border)] rounded-2xl flex flex-col gap-0.5 max-h-[380px] overflow-y-auto">
            {sections.map(({ heading, items }, idx) => (
              <div key={heading}>
                {idx > 0 && (
                  <div className="border-t border-[var(--border)] my-1" />
                )}

                <div className="px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-wider text-[var(--accent)]">
                  {heading}
                </div>

                {items.map(({ label, icon: Icon, href, onClick }) => (
                  <button
                    key={label}
                    type="button"
                    onClick={() => {
                      setOpen(false);
                      onClick ? onClick() : href && onNavigate(href);
                    }}
                    className="flex items-center gap-2.5 w-full text-left rounded-xl px-3 py-2 text-xs font-semibold text-[var(--text-primary)] hover:bg-[var(--border)]/50 cursor-pointer transition-colors"
                  >
                    <Icon className="w-4 h-4 text-[var(--accent)]" />
                    <span>{label}</span>
                  </button>
                ))}
              </div>
            ))}

            {/* Sign out */}
            <div className="border-t border-[var(--border)] my-1" />
            <button
              type="button"
              onClick={handleSignOut}
              className="flex items-center gap-2.5 w-full text-left rounded-xl px-3 py-2.5 text-xs font-bold text-rose-500 hover:bg-rose-500/10 cursor-pointer transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Root component ───────────────────────────────────────────────────────────

export function Header() {
  const [isDark, setIsDark] = useState(false);

  const router = useRouter();
  const pathname = usePathname();
  const { user, loading } = useAuth();
  const { businessId, orgId, status } = useWorkspace();

  // Redirect if on a business-scoped route without business or organization
  useEffect(() => {
    if (loading || status === "loading") return;
    const isBusinessRoute = BUSINESS_ROUTES.some(
      (route) => pathname === route || pathname?.startsWith(route + "/")
    );
    if (isBusinessRoute) {
      if (status === "no_org" || !orgId) {
        router.replace("/organization-create");
      } else if (status === "no_business" || !businessId) {
        router.replace("/business-create");
      }
    }
  }, [pathname, status, loading, orgId, businessId, router]);

  // Sync dark class on <html>
  const toggleTheme = () => {
    setIsDark((prev) => {
      const next = !prev;
      document.documentElement.classList.toggle("dark", next);
      return next;
    });
  };

  const goTo = (href: string) => {
    const isBusinessRoute = BUSINESS_ROUTES.some(
      (route) => href === route || href.startsWith(route + "/")
    );
    if (isBusinessRoute) {
      if (status === "no_org" || !orgId) {
        router.push("/organization-create");
        return;
      }
      if (status === "no_business" || !businessId) {
        router.push("/business-create");
        return;
      }
    }
    router.push(href);
  };

  return (
    <header className="navbar bg-[var(--surface)] border-b border-[var(--border)] px-4 sm:px-8 py-3 shadow-md transition-colors duration-300 sticky top-0 z-40">
      {/* Brand */}
      <Logo />

      {/* Desktop navigation */}
      <div className="flex-1 hidden lg:flex justify-center ml-8">
        <nav className="flex items-center gap-1.5 font-semibold text-sm">
          {NAV_ITEMS.map(({ label, href, icon }) => (
            <NavButton
              key={href}
              label={label}
              icon={icon}
              active={!!pathname?.startsWith(href)}
              onClick={() => goTo(href)}
            />
          ))}
          <PeopleDropdown pathname={pathname} onNavigate={goTo} />
        </nav>
      </div>

      {/* Right controls */}
      <div className="navbar-end gap-3">
        {/* Theme toggle */}
        <button
          type="button"
          onClick={toggleTheme}
          className="btn btn-ghost btn-circle text-[var(--heading)] hover:bg-[var(--border)]/40 cursor-pointer"
          title="Toggle Light/Dark Theme"
        >
          {isDark ? (
            <Sun className="w-5 h-5 text-[var(--accent)]" />
          ) : (
            <Moon className="w-5 h-5 text-[var(--primary)]" />
          )}
        </button>

        {/* User / Login */}
        {/* User / Login */}
        {loading ? (
          <div className="flex h-10 w-24 items-center justify-center">
            <span className="loading loading-spinner loading-md text-[var(--primary)] dark:text-[var(--accent)]" />
          </div>
        ) : user ? (
          <ProfileDropdown email={user.email ?? "U"} onNavigate={goTo} />
        ) : (
          <button
            type="button"
            onClick={() => goTo("/login")}
            className="rounded-xl px-4 py-2.5 bg-[var(--primary)] text-white font-semibold hover:opacity-90 transition-all cursor-pointer"
          >
            Login
          </button>
        )}
      </div>
    </header>
  );
}
